import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import Anthropic from '@anthropic-ai/sdk';
import { type VisionAnalysis } from '../../../../lib/visionAnalysis';

const schema = z.object({
  project_id: z.string().uuid(),
  category: z.string(),
  style: z.string(),
  quality_tier: z.enum(['budget', 'mid', 'premium']),
  estimate_mid: z.number(),
  generated_image_url: z.string().optional(),
  analysis: z.unknown().optional(),
  notes: z.string().optional(),
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder' });

function getAnalysis(input: unknown): VisionAnalysis | undefined {
  if (!input || typeof input !== 'object') return undefined;
  return input as VisionAnalysis;
}

/* ── Build the AI prompt that demands REAL products ── */

function buildRealProductsPrompt(params: z.infer<typeof schema>, analysis?: VisionAnalysis, visualDescription?: string) {
  const tierGuide = params.quality_tier === 'budget'
    ? 'Focus on best-value products: store brands, builder-grade, and reliable budget picks from Home Depot, Lowe\'s, and Amazon.'
    : params.quality_tier === 'premium'
      ? 'Focus on premium products: designer brands, professional-grade, and high-end selections from specialty retailers, Build.com, Ferguson, and premium lines at Home Depot/Lowe\'s.'
      : 'Focus on solid mid-range products: well-reviewed name brands from Home Depot, Lowe\'s, and Amazon that balance quality and value.';

  const retailerGuide = `
RETAILER URL RULES (critical):
- Home Depot: https://www.homedepot.com/s/{product+name}
- Lowe's: https://www.lowes.com/search?searchTerm={product+name}
- Amazon: https://www.amazon.com/s?k={product+name}
- Build.com: https://www.build.com/search?term={product+name}
- Use SEARCH URLs, not direct product URLs, so the link always works.
- Every single line item MUST have a retailer and retailer_url.`;

  const analysisContext = analysis ? `
PHOTO ANALYSIS (use this to pick specific products that match):
- Space: ${analysis.space_type || 'unknown'}, ~${analysis.estimated_sqft || 'unknown'} sq ft
- Current materials: ${analysis.current_materials.join(', ') || 'none noted'}
- Current condition: ${analysis.current_condition || 'unknown'}
- Style: ${analysis.existing_style || 'unknown'}
- Features: ${analysis.architectural_features.join(', ') || 'none noted'}
- Scope: ${analysis.renovation_scope || 'unknown'}
- Challenges: ${analysis.key_challenges.join(', ') || 'none noted'}
- Observations: ${analysis.photo_observations || 'none noted'}
- Dimensions: ${JSON.stringify(analysis.estimated_dimensions)}
- Area signals: ${JSON.stringify(analysis.area_signals)}
- Scope signals: ${JSON.stringify(analysis.scope_signals)}` : '';

  return `You are a contractor and materials expert helping a homeowner build a REAL, shoppable materials list.

PROJECT:
- Category: ${params.category.replace(/_/g, ' ')}
- Style: ${params.style}
- Quality tier: ${params.quality_tier}
- Planning budget: $${params.estimate_mid.toLocaleString()}
${params.notes ? `- Homeowner notes: ${params.notes}` : ''}
${analysisContext}
${visualDescription ? `\nDESIGN CONCEPT shows: ${visualDescription}` : ''}

${tierGuide}

REQUIREMENTS:
1. Return 8-12 SPECIFIC, REAL products — not generic allowances or placeholders.
2. Every item must be a real product that exists and can be purchased:
   - REAL brand name (e.g., "Delta", "Behr", "LifeProof", "Pergo")
   - REAL product name (e.g., "Trinsic Single-Handle Pull-Down Faucet")
   - Specific color/finish (e.g., "Champagne Bronze", "Matte Black")
   - Real per-unit price
   - Real retailer name and search URL
3. Group items into these categories: "Primary Materials", "Fixtures & Hardware", "Finishes & Accessories", "Tools & Supplies"
4. For labor items, still include them but mark is_diy_friendly appropriately
5. Include a mix of materials AND the tools/supplies needed for DIY
6. install_note should be a 1-sentence DIY tip or pro recommendation
7. Make quantities realistic for the visible space size

${retailerGuide}

OUTPUT FORMAT — ONLY valid JSON, no markdown:
{
  "line_items": [
    {
      "category": "Primary Materials",
      "item": "LifeProof Sterling Oak Luxury Vinyl Plank",
      "brand": "LifeProof",
      "model": "Sterling Oak 8.7 in. W Waterproof LVP",
      "color_finish": "Sterling Oak",
      "quantity": 280,
      "unit": "sq ft",
      "unit_price": 3.69,
      "finish_tier": "${params.quality_tier}",
      "estimated_cost_low": 930,
      "estimated_cost_high": 1100,
      "retailer": "Home Depot",
      "retailer_url": "https://www.homedepot.com/s/LifeProof+Sterling+Oak+LVP",
      "is_diy_friendly": true,
      "install_note": "Click-lock install over existing subfloor — no glue needed.",
      "sourcing_notes": "Top-rated waterproof LVP. Order 10% extra for cuts and waste."
    }
  ],
  "sourcing_notes": "Complete shopping list for a mid-range bathroom refresh. All items available at Home Depot and Lowe's. Budget includes materials only — add $X–$Y for professional installation if not DIY."
}`;
}

/* ── Fallback with real product examples ── */

function fallbackMaterials(category: string, style: string, qualityTier: string, estimateMid: number, analysis?: VisionAnalysis) {
  const tier = qualityTier;

  if (category === 'bathroom') {
    const isBudget = tier === 'budget';
    const isPremium = tier === 'premium';
    return {
      line_items: [
        {
          category: 'Primary Materials',
          item: isPremium ? 'Daltile RevoTile Marble Look Porcelain' : isBudget ? 'MSI Carrara White 12x24 Ceramic Tile' : 'Marazzi Developed by Nature Calacatta Porcelain',
          brand: isPremium ? 'Daltile' : isBudget ? 'MSI' : 'Marazzi',
          model: isPremium ? 'RevoTile 12x24 Marble Look' : isBudget ? 'Carrara White 12x24' : 'Developed by Nature 12x24',
          color_finish: 'White / Marble Look',
          quantity: 80,
          unit: 'sq ft',
          unit_price: isPremium ? 6.49 : isBudget ? 1.99 : 3.49,
          finish_tier: tier,
          estimated_cost_low: Math.round(80 * (isPremium ? 5.5 : isBudget ? 1.7 : 2.9)),
          estimated_cost_high: Math.round(80 * (isPremium ? 7.0 : isBudget ? 2.3 : 3.8)),
          retailer: 'Home Depot',
          retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(isPremium ? 'Daltile RevoTile marble porcelain' : isBudget ? 'MSI Carrara White ceramic tile' : 'Marazzi Calacatta porcelain tile')}`,
          is_diy_friendly: true,
          install_note: 'Use a 1/4" notched trowel and tile spacers for even grout lines.',
          sourcing_notes: 'Order 15% extra for cuts around fixtures. Check lot numbers match for consistent color.',
        },
        {
          category: 'Fixtures & Hardware',
          item: isPremium ? 'Kohler Composed Single-Handle Faucet' : isBudget ? 'Glacier Bay Constructor Centerset Faucet' : 'Delta Trinsic Single Hole Faucet',
          brand: isPremium ? 'Kohler' : isBudget ? 'Glacier Bay' : 'Delta',
          model: isPremium ? 'Composed K-73167' : isBudget ? 'Constructor HD67091W-6A01' : 'Trinsic 559LF',
          color_finish: isPremium ? 'Vibrant Brushed Moderne Brass' : isBudget ? 'Chrome' : 'Matte Black',
          quantity: 1,
          unit: 'each',
          unit_price: isPremium ? 589 : isBudget ? 49 : 229,
          finish_tier: tier,
          estimated_cost_low: isPremium ? 520 : isBudget ? 42 : 199,
          estimated_cost_high: isPremium ? 620 : isBudget ? 55 : 249,
          retailer: isPremium ? 'Build.com' : 'Home Depot',
          retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(isPremium ? 'Kohler Composed faucet brass' : isBudget ? 'Glacier Bay Constructor faucet chrome' : 'Delta Trinsic faucet matte black')}`,
          is_diy_friendly: true,
          install_note: 'Shut off water supply valves under the sink before removing the old faucet.',
          sourcing_notes: 'Includes supply lines. Confirm sink hole count matches before ordering.',
        },
        {
          category: 'Fixtures & Hardware',
          item: isPremium ? 'Kohler Veil Intelligent Toilet' : isBudget ? 'Glacier Bay 2-Piece Round Toilet' : 'TOTO Drake II Two-Piece Elongated Toilet',
          brand: isPremium ? 'Kohler' : isBudget ? 'Glacier Bay' : 'TOTO',
          model: isPremium ? 'Veil K-5401' : isBudget ? 'N2316' : 'Drake II CST454CEFG',
          color_finish: 'White',
          quantity: 1,
          unit: 'each',
          unit_price: isPremium ? 2800 : isBudget ? 139 : 389,
          finish_tier: tier,
          estimated_cost_low: isPremium ? 2500 : isBudget ? 119 : 349,
          estimated_cost_high: isPremium ? 3100 : isBudget ? 159 : 429,
          retailer: 'Home Depot',
          retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(isPremium ? 'Kohler Veil intelligent toilet' : isBudget ? 'Glacier Bay round toilet' : 'TOTO Drake II elongated toilet')}`,
          is_diy_friendly: false,
          install_note: 'Hire a plumber for new rough-in work. DIY-able if replacing same-footprint toilet.',
          sourcing_notes: 'Includes wax ring and bolts. Measure rough-in distance (10" or 12") before ordering.',
        },
        {
          category: 'Fixtures & Hardware',
          item: isPremium ? 'Kohler Verdera Lighted Medicine Cabinet' : isBudget ? 'Glacier Bay 24 in. Frameless Mirror' : 'Home Decorators Sonoma 36 in. Vanity Mirror',
          brand: isPremium ? 'Kohler' : isBudget ? 'Glacier Bay' : 'Home Decorators',
          model: isPremium ? 'Verdera 34" Lighted' : isBudget ? '24 in. Beveled Frameless' : 'Sonoma 36 in.',
          color_finish: isPremium ? 'Anodized Aluminum' : isBudget ? 'Frameless' : 'Dark Charcoal',
          quantity: 1,
          unit: 'each',
          unit_price: isPremium ? 899 : isBudget ? 49 : 179,
          finish_tier: tier,
          estimated_cost_low: isPremium ? 799 : isBudget ? 39 : 149,
          estimated_cost_high: isPremium ? 949 : isBudget ? 55 : 199,
          retailer: 'Home Depot',
          retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(isPremium ? 'Kohler Verdera lighted medicine cabinet' : isBudget ? 'Glacier Bay frameless mirror 24' : 'Home Decorators Sonoma vanity mirror')}`,
          is_diy_friendly: true,
          install_note: 'Use a stud finder and toggle bolts for secure wall mounting.',
          sourcing_notes: 'Measure vanity width first to ensure mirror proportions look right.',
        },
        {
          category: 'Finishes & Accessories',
          item: isPremium ? 'Mapei Keracolor U Premium Unsanded Grout' : isBudget ? 'Custom Building Products Polyblend Sanded Grout' : 'Mapei Keracolor S Sanded Grout',
          brand: isPremium ? 'Mapei' : isBudget ? 'Custom Building Products' : 'Mapei',
          model: isPremium ? 'Keracolor U 10 lb.' : isBudget ? 'Polyblend #381 Bright White' : 'Keracolor S 25 lb.',
          color_finish: 'White / Bright White',
          quantity: 2,
          unit: 'bags',
          unit_price: isPremium ? 28 : isBudget ? 12 : 18,
          finish_tier: tier,
          estimated_cost_low: isPremium ? 48 : isBudget ? 20 : 30,
          estimated_cost_high: isPremium ? 62 : isBudget ? 28 : 42,
          retailer: 'Home Depot',
          retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(isPremium ? 'Mapei Keracolor unsanded grout' : isBudget ? 'Polyblend sanded grout bright white' : 'Mapei Keracolor sanded grout')}`,
          is_diy_friendly: true,
          install_note: 'Use unsanded for joints under 1/8", sanded for wider joints.',
          sourcing_notes: 'Seal grout after 72 hours for stain resistance.',
        },
        {
          category: 'Finishes & Accessories',
          item: isPremium ? 'Schluter DITRA Uncoupling Membrane' : isBudget ? 'Custom Building Products RedGard Waterproofing' : 'Custom Building Products RedGard Waterproofing',
          brand: isPremium ? 'Schluter' : 'Custom Building Products',
          model: isPremium ? 'DITRA 54 sq ft Roll' : 'RedGard 1 Gallon',
          color_finish: 'N/A',
          quantity: 1,
          unit: isPremium ? 'roll' : 'gallon',
          unit_price: isPremium ? 165 : isBudget ? 32 : 32,
          finish_tier: tier,
          estimated_cost_low: isPremium ? 145 : isBudget ? 28 : 28,
          estimated_cost_high: isPremium ? 185 : isBudget ? 38 : 38,
          retailer: 'Home Depot',
          retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(isPremium ? 'Schluter DITRA uncoupling membrane' : 'RedGard waterproofing membrane')}`,
          is_diy_friendly: true,
          install_note: 'Apply waterproofing to all wet areas before tiling — shower walls, floor, and curb.',
          sourcing_notes: 'Critical for preventing water damage. Do not skip this step.',
        },
        {
          category: 'Tools & Supplies',
          item: 'QEP 24 in. Tile Cutter with Tungsten Carbide Wheel',
          brand: 'QEP',
          model: '10630Q 24 in. Manual Tile Cutter',
          color_finish: 'N/A',
          quantity: 1,
          unit: 'each',
          unit_price: 59,
          finish_tier: tier,
          estimated_cost_low: 49,
          estimated_cost_high: 65,
          retailer: 'Home Depot',
          retailer_url: 'https://www.homedepot.com/s/QEP+24+inch+tile+cutter',
          is_diy_friendly: true,
          install_note: 'Score once firmly and snap — don\'t go back and forth on the same line.',
          sourcing_notes: 'Rent a wet saw from Home Depot ($50/day) for L-cuts and notches around pipes.',
        },
        {
          category: 'Tools & Supplies',
          item: 'DAP Kwik Seal Ultra Kitchen & Bath Caulk',
          brand: 'DAP',
          model: 'Kwik Seal Ultra 10.1 oz.',
          color_finish: 'White',
          quantity: 3,
          unit: 'tubes',
          unit_price: 7,
          finish_tier: tier,
          estimated_cost_low: 18,
          estimated_cost_high: 24,
          retailer: 'Home Depot',
          retailer_url: 'https://www.homedepot.com/s/DAP+Kwik+Seal+Ultra+caulk',
          is_diy_friendly: true,
          install_note: 'Cut the tip at 45 degrees and use painter\'s tape for clean lines.',
          sourcing_notes: 'Use silicone-based caulk in wet areas. Latex caulk for dry trim.',
        },
      ],
      sourcing_notes: `Complete shopping list for a ${tier}-tier bathroom refresh. All items available at major retailers. Prices are approximate and may vary by location. Add $2,000–$5,000 for professional installation if not doing DIY.`,
    };
  }

  // Generic fallback for other categories — still uses real brands
  const budget = estimateMid;
  return {
    line_items: [
      {
        category: 'Primary Materials',
        item: `${tier === 'premium' ? 'Premium' : tier === 'budget' ? 'Builder-grade' : 'Mid-range'} ${category.replace(/_/g, ' ')} materials package`,
        brand: 'Various',
        model: 'See sourcing notes',
        color_finish: style,
        quantity: 1,
        unit: 'lot',
        unit_price: Math.round(budget * 0.35),
        finish_tier: tier,
        estimated_cost_low: Math.round(budget * 0.28),
        estimated_cost_high: Math.round(budget * 0.4),
        retailer: 'Home Depot',
        retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(category.replace(/_/g, ' ') + ' materials')}`,
        is_diy_friendly: false,
        install_note: 'Get 3 contractor quotes using your Naili brief for the best price.',
        sourcing_notes: 'Planning-grade allowance. The AI will generate specific products once more project details are available.',
      },
      {
        category: 'Fixtures & Hardware',
        item: `${category.replace(/_/g, ' ')} fixtures and hardware`,
        brand: 'Various',
        model: 'See sourcing notes',
        color_finish: style,
        quantity: 1,
        unit: 'lot',
        unit_price: Math.round(budget * 0.15),
        finish_tier: tier,
        estimated_cost_low: Math.round(budget * 0.1),
        estimated_cost_high: Math.round(budget * 0.2),
        retailer: 'Home Depot',
        retailer_url: `https://www.homedepot.com/s/${encodeURIComponent(category.replace(/_/g, ' ') + ' fixtures')}`,
        is_diy_friendly: true,
        install_note: 'Most fixture swaps are beginner-friendly DIY projects.',
        sourcing_notes: 'Specific fixtures will be recommended based on your style preference.',
      },
      {
        category: 'Tools & Supplies',
        item: 'Installation supplies and consumables',
        brand: 'Various',
        model: 'Adhesives, fasteners, protection, cleanup',
        color_finish: 'N/A',
        quantity: 1,
        unit: 'lot',
        unit_price: Math.round(budget * 0.05),
        finish_tier: tier,
        estimated_cost_low: Math.round(budget * 0.03),
        estimated_cost_high: Math.round(budget * 0.07),
        retailer: 'Home Depot',
        retailer_url: 'https://www.homedepot.com/s/renovation+supplies',
        is_diy_friendly: true,
        install_note: 'Buy drop cloths, painter\'s tape, and a good utility knife before starting.',
        sourcing_notes: 'Budget for consumables that get used up during the project.',
      },
    ],
    sourcing_notes: `Planning-grade materials list for a ${tier}-tier ${category.replace(/_/g, ' ')} project. AI-generated specific products will replace these allowances once the full analysis is complete.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);
    const analysis = getAnalysis(params.analysis);

    // Optional: describe the concept image for better product matching
    let visualDescription = '';
    if (params.generated_image_url && !params.generated_image_url.startsWith('data:')) {
      try {
        const visionResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: `Describe the visible materials, finishes, colors, and fixtures in this ${params.category} design concept in 3 short sentences. Be specific about brands if recognizable.` },
              { type: 'image', source: { type: 'url', url: params.generated_image_url } },
            ],
          }],
        });
        const content = visionResponse.content[0];
        if (content.type === 'text') visualDescription = content.text;
      } catch (e) {
        console.error('Vision analysis for materials failed:', e);
      }
    }

    let materials: { line_items: unknown[]; sourcing_notes: string };
    try {
      const prompt = buildRealProductsPrompt(params, analysis, visualDescription);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: 'You are a licensed contractor and materials expert. You know real products, real brands, real prices, and real retailers. Output ONLY valid JSON with no markdown fences.',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response');
      const jsonStr = content.text.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();
      materials = JSON.parse(jsonStr) as { line_items: unknown[]; sourcing_notes: string };
    } catch (aiError) {
      console.error('materials ai fallback:', aiError);
      materials = fallbackMaterials(params.category, params.style, params.quality_tier, params.estimate_mid, analysis);
    }

    const { data, error } = await supabaseAdmin
      .from('material_lists')
      .insert({
        project_id: params.project_id,
        line_items: materials.line_items,
        sourcing_notes: materials.sourcing_notes,
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('projects').update({ status: 'materials_generated' }).eq('id', params.project_id);

    return NextResponse.json({ materials: data });
  } catch (error) {
    console.error('materials error:', error);
    return NextResponse.json({ error: 'Failed to generate materials list' }, { status: 500 });
  }
}
