import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { getEstimatorFloor, getScopeMids } from '../../../../lib/pricing';
import { getRegionalPricingContext } from '../../../../lib/regionalPricing';
import { logApi, logApiError } from '../../../../lib/apiLog';

const schema = z.object({
  project_id: z.string().uuid(),
  quality_tier: z.enum(['budget', 'mid', 'premium']).optional(),
  style: z.string().optional(),
  notes: z.string().optional(),
  scope_selections: z.string().optional(),
  material_changes: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/vision/update-estimate
 *
 * Updates the project scope parameters and recalculates the estimate
 * using the same deterministic math as the original estimate route.
 * If quality_tier or style changed, also triggers concept regeneration.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> | undefined;
  try {
    body = await req.json();
    const params = schema.parse(body);

    // 1. Load existing project and estimate
    const [projectRes, estimateRes] = await Promise.all([
      supabaseAdmin.from('projects').select('*').eq('id', params.project_id).single(),
      supabaseAdmin.from('estimates').select('*').eq('project_id', params.project_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (projectRes.error || !projectRes.data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectRes.data;
    const currentEstimate = estimateRes.data;

    // 2. Merge new params with existing project data
    const updatedTier = params.quality_tier || project.quality_tier;
    const updatedStyle = params.style || project.style_preference || 'modern';
    const updatedNotes = params.notes !== undefined ? params.notes : project.notes;

    // Determine if concept needs regeneration
    const tierChanged = params.quality_tier && params.quality_tier !== project.quality_tier;
    const styleChanged = params.style && params.style !== project.style_preference;
    const needsRegen = tierChanged || styleChanged;

    // 3. Recalculate estimate using the same deterministic approach
    const regionContext = getRegionalPricingContext(project.zip_code);
    const category = project.project_category;
    const qualityMultiplier = getQualityMultiplier(updatedTier, category);

    // Use the existing estimate as a baseline and adjust proportionally
    if (currentEstimate) {
      const oldMultiplier = getQualityMultiplier(project.quality_tier, category);
      // Calculate a recalculated mid based on tier change and regional pricing
      const baseMid = currentEstimate.mid_estimate / (oldMultiplier * (currentEstimate.region_multiplier || 1));
      const newMid = Math.round(baseMid * qualityMultiplier * (currentEstimate.region_multiplier || 1));

      // Apply scope multiplier from notes if they changed
      let scopeMultiplier = 1;

      // First, apply scope_selections from CostPlayground toggles
      if (params.scope_selections) {
        const selected = params.scope_selections.split(',');
        // Each additional scope item adds ~5% scope adjustment
        const baseItems = selected.filter(
          s => ['permit_included', 'demo_included', 'design_consultation', 'standard_deck', 'standard_install', 'standard_replace', 'tear_off', 'lawn_beds', 'walls_only', 'full_exterior', 'full_gut', 'full_remodel', 'with_railing'].indexOf(s) === -1
        ).length;
        scopeMultiplier = 1 + baseItems * 0.05;

        // Specific scope items have predefined adjustments
        if (selected.includes('full_yard')) scopeMultiplier += 0.25;
        if (selected.includes('hardscape')) scopeMultiplier += 0.2;
        if (selected.includes('premium_materials') || selected.includes('premium_install')) scopeMultiplier += 0.12;
        if (selected.includes('subfloor_prep')) scopeMultiplier += 0.08;
        if (selected.includes('demo_included')) scopeMultiplier += 0.1;
        if (selected.includes('with_railing')) scopeMultiplier += 0.08;
        if (selected.includes('design_consultation')) scopeMultiplier += 0.04;
      }

      // Then overlay notes-based adjustment
      const text = (updatedNotes || '').toLowerCase();
      if (/(gut|full remodel|full renovation|layout change|move plumbing|structural|addition|custom)/.test(text)) {
        scopeMultiplier *= (category === 'kitchen' || category === 'bathroom' ? 1.35 : 1.2);
      } else if (/(repair|patch|touch up|small area|partial|single room|cosmetic|refresh|paint only)/.test(text)) {
        scopeMultiplier *= (category === 'kitchen' || category === 'bathroom' ? 0.8 : 0.85);
      }

      const adjustedMid = Math.round(newMid * scopeMultiplier);
      const spread = 0.16;
      const low = roundToHundred(adjustedMid * (1 - spread));
      const high = roundToHundred(adjustedMid * (1 + spread));
      const mid = roundToHundred(adjustedMid);

      // Build new assumptions
      const newAssumptions = [
        ...(currentEstimate.assumptions || []).filter(
          (a: string) => !/(quality|finish tier)/i.test(a)
        ),
        `${updatedTier} quality tier selected via cost playground`,
      ];

      if (params.notes) {
        newAssumptions.push('Updated scope notes applied');
      }

      // 4. Update the estimate in the database
      const { data: newEstimate, error: updateError } = await supabaseAdmin
        .from('estimates')
        .insert({
          project_id: params.project_id,
          low_estimate: Math.max(low, 100),
          mid_estimate: Math.max(mid, 100),
          high_estimate: Math.max(high, mid + 100),
          assumptions: newAssumptions,
          risk_notes: currentEstimate.risk_notes || [],
          estimate_basis: currentEstimate.estimate_basis || 'Recalculated estimate based on updated scope parameters.',
          region_multiplier: currentEstimate.region_multiplier || 1,
        })
        .select()
        .single();

      if (updateError) throw updateError;

      // 5. Update the project record
      await supabaseAdmin
        .from('projects')
        .update({
          quality_tier: updatedTier,
          style_preference: updatedStyle,
          notes: updatedNotes,
        })
        .eq('id', params.project_id);

      return NextResponse.json({
        estimate: {
          ...newEstimate,
          estimate_breakdown: buildBreakdown(newEstimate, category),
        },
        needs_regeneration: needsRegen,
      });
    }

    // No existing estimate — create a simple fallback
    const fallbackMid = roundToHundred(getCategoryBase(category) * qualityMultiplier);
    return NextResponse.json({
      estimate: {
        id: 'recalculated',
        project_id: params.project_id,
        low_estimate: roundToHundred(fallbackMid * 0.85),
        mid_estimate: fallbackMid,
        high_estimate: roundToHundred(fallbackMid * 1.15),
        assumptions: [`${updatedTier} quality tier selected`, `Standard ${category.replace(/_/g, ' ')} scope`],
        risk_notes: ['Verify all measurements and conditions onsite before committing to quotes.'],
        estimate_basis: 'Scope-based planning estimate recalculated from updated parameters.',
        region_multiplier: regionContext.multiplier,
        created_at: new Date().toISOString(),
      },
      needs_regeneration: needsRegen,
    });
  } catch (error) {
    logApiError('update-estimate', error, { projectId: body?.project_id });
    return NextResponse.json({ error: 'Failed to update estimate' }, { status: 500 });
  }
}

/* ── Helper functions ── */

function roundToHundred(value: number) {
  return Math.round(value / 100) * 100;
}

function getQualityMultiplier(tier: string, category?: string) {
  const categoryGroup = category === 'bathroom' || category === 'kitchen'
    ? 'remodel'
    : category === 'roofing' || category === 'deck_patio' || category === 'landscaping'
      ? 'exterior'
      : category === 'interior_paint' || category === 'flooring' || category === 'exterior_paint'
        ? 'finish'
        : 'default';

  const multipliers: Record<string, Record<string, number>> = {
    remodel: { budget: 0.9, mid: 1.0, premium: 1.22 },
    exterior: { budget: 0.92, mid: 1.0, premium: 1.18 },
    finish: { budget: 0.94, mid: 1.0, premium: 1.14 },
    default: { budget: 0.9, mid: 1.0, premium: 1.18 },
  };

  return (multipliers[categoryGroup] || multipliers.default)[tier] ?? 1.0;
}

function getCategoryBase(category: string): number {
  const bases: Record<string, number> = {
    roofing: 14000,
    exterior_paint: 6500,
    deck_patio: 13000,
    landscaping: 10000,
    kitchen: 42500,
    bathroom: 22000,
    flooring: 7000,
    interior_paint: 3500,
    custom_project: 9000,
  };
  return bases[category] ?? 10000;
}

function buildBreakdown(estimate: Record<string, unknown>, _category: string) {
  const mid = (estimate.mid_estimate as number) || 10000;
  const low = (estimate.low_estimate as number) || Math.round(mid * 0.85);
  const high = (estimate.high_estimate as number) || Math.round(mid * 1.15);
  const laborShare = 0.58;

  return {
    labor_low: roundToHundred(low * laborShare),
    labor_mid: roundToHundred(mid * laborShare),
    labor_high: roundToHundred(high * laborShare),
    materials_low: Math.max(low - roundToHundred(low * laborShare), 0),
    materials_mid: Math.max(mid - roundToHundred(mid * laborShare), 0),
    materials_high: Math.max(high - roundToHundred(high * laborShare), 0),
  };
}
