import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ImageAnnotation, MaterialLineItem } from '@/types';
import { logApi, logApiError } from '@/lib/apiLog';

export const maxDuration = 60;

const schema = z.object({
  image_url: z.string().url().optional(),
  materials: z.array(z.object({
    category: z.string(),
    item: z.string(),
    quantity: z.number(),
    unit: z.string(),
    finish_tier: z.string(),
    estimated_cost_low: z.number(),
    estimated_cost_high: z.number(),
    sourcing_notes: z.string().optional(),
  })).optional().default([]).transform((items): MaterialLineItem[] =>
    items.map(m => ({ ...m, sourcing_notes: m.sourcing_notes ?? '' }))
  ),
  category: z.string(),
});

// Fallback position map: realistic positions per category
// x, y are percentages (0-100). Origin is top-left.
const FALLBACK_POSITIONS: Record<string, Array<{ x: number; y: number }>> = {
  kitchen: [
    { x: 25, y: 55 },  // countertop
    { x: 50, y: 55 },  // center island/workspace
    { x: 75, y: 55 },  // backsplash area
    { x: 20, y: 30 },  // upper cabinets left
    { x: 60, y: 25 },  // upper cabinets right
    { x: 40, y: 85 },  // flooring
    { x: 80, y: 30 },  // appliances
    { x: 10, y: 80 },  // lower cabinets left
    { x: 50, y: 40 },  // sink area
    { x: 85, y: 70 },  // hardware/details
  ],
  bathroom: [
    { x: 30, y: 50 },  // vanity/mirror
    { x: 60, y: 75 },  // toilet
    { x: 50, y: 50 },  // sink/fixtures
    { x: 20, y: 85 },  // floor tile
    { x: 75, y: 40 },  // shower/tub wall
    { x: 50, y: 30 },  // medicine cabinet/lighting
    { x: 40, y: 60 },  // vanity counter
    { x: 25, y: 35 },  // wall tile
    { x: 70, y: 55 },  // towel bar/hardware
    { x: 85, y: 80 },  // base trim
  ],
  roofing: [
    { x: 50, y: 20 },  // roof peak
    { x: 30, y: 15 },  // left roof slope
    { x: 70, y: 15 },  // right roof slope
    { x: 50, y: 35 },  // ridge vent
    { x: 20, y: 25 },  // left gutter
    { x: 80, y: 25 },  // right gutter
    { x: 15, y: 10 },  // left eave
    { x: 85, y: 10 },  // right eave
    { x: 50, y: 5 },   // chimney/flashing
    { x: 35, y: 45 },  // fascia
  ],
  exterior_paint: [
    { x: 50, y: 35 },  // main body - center
    { x: 20, y: 25 },  // body left
    { x: 80, y: 25 },  // body right
    { x: 35, y: 50 },  // trim
    { x: 65, y: 50 },  // accent area
    { x: 50, y: 10 },  // gable/upper section
    { x: 10, y: 20 },  // left side body
    { x: 90, y: 20 },  // right side body
    { x: 50, y: 70 },  // foundation/garage
    { x: 40, y: 80 },  // door area
  ],
  deck_patio: [
    { x: 40, y: 45 },  // main deck surface
    { x: 60, y: 40 },  // deck extension
    { x: 30, y: 25 },  // railing left
    { x: 70, y: 25 },  // railing right
    { x: 50, y: 50 },  // center deck
    { x: 20, y: 60 },  // stairs/step
    { x: 50, y: 20 },  // pergola/overhead
    { x: 75, y: 70 },  // furniture zone
    { x: 25, y: 35 },  // post
    { x: 65, y: 55 },  // planter/landscaping edge
  ],
  landscaping: [
    { x: 50, y: 55 },  // lawn center
    { x: 20, y: 30 },  // garden bed left
    { x: 80, y: 30 },  // garden bed right
    { x: 30, y: 60 },  // shrub area left
    { x: 70, y: 60 },  // shrub area right
    { x: 15, y: 40 },  // tree/specimen plant
    { x: 50, y: 25 },  // foundation planting
    { x: 85, y: 50 },  // pathway edge
    { x: 40, y: 80 },  // ground cover
    { x: 60, y: 80 },  // mulch bed
  ],
  flooring: [
    { x: 50, y: 80 },  // main floor area
    { x: 25, y: 85 },  // floor left
    { x: 75, y: 85 },  // floor right
    { x: 50, y: 70 },  // transition area
    { x: 30, y: 75 },  // under furniture edge
    { x: 70, y: 75 },  // high-traffic area
    { x: 15, y: 90 },  // baseboard
    { x: 85, y: 90 },  // baseboard right
    { x: 40, y: 65 },  // rug zone
    { x: 60, y: 60 },  // entry point
  ],
  interior_paint: [
    { x: 50, y: 30 },  // main wall
    { x: 20, y: 25 },  // wall left
    { x: 80, y: 25 },  // wall right
    { x: 50, y: 55 },  // accent wall
    { x: 30, y: 40 },  // trim left
    { x: 70, y: 40 },  // trim right
    { x: 15, y: 50 },  // corner detail
    { x: 85, y: 50 },  // corner detail right
    { x: 50, y: 10 },  // ceiling edge
    { x: 35, y: 70 },  // door frame
  ],
  custom_project: [
    { x: 35, y: 30 },  // left mid
    { x: 65, y: 30 },  // right mid
    { x: 50, y: 50 },  // center
    { x: 25, y: 60 },  // bottom left
    { x: 75, y: 60 },  // bottom right
    { x: 50, y: 20 },  // top center
    { x: 20, y: 35 },  // left upper
    { x: 80, y: 35 },  // right upper
    { x: 30, y: 75 },  // lower left
    { x: 70, y: 75 },  // lower right
  ],
};

const CATEGORY_EMOJIS: Record<string, string> = {
  countertop: '🏗️',
  cabinetry: '🗄️',
  flooring: '🪵',
  paint: '🎨',
  tile: '🧱',
  fixtures: '🚿',
  appliances: '🔌',
  hardware: '🔩',
  lighting: '💡',
  plumbing: '🔧',
  electrical: '⚡',
  drywall: '🧱',
  trim: '🪚',
  windows: '🪟',
  doors: '🚪',
  roofing: '🏠',
  siding: '🧱',
  deck: '🪵',
  patio: '🧱',
  landscaping: '🌱',
  concrete: '🧱',
  insulation: '🧶',
  framing: '🪵',
  hvac: '❄️',
  demo: '🔨',
  permits: '📋',
  cleanup: '🧹',
};

function getEmojiForCategory(cat: string): string {
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (cat.toLowerCase().includes(key)) return emoji;
  }
  return '🔧';
}

function buildAnnotations(
  category: string,
  materials: MaterialLineItem[]
): ImageAnnotation[] {
  const positions = FALLBACK_POSITIONS[category] || FALLBACK_POSITIONS.custom_project;

  if (materials.length === 0) {
    // Return generic placeholder annotations
    return positions.slice(0, 5).map((pos, i) => ({
      materialName: `${category.replace(/_/g, ' ')} Area ${i + 1}`,
      category: category.replace(/_/g, ' '),
      x: pos.x,
      y: pos.y,
      price: 'TBD',
      quantity: 'Needs estimate',
    }));
  }

  return materials.map((material, i) => ({
    materialName: material.item,
    category: material.category,
    x: positions[i % positions.length].x + (i >= positions.length ? 5 : 0),
    y: positions[i % positions.length].y + (i >= positions.length ? 4 : 0),
    price: `\$${material.estimated_cost_low.toLocaleString()} – $${material.estimated_cost_high.toLocaleString()}`,
    shopUrl: undefined, // populated by DeepSeek enhancement if available
    quantity: `${material.quantity} ${material.unit}`,
  }));
}

function categorizeMaterial(item: string, cat: string): string {
  const lower = `${item} ${cat}`.toLowerCase();
  if (/countertop|counter|quartz|granite|marble|butcher/i.test(lower)) return 'countertop';
  if (/cabinet|pantry|drawer/i.test(lower)) return 'cabinetry';
  if (/floor|hardwood|tile|vinyl|laminat/i.test(lower)) return 'flooring';
  if (/paint|primer|stain|color|finish/i.test(lower)) return 'paint';
  if (/tile|backsplash|subway|ceramic/i.test(lower)) return 'tile';
  if (/faucet|shower|toilet|sink|vanity|fixture/i.test(lower)) return 'fixtures';
  if (/appliance|refrigerator|stove|oven|dishwasher|hood/i.test(lower)) return 'appliances';
  if (/handle|knob|pull|hinge|drawer\s+slide/i.test(lower)) return 'hardware';
  if (/light|sconce|pendant|chandelier/i.test(lower)) return 'lighting';
  if (/pipe|drain|p-trap|water\s+line|shutoff/i.test(lower)) return 'plumbing';
  if (/roof|shingle|underlaym|flashing|ridge/i.test(lower)) return 'roofing';
  if (/deck|composite|tread|stringer/i.test(lower)) return 'deck';
  if (/patio|pav(?:e|er)|stone|brick/i.test(lower)) return 'patio';
  if (/plant|shrub|flower|mulch|soil|seed|sod|tree/i.test(lower)) return 'landscaping';
  if (/concrete|cement|rebar|gravel/i.test(lower)) return 'concrete';
  if (/window|frame|sash|glazing/i.test(lower)) return 'windows';
  if (/door|jambs?|casing/i.test(lower)) return 'doors';
  if (/trim|baseboard|molding|crown/i.test(lower)) return 'trim';
  return cat;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = schema.parse(body);

    logApi('annotate-image', 'request', {
      category: params.category,
      materialCount: params.materials.length,
      hasImage: Boolean(params.image_url),
    });

    // Build annotations from the current project materials + category
    const annotations = buildAnnotations(params.category, params.materials);

    // Try DeepSeek Vision enhancement in background (don't block on it)
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    if (deepSeekKey && params.image_url && params.materials.length > 0) {
      // Fire and forget — if it succeeds, we could use it to improve annotations
      enhanceWithDeepSeek(params.image_url, params.materials, params.category).catch(() => {
        // Silently fall back to built annotations
      });
    }

    return NextResponse.json({ annotations });
  } catch (error) {
    logApiError('annotate-image', error);
    return NextResponse.json(
      { annotations: [], error: 'Failed to generate annotations' },
      { status: 500 }
    );
  }
}

/**
 * Optional DeepSeek Vision enhancement — runs in background,
 * doesn't block the response. Results could be cached/stored for future refinement.
 */
async function enhanceWithDeepSeek(
  _imageUrl: string,
  _materials: MaterialLineItem[],
  _category: string
): Promise<void> {
  // DeepSeek Vision integration placeholder
  // When DeepSeek Vision API is available, this would:
  // 1. Send the image + materials list to DeepSeek
  // 2. Ask it to identify where each material appears in the image
  // 3. Return refined (x, y) positions with confidence scores
  // 4. Store enhanced annotations for later use

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a renovation material annotation AI. Given an image URL and a list of renovation materials, identify where each material would appear in the image as percentage coordinates (x%, y% from top-left). Respond with a JSON array of {item, x, y}.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              image_url: _imageUrl,
              category: _category,
              materials: _materials.map(m => ({ item: m.item, category: m.category })),
            }),
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn('[annotate-image] DeepSeek enhancement failed:', response.status);
      return;
    }

    const data = await response.json();
    // DeepSeek response could refine positions — for now we just log success
    console.log('[annotate-image] DeepSeek enhancement completed');
  } catch (err) {
    console.warn('[annotate-image] DeepSeek enhancement error:', err);
  }
}
