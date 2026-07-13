import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

const schema = z.object({
  project_id: z.string().uuid(),
  zip_code: z.string().min(3).max(10),
  category: z.string(),
  style: z.string().optional(),
  quality_tier: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Generate a regional-market intelligence report for a given ZIP + category.
 * Returns fallback data if DeepSeek / external AI call fails.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);

    // Try to generate AI-powered report
    let report: {
      local_market_summary: string;
      comparable_sales_impact: string;
      contractor_density_note: string;
      permit_timeline_note: string;
      seasonal_pricing_note: string;
      material_availability_note: string;
    } | null = null;

    try {
      report = await generateReportWithAI(params);
    } catch (aiErr) {
      console.error('[intelligence-report] AI generation failed, using fallback:', aiErr);
    }

    // Fallback if AI failed or returned nothing useful
    if (!report) {
      report = generateFallbackReport(params.zip_code, params.category);
    }

    // Save to DB (best-effort, table may not exist)
    let savedReport = report;
    try {
      const { data, error } = await supabaseAdmin
        .from('intelligence_reports')
        .insert({
          project_id: params.project_id,
          local_market_summary: report.local_market_summary,
          comparable_sales_impact: report.comparable_sales_impact,
          contractor_density_note: report.contractor_density_note,
          permit_timeline_note: report.permit_timeline_note,
          seasonal_pricing_note: report.seasonal_pricing_note,
          material_availability_note: report.material_availability_note,
        })
        .select()
        .single();

      if (!error && data) {
        savedReport = data;
      }
    } catch {
      // Table may not exist — fall through to return report data anyway
    }

    return NextResponse.json({ report: savedReport });
  } catch (error) {
    console.error('[intelligence-report] error:', error);
    // Even on fatal error, return a fallback so the frontend never shows an empty state
    return NextResponse.json({
      report: {
        id: 'fallback',
        project_id: 'unknown',
        local_market_summary: 'Local market data could not be retrieved at this time. A standard baseline estimate has been applied.',
        comparable_sales_impact: 'Renovation projects in this category typically recoup 60–80% of costs at resale, though exact ROI depends on neighborhood comps.',
        contractor_density_note: 'Contractor availability varies by season and region. We recommend getting at least 3 quotes to compare pricing and availability.',
        permit_timeline_note: 'Permit timelines depend on local municipality workload. Most straightforward projects take 1–4 weeks for permit approval.',
        seasonal_pricing_note: 'Spring and early summer are peak season for most renovation work. Pricing may be more competitive in late fall and winter.',
        material_availability_note: 'Most common building materials are readily available in most markets. Specialty items may require longer lead times.',
        created_at: new Date().toISOString(),
      },
    });
  }
}

/* ── AI-powered generation ── */

async function generateReportWithAI(params: {
  zip_code: string;
  category: string;
  style?: string;
  quality_tier?: string;
  notes?: string;
}): Promise<{
  local_market_summary: string;
  comparable_sales_impact: string;
  contractor_density_note: string;
  permit_timeline_note: string;
  seasonal_pricing_note: string;
  material_availability_note: string;
} | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a renovation market intelligence analyst. Generate a concise market report for a ${params.category} renovation in ZIP code ${params.zip_code}${params.quality_tier ? ` with ${params.quality_tier} quality tier` : ''}${params.style ? ` and ${params.style} style` : ''}.

Provide exactly 6 fields, each 1–3 sentences. Be specific about this ZIP code area if you can infer anything, otherwise use general regional knowledge.

Fields:
1. local_market_summary — Cost of living and renovation cost context for this ZIP area
2. comparable_sales_impact — How this renovation type affects home resale value in this market
3. contractor_density_note — Estimated contractor availability and competition in the area
4. permit_timeline_note — Typical permit timeline for this project type in this region
5. seasonal_pricing_note — Best/worst time of year for this project in this climate zone
6. material_availability_note — Any supply chain considerations for materials needed

Return as plain JSON with keys: local_market_summary, comparable_sales_impact, contractor_density_note, permit_timeline_note, seasonal_pricing_note, material_availability_note.`;

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    console.error('[intelligence-report] DeepSeek API error:', res.status, await res.text());
    return null;
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  // Try to parse the JSON response
  try {
    const parsed = JSON.parse(content);
    if (
      parsed.local_market_summary &&
      parsed.comparable_sales_impact &&
      parsed.contractor_density_note &&
      parsed.permit_timeline_note &&
      parsed.seasonal_pricing_note &&
      parsed.material_availability_note
    ) {
      return parsed;
    }
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (
          parsed.local_market_summary &&
          parsed.comparable_sales_impact &&
          parsed.contractor_density_note &&
          parsed.permit_timeline_note &&
          parsed.seasonal_pricing_note &&
          parsed.material_availability_note
        ) {
          return parsed;
        }
      } catch { /* fall through to null */ }
    }
  }

  return null;
}

/* ── Fallback generation ── */

function getRegionFromZip(zip: string): string {
  const first = zip.trim().charAt(0);
  switch (first) {
    case '0': return 'Northeast';
    case '1': return 'Mid-Atlantic';
    case '2': return 'Southeast';
    case '3': return 'Midwest';
    case '4': return 'Southwest';
    case '5': return 'Mountain';
    case '6':
    case '7': return 'Pacific';
    default: return 'Continental US';
  }
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    kitchen: 'kitchen renovation',
    bathroom: 'bathroom renovation',
    roofing: 'roof replacement',
    exterior_paint: 'exterior painting',
    interior_paint: 'interior painting',
    flooring: 'flooring installation',
    deck_patio: 'deck or patio construction',
    landscaping: 'landscaping',
    custom_project: 'custom home project',
  };
  return labels[cat] || cat.replace(/_/g, ' ');
}

function generateFallbackReport(zip: string, category: string): {
  local_market_summary: string;
  comparable_sales_impact: string;
  contractor_density_note: string;
  permit_timeline_note: string;
  seasonal_pricing_note: string;
  material_availability_note: string;
} {
  const region = getRegionFromZip(zip);
  const cat = getCategoryLabel(category);

  const regionFlavor: Record<string, {
    market: string;
    contractor: string;
    permit: string;
    seasonal: string;
  }> = {
    'Northeast': {
      market: 'The Northeast tends to have higher labor and material costs due to dense urban markets, older housing stock, and stricter building codes. Renovation budgets here may need a 10–15% premium over national averages.',
      contractor: 'Contractor density is high in major metro areas like Boston, NYC, and Philadelphia, but top-rated pros book weeks in advance. In rural parts of the Northeast, options are more limited.',
      permit: 'Northeastern municipalities often have rigorous permitting processes. Expect 2–6 weeks for permit approval depending on local workload and historical district review if applicable.',
      seasonal: 'Construction season in the Northeast runs May–October for exterior work. Winter brings slower periods with potential discounts but also weather delays. Interior projects have more flexibility year-round.',
    },
    'Mid-Atlantic': {
      market: 'The Mid-Atlantic region has moderate-to-high renovation costs, with pricing influenced by proximity to DC, Baltimore, or the Philly metro. Labor rates are above national averages in urban cores.',
      contractor: 'Contractor availability is generally good across the Mid-Atlantic, though specialized trades may have longer lead times in exurban areas.',
      permit: 'Permit timelines in the Mid-Atlantic vary widely — urban areas process quickly (1–3 weeks), while rural counties may take 4–6 weeks.',
      seasonal: 'The Mid-Atlantic has four distinct seasons. Spring and fall are ideal for exterior work. Winter can offer contractor availability but carries weather risk for outdoor projects.',
    },
    'Southeast': {
      market: 'The Southeast generally has lower labor rates than national averages, but rapid population growth in Sun Belt metros has been driving renovation costs up. Materials are typically at or near national pricing.',
      contractor: 'Contractor density is high in growing metros like Atlanta, Charlotte, Nashville, and Florida cities. However, high demand means quality pros may have wait times of 3–6 weeks.',
      permit: 'Permitting in the Southeast is generally faster than the national average — many jurisdictions process simple permits in 1–2 weeks. Coastal areas may have additional requirements for storm resilience.',
      seasonal: 'The Southeast\'s mild winter means year-round construction is feasible. However, summer heat and hurricane season (June–November) can affect scheduling for exterior work.',
    },
    'Midwest': {
      market: 'The Midwest offers moderate renovation costs with lower labor rates in most markets outside Chicago. Material costs are near national averages. Overall project costs tend to be 5–10% below national medians.',
      contractor: 'Contractor availability is generally good in the Midwest outside of peak season. Many trades are available within 2–3 weeks in most markets.',
      permit: 'Midwest permit timelines are moderate at 1–4 weeks, with smaller cities processing faster than major metros like Chicago.',
      seasonal: 'The Midwest has a tight outdoor construction season from May to October. Winter brings deep discounts on interior work as contractors seek projects to fill slow months.',
    },
    'Southwest': {
      market: 'The Southwest has moderate renovation costs with growing metro areas (Dallas, Houston, Phoenix, Austin) seeing increased demand. Labor markets are competitive in fast-growing areas.',
      contractor: 'Contractor density varies significantly — dense in major metros, sparse in rural areas. Growing Sun Belt cities have high demand, so quality contractors may book 4–6 weeks out.',
      permit: 'Southwest permitting varies — Texas cities are generally fast (1–2 weeks), while other areas may take 3–4 weeks. HOA approvals can add time in planned communities.',
      seasonal: 'The Southwest allows year-round construction for most projects. Summer heat (June–August) can slow exterior work. Winter and early spring are ideal for outdoor renovations.',
    },
    'Mountain': {
      market: 'The Mountain region (Colorado, Utah, Arizona, Nevada) has seen significant cost increases driven by population growth. Labor rates are climbing to meet demand, especially in and around ski towns.',
      contractor: 'Contractor availability can be tight in resort towns and high-growth metros. Mountain areas have a shorter construction season, creating concentrated demand.',
      permit: 'Permit timelines vary — Denver and Salt Lake City process reasonably quickly (2–3 weeks). Rural mountain counties and historic districts can take longer.',
      seasonal: 'The Mountain region has the shortest outdoor construction season (June–September in higher elevations). Winter is slow for exterior work but offers opportunities for interior projects.',
    },
    'Pacific': {
      market: 'The Pacific region (California, Oregon, Washington, Hawaii) has the highest labor and material costs in the US, often 15–25% above national averages. Stringent energy codes and environmental regulations add to project costs.',
      contractor: 'Contractor density is high in coastal metros (LA, SF, Seattle, Portland), but demand outstrips supply for quality pros. Expect 4–8 week lead times for well-reviewed contractors.',
      permit: 'Permit timelines in the Pacific region are among the longest nationally — expect 3–8 weeks for straightforward projects. California cities and some Oregon jurisdictions have particularly rigorous review processes.',
      seasonal: 'The Pacific coast allows year-round exterior work in most areas, though Pacific Northwest winters bring rain delays. California\'s fire season (late summer/fall) can affect scheduling. Hawaii has consistent conditions year-round.',
    },
  };

  const currentRegion = regionFlavor[region] || regionFlavor['Midwest'];

  return {
    local_market_summary: `For ZIP ${zip} (${region}): ${currentRegion.market} This ${cat} project will reflect local labor and material pricing typical of this region.`,
    comparable_sales_impact: `In the ${region} market, a well-executed ${cat} typically recovers 60–85% of its cost at resale, depending on neighborhood price points and overall home value. Kitchens and bathrooms historically offer the best ROI in this region, while purely cosmetic upgrades may yield lower returns without other home improvements.`,
    contractor_density_note: currentRegion.contractor,
    permit_timeline_note: currentRegion.permit,
    seasonal_pricing_note: currentRegion.seasonal,
    material_availability_note: `In the ${region}, most standard ${cat} materials are readily available through major suppliers. Specialty items (custom cabinetry, imported tile, premium roofing materials) may require 2–5 week lead times. We recommend confirming material availability before committing to a contractor start date.`,
  };
}
