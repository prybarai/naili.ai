/**
 * Image generation using OpenAI gpt-image-1
 *
 * Strategy:
 * - WITH reference photo: use image editing (inpainting) to transform
 *   the actual property while preserving structure
 * - WITHOUT reference photo: use image generation with a highly detailed prompt
 *
 * gpt-image-1 is significantly better than flux at:
 * 1. Following detailed instructions precisely
 * 2. Preserving structural elements in edit mode
 * 3. Photorealistic output that looks like real construction
 *
 * ⚠️ CRITICAL PRESERVATION RULE:
 * The AI must ONLY modify the specific scope requested. Every other element
 * must remain pixel-identical to the original photo. This is especially
 * important for landscaping (house must not change) and other categories.
 */

import OpenAI, { toFile } from 'openai';
import { type VisionAnalysis } from '@/lib/visionAnalysis';
import { extractDesignConstraints, type DesignConstraints } from '@/lib/designConstraints';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

const INTERIOR_CATEGORIES = new Set(['kitchen', 'bathroom', 'flooring', 'interior_paint', 'custom_project']);

const STYLE_DESCRIPTORS: Record<string, string> = {
  modern: 'modern style with clean lines, flat-panel cabinets, quartz surfaces, and matte black or brushed nickel hardware',
  traditional: 'traditional style with raised-panel cabinetry, warm wood tones, crown molding, and oil-rubbed bronze fixtures',
  minimal: 'minimalist style with handle-less cabinetry, monochromatic palette, hidden storage, and clean uncluttered surfaces',
  luxury: 'luxury style with custom cabinetry, marble or quartzite surfaces, statement lighting, and designer fixtures',
  warm_natural: 'warm natural style with wood-tone finishes, organic textures, terracotta or sage accents, and warm brass hardware',
  budget_refresh: 'budget-friendly refresh with painted cabinets, laminate countertops, updated hardware, and fresh paint',
};

/**
 * Aggressive preservation instruction for each category.
 * These are deliberately extreme to combat the AI's tendency to
 * hallucinate changes to areas outside the project scope.
 */
const PRESERVATION_INSTRUCTIONS: Record<string, string> = {
  kitchen: `CRITICAL: You are editing a PHOTO of a real kitchen. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME SPACE from the EXACT SAME CAMERA ANGLE, with ONLY the renovation changes visible. If a stranger saw these two photos side by side, they should believe it is the SAME ROOM after construction.

You MUST change ONLY: cabinets, countertops, backsplash, and hardware. 
ABSOLUTELY EVERYTHING ELSE MUST REMAIN IDENTICAL TO THE SOURCE PHOTO — do not add, remove, or alter any appliance, fixture, window, floor tile, wall color, ceiling, trim, lighting fixture, artwork, furniture, rug, or any other object visible in the kitchen.
The room dimensions, ceiling height, window size and position, floor area, appliance locations, walls, and structural elements must be pixel-perfect identical to the original photo.
The result must look like a real contractor's "after" photo taken from the exact same angle, position, and lighting as the original photo.`,

  bathroom: `CRITICAL: You are editing a PHOTO of a real bathroom. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME SPACE from the EXACT SAME CAMERA ANGLE, with ONLY the renovation changes visible. If a stranger saw these two photos side by side, they should believe it is the SAME ROOM after construction.

You MUST change ONLY: tile (floor and wall), vanity, toilet, and fixtures. 
ABSOLUTELY EVERYTHING ELSE MUST REMAIN IDENTICAL TO THE SOURCE PHOTO — do not add, remove, or alter any window, mirror, lighting, towel rack, shower curtain, wall color, ceiling, trim, or any other object.
The room dimensions, ceiling height, window size and position, door location, and structural elements must be pixel-perfect identical to the original photo.
The result must look like a real contractor's "after" photo taken from the exact same angle and position as the original photo.`,

  flooring: `CRITICAL: You are editing a PHOTO of a room. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME SPACE from the EXACT SAME CAMERA ANGLE, with ONLY the renovation changes visible. If a stranger saw these two photos side by side, they should believe it is the SAME ROOM after construction.

You MUST change ONLY the floor surface. 
ABSOLUTELY EVERYTHING ELSE MUST REMAIN IDENTICAL TO THE SOURCE PHOTO — every piece of furniture, every wall, every window, every door, every piece of trim, every lighting fixture, every rug, every item on the walls, every ceiling element must be pixel-perfect identical.
DO NOT change the color, texture, or appearance of any wall, furniture, or object. Only the floor covering changes.
The result must look like a real before/after flooring installation photo taken from the exact same angle.`,

  interior_paint: `CRITICAL: You are editing a PHOTO of a room. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME SPACE from the EXACT SAME CAMERA ANGLE, with ONLY the renovation changes visible.

You MUST change ONLY the paint color on the walls and trim. 
ABSOLUTELY EVERYTHING ELSE MUST REMAIN IDENTICAL TO THE SOURCE PHOTO — every piece of furniture, every floor surface, every window, every curtain, every artwork, every lighting fixture, every ceiling element must be pixel-perfect identical.
DO NOT add new furniture, remove objects, change flooring, or alter anything except wall and trim paint color.
The result must look like a real before/after painting photo taken from the exact same angle.`,

  roofing: `CRITICAL: You are editing a PHOTO of a house. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME HOUSE from the EXACT SAME CAMERA ANGLE, with ONLY the roofing changes visible. If a stranger saw these two photos side by side, they should believe it is the SAME HOUSE after construction.

You MUST change ONLY the roof surface and roofing materials. 
THE HOUSE MUST REMAIN COMPLETELY UNCHANGED. Preserve every brick, every window, every door, every siding panel, every gutter, every downspout, every porch detail, every structural element exactly as they appear in the source photo.
DO NOT alter the house structure, siding color, windows, doors, driveway, walkway, landscaping, trees, sky, neighboring houses, or any surroundings in ANY way.
Only modify the roof shingles/materials. Everything else must be pixel-perfect identical to the source image.
The result must look like a real roofing contractor's "after" photo of the exact same house.`,

  exterior_paint: `CRITICAL: You are editing a PHOTO of a house. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME HOUSE from the EXACT SAME CAMERA ANGLE, with ONLY the paint changes visible.

You MUST change ONLY the paint color of the siding, body, trim, and requested accent details.
THE HOUSE STRUCTURE MUST REMAIN COMPLETELY UNCHANGED. Preserve every window, every door, every roof shingle, every gutter, every downspout, every porch railing, every step, every structural element exactly as they appear.
DO NOT alter the roof, windows, doors, landscaping, driveway, neighboring homes, or any house structure in ANY way.
Color placement must be literal: body paint stays on body surfaces, trim paint stays on trim surfaces, accent stays on accent details only.
The final result must follow the requested body, trim, and accent colors exactly and look like a real contractor's after photo of the same house.`,

  deck_patio: `CRITICAL: You are editing a PHOTO of a property. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME PROPERTY from the EXACT SAME CAMERA ANGLE, with ONLY the deck/patio changes visible.

You MUST add or update ONLY the deck or patio area as requested.
THE HOUSE MUST REMAIN COMPLETELY UNCHANGED. Preserve every siding panel, window, door, roof shingle, gutter, and structural element exactly as they appear in the source photo.
DO NOT alter the house form, siding, windows, doors, roof, sky, neighbors' homes, landscape, fence lines, or existing yard layout in ANY way unless the scope explicitly includes those elements.
Only modify the deck/patio area. Everything else must be pixel-perfect identical to the source image.
The result must look like a real deck contractor's "after" photo.`,

  landscaping: `CRITICAL: You are editing a PHOTO of a property with landscaping. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME PROPERTY from the EXACT SAME CAMERA ANGLE, with ONLY the landscaping changes visible. If a stranger saw these two photos side by side, they should believe it is the SAME HOME after landscaping.

You MUST transform ONLY the lawn, garden beds, shrubs, and plantings.
THE HOUSE MUST REMAIN COMPLETELY UNCHANGED. Preserve every brick, every siding panel, every window, every door, every roof shingle, every gutter, every downspout, every porch step, every structural element exactly as they appear in the source photo.
DO NOT alter the house in ANY way — no changing siding color, window style, door color, roofline, gutters, foundation, or any building element.
Preserve every existing hardscape feature exactly: driveways, walkways, patios, steps, retaining walls, fence lines, and garage doors must remain pixel-perfect identical unless the homeowner explicitly requested hardscape changes in their notes.
Only modify the green areas — lawn, soil, mulch, flower beds, and plantings. Everything else must be pixel-perfect identical to the source image.
The result must look like a real landscaping contractor's "after" photo.`,

  custom_project: `CRITICAL: You are editing a PHOTO of a property. The original photo is the BEFORE — your edit is the AFTER. They MUST look like the EXACT SAME SPACE from the EXACT SAME CAMERA ANGLE, with ONLY the requested changes visible.

Apply ONLY the exact requested design update described by the homeowner.
ABSOLUTELY EVERYTHING NOT MENTIONED IN THE REQUEST MUST REMAIN IDENTICAL TO THE SOURCE PHOTO. The structural layout, room geometry, building envelope, and any visible elements not specifically listed for change must be pixel-perfect identical.
Prioritize the homeowner notes over generic style direction.
The result must look like a real contractor's realistic planning rendering from the same viewpoint as the original photo.`,
};

/**
 * Rich text prompts for the no-reference-image case.
 * Each prompt describes the specific renovation scenario IN DETAIL and includes
 * explicit preservation language about what stays the same.
 */
const TEXT_PROMPTS: Record<string, string> = {
  kitchen: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same space from the exact same camera angle, with only the renovation changes visible. Professional real estate photograph of a beautifully renovated kitchen with new cabinetry, countertops, backsplash, and updated hardware. High-end photography, photorealistic, no watermarks. CRITICAL: The ONLY changes are the cabinets, countertops, backsplash, and hardware. The room dimensions, ceiling height, window size and position, floor tiles, wall layout, appliance locations, and all structural elements remain exactly the same. The result must look like a real contractor after photo taken from the same angle as the original kitchen.',
  bathroom: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same space from the exact same camera angle, with only the renovation changes visible. Professional real estate photograph of a beautifully renovated bathroom with new floor and wall tile, updated vanity, modern toilet, and refreshed fixtures. High-end photography, photorealistic, no watermarks. CRITICAL: The ONLY changes are the tile (floor and wall), vanity, toilet, and fixtures. The room dimensions, ceiling height, window size and position, door location, and all structural elements remain exactly the same. The result must look like a real contractor after photo taken from the same angle as the original bathroom.',
  flooring: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same space from the exact same camera angle, with only the renovation changes visible. Professional interior design photograph of a room with brand new flooring installed throughout. Photorealistic, no watermarks. CRITICAL: The ONLY change is the floor surface material. Every piece of furniture, every wall, every window, every door, every piece of trim, every lighting fixture, every rug, every wall hanging, and every ceiling element remains exactly the same as before. DO NOT change the color, texture, or appearance of any wall, furniture, or object — only the floor covering changes. The result must look like a real before/after flooring installation photo.',
  interior_paint: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same space from the exact same camera angle, with only the renovation changes visible. Professional interior design photograph of a room freshly painted with updated wall and trim colors. Photorealistic, no watermarks. CRITICAL: The ONLY change is the paint color on the walls and trim. Every piece of furniture, every floor surface, every window, every curtain or blind, every artwork, every lighting fixture, every ceiling element remains exactly the same as before. DO NOT add new furniture, remove objects, change flooring, or alter anything except wall and trim paint color. The result must look like a real before/after painting photo.',
  roofing: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same house from the exact same camera angle, with only the renovation changes visible. Professional real estate photograph of a suburban home with a brand new roof installation. Photorealistic, no watermarks. CRITICAL: The ONLY change is the roof surface and roofing materials. The house structure, siding color and material, every window, every door, every gutter, every downspout, driveway, walkway, landscaping, trees, sky, and neighboring houses remain EXACTLY THE SAME as before. Only the roof shingles are new. The result must look like a real roofing contractor after photo of the exact same house.',
  exterior_paint: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same house from the exact same camera angle, with only the renovation changes visible. Professional real estate photograph of a home freshly repainted with updated body, trim, and accent colors for great curb appeal. Photorealistic, no watermarks. CRITICAL: The ONLY changes are the paint colors on the siding/body, trim, and accent details. The house structure, every window, every door, every roof shingle, every gutter, every downspout, every porch detail, every step, landscaping, driveway, and neighboring homes remain EXACTLY THE SAME as before. Color placement is literal: body paint stays on body surfaces, trim paint stays on trim surfaces. The result must look like a real professional paint contractor after photo.',
  deck_patio: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same property from the exact same camera angle, with only the renovation changes visible. Professional real estate photograph of a backyard with a brand new deck and outdoor living area. Photorealistic, no watermarks. CRITICAL: The ONLY addition is the deck/patio area. The house structure, every siding panel, every window, every door, every roof shingle, every gutter, the sky, neighboring homes, existing landscape, fence lines, and existing yard layout remain EXACTLY THE SAME as before. Only the deck/patio structure and surface is new. The result must look like a real deck contractor after photo.',
  landscaping: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same property from the exact same camera angle, with only the renovation changes visible. Professional real estate photograph of a home with beautifully landscaped grounds — manicured lawn, defined garden beds, and appropriate shrubs and plantings. Photorealistic, no watermarks. CRITICAL: The ONLY changes are in the green areas: lawn, soil, mulch, flower beds, and plantings. The house structure, every brick, every siding panel, every window, every door, every roof shingle, every gutter, driveway, walkways, patios, steps, retaining walls, fence lines, garage doors, and all hardscape remain EXACTLY THE SAME as before. THE HOUSE MUST NOT CHANGE AT ALL. The result must look like a real landscaping contractor after photo.',
  custom_project: 'IMPORTANT: The goal is a REALISTIC BEFORE AND AFTER. The original photo is the "before" — your image is the "after". They must look like the exact same space from the exact same camera angle, with only the renovation changes visible. Professional real estate style photograph of a realistic custom home improvement. Photorealistic, no watermarks. CRITICAL: Only the specific updates described by the homeowner have been made. The property structure, room geometry, building envelope, and all elements not mentioned in the scope remain EXACTLY THE SAME as before. The result must look like a real contractor planning rendering from the same perspective.',
};

const PRESERVED_SITE_FEATURES: Array<{ label: string; pattern: RegExp }> = [
  { label: 'driveway', pattern: /\bdriveway\b/i },
  { label: 'walkway', pattern: /\bwalkway\b|\bwalk\b|\bpath\b|\bsidewalk\b/i },
  { label: 'patio', pattern: /\bpatio\b|\bpavers?\b/i },
  { label: 'steps', pattern: /\bsteps?\b|\bstairs?\b/i },
  { label: 'retaining wall', pattern: /\bretaining\s+wall\b/i },
  { label: 'fence line', pattern: /\bfence\b/i },
  { label: 'garage door', pattern: /\bgarage\b/i },
];

function getPreservedSiteFeatures(analysis?: VisionAnalysis) {
  if (!analysis) return [];

  const haystack = [
    ...(analysis.visible_constraints || []),
    ...(analysis.visible_features || []),
    ...(analysis.architectural_features || []),
    analysis.photo_observations || '',
  ].join(' | ');

  return PRESERVED_SITE_FEATURES
    .filter(({ pattern }) => pattern.test(haystack))
    .map(({ label }) => label);
}

function hasExplicitHardscapeRequest(notes?: string) {
  return /(add|replace|remove|extend|widen|redo|rework|install|update|new)\s+[^.\n]{0,40}(driveway|walkway|path|sidewalk|patio|pavers|steps|stairs|retaining wall|hardscape)/i.test(notes || '')
    || /(driveway|walkway|path|sidewalk|patio|pavers|steps|stairs|retaining wall|hardscape)\s+[^.\n]{0,40}(add|replace|remove|extend|widen|redo|rework|install|update|new)/i.test(notes || '');
}

function buildExteriorPreservationGuidance(category: string, analysis?: VisionAnalysis, notes?: string) {
  if (!analysis || INTERIOR_CATEGORIES.has(category)) return '';

  const preservedFeatures = getPreservedSiteFeatures(analysis);
  const hardscapeRequested = hasExplicitHardscapeRequest(notes);

  if (category === 'landscaping' && !hardscapeRequested) {
    const featureText = preservedFeatures.length > 0 ? preservedFeatures.join(', ') : 'driveways, walkways, patios, and other hardscape';
    return `CRITICAL: Preserve every existing fixed-site element exactly, especially ${featureText}. Do not plant over them, narrow them, hide them, or replace them. Landscaping work may happen only in existing lawn, soil, mulch, or bed areas unless the homeowner explicitly requested hardscape changes. These elements must be pixel-perfect identical to the source photo.`;
  }

  if (preservedFeatures.length > 0 && !hardscapeRequested) {
    return `CRITICAL: Preserve these visible fixed-site features exactly — they must be pixel-perfect identical to the source photo: ${preservedFeatures.join(', ')}.`;
  }

  return '';
}

function buildAnalysisPromptContext(category: string, analysis?: VisionAnalysis): string {
  if (!analysis) return '';

  const facts: string[] = [];

  if (analysis.space_type) facts.push(`The visible space is a ${analysis.space_type.replace(/_/g, ' ')}.`);
  if (analysis.estimated_sqft) facts.push(`Visible project size reads as ${analysis.estimated_sqft}.`);
  if (analysis.current_condition && analysis.current_condition !== 'unknown') facts.push(`Current condition looks ${analysis.current_condition}.`);
  if (analysis.existing_style) facts.push(`Existing style reads as ${analysis.existing_style}.`);
  if (analysis.current_materials.length) facts.push(`Visible materials include ${analysis.current_materials.slice(0, 4).join(', ')}.`);
  if (analysis.architectural_features.length) facts.push(`Preserve architectural elements such as ${analysis.architectural_features.slice(0, 3).join(', ')}.`);
  if (analysis.renovation_scope) facts.push(`Requested design direction: ${analysis.renovation_scope}`);
  if (analysis.key_challenges.length) facts.push(`Key challenge: ${analysis.key_challenges[0]}.`);

  if (category === 'exterior_paint') {
    if (analysis.scope_signals.stories) facts.push(`This is a ${analysis.scope_signals.stories}-story house.`);
    if ((analysis.scope_signals.window_count_visible ?? 0) >= 6) facts.push('There are many front-facing windows. Preserve the structure and every visible window exactly — they must be pixel-perfect identical.');
    if (analysis.scope_signals.paint_complexity) facts.push(`The exterior has ${analysis.scope_signals.paint_complexity} paint complexity.`);
  } else if (category === 'roofing') {
    if (analysis.scope_signals.stories) facts.push(`This appears to be a ${analysis.scope_signals.stories}-story house.`);
    if (analysis.scope_signals.roof_complexity) facts.push(`The roof appears ${analysis.scope_signals.roof_complexity} complexity.`);
    facts.push('Keep the roofline, dormers, and house shape structurally consistent — they must be pixel-perfect identical to the source.');
  } else if (category === 'interior_paint') {
    if (analysis.scope_signals.room_size) facts.push(`This appears to be a ${analysis.scope_signals.room_size} room.`);
    if ((analysis.scope_signals.window_count_visible ?? 0) >= 4) facts.push('There are many windows. Change only wall and trim color. Preserve furniture, layout, and windows exactly — they must be pixel-perfect identical.');
    if (analysis.scope_signals.ceiling_height) facts.push(`Ceiling height appears ${analysis.scope_signals.ceiling_height}.`);
  } else if (category === 'deck_patio') {
    if (analysis.scope_signals.yard_size) facts.push(`The yard appears ${analysis.scope_signals.yard_size}.`);
    if (analysis.scope_signals.access_difficulty) facts.push(`Access appears ${analysis.scope_signals.access_difficulty}. Keep the house structure and surrounding yard context unchanged — pixel-perfect identical.`);
  } else if (category === 'landscaping') {
    if (analysis.scope_signals.yard_size) facts.push(`The visible yard scope appears ${analysis.scope_signals.yard_size}.`);
    if (analysis.visible_constraints?.length) facts.push(`Visible fixed-site constraints include ${analysis.visible_constraints.slice(0, 3).join(', ')}. These must be preserved exactly — pixel-perfect identical.`);
    const preservedFeatures = getPreservedSiteFeatures(analysis);
    if (preservedFeatures.length > 0) facts.push(`CRITICALLY PRESERVE these fixed features exactly — they must be pixel-perfect identical to the source: ${preservedFeatures.join(', ')}.`);
  }

  if (!facts.length) {
    if (analysis.property_type !== 'unknown') facts.push(`Existing property type appears to be ${analysis.property_type.replace(/_/g, ' ')}.`);
    if (analysis.visible_features.length) facts.push(`Preserve visible elements exactly — pixel-perfect: ${analysis.visible_features.slice(0, 3).join(', ')}.`);
  }

  return facts.slice(0, 6).join(' ');
}

function hasStrongExactConstraint(constraints: DesignConstraints) {
  return Boolean(
    constraints.bodyColor ||
    constraints.trimColor ||
    constraints.accentColor ||
    constraints.flooringMaterial ||
    constraints.deckMaterial ||
    constraints.roofColor ||
    constraints.cabinetColor ||
    constraints.countertopMaterial ||
    constraints.tileStyle
  );
}

export function buildConstraintText(category: string, constraints: DesignConstraints, notes?: string): string {
  const lines: string[] = [];

  if (category === 'exterior_paint') {
    if (constraints.bodyColor) lines.push(`Main body or siding color MUST BE EXACTLY ${constraints.bodyColor}.`);
    if (constraints.trimColor) lines.push(`Trim color MUST BE EXACTLY ${constraints.trimColor}.`);
    if (constraints.accentColor) lines.push(`Accent color MUST BE EXACTLY ${constraints.accentColor}.`);
    if (constraints.bodyColor || constraints.trimColor || constraints.accentColor) {
      lines.push('Color placement must be literal and EXACT: body stays on body surfaces, trim stays on trim, accents stay on accent details only. No substitutions, no deviations.');
    }
    if (constraints.accentColor === 'black' || constraints.trimColor === 'black') {
      lines.push('Do NOT substitute bronze, wood tone, or charcoal where black was requested. Black means pure black.');
    }
    if (constraints.roofColor && /\broof\b/i.test(notes || '')) {
      lines.push(`Only if roof changes were explicitly requested, the roof color MUST BE EXACTLY ${constraints.roofColor}.`);
    }
    if (lines.length > 0) lines.push('These user-specified exterior colors are MANDATORY and override all generic style language.');
  }

  if (category === 'deck_patio' && constraints.deckMaterial) {
    lines.push(`Deck or patio material MUST BE EXACTLY ${constraints.deckMaterial}. No substitutions.`);
  }

  if (category === 'flooring' && constraints.flooringMaterial) {
    lines.push(`Flooring material MUST BE EXACTLY ${constraints.flooringMaterial}. No substitutions.`);
  }

  if ((category === 'kitchen' || category === 'bathroom') && constraints.cabinetColor) {
    lines.push(`Cabinet or vanity color MUST BE EXACTLY ${constraints.cabinetColor}. No substitutions.`);
  }
  if ((category === 'kitchen' || category === 'bathroom') && constraints.countertopMaterial) {
    lines.push(`Countertop material MUST BE EXACTLY ${constraints.countertopMaterial}. No substitutions.`);
  }
  if ((category === 'kitchen' || category === 'bathroom') && constraints.tileStyle) {
    lines.push(`Tile style MUST BE EXACTLY ${constraints.tileStyle}. No substitutions.`);
  }

  if (category === 'roofing' && constraints.roofColor) {
    lines.push(`Roof color MUST BE EXACTLY ${constraints.roofColor}. No substitutions.`);
  }

  if (category === 'interior_paint') {
    if (constraints.bodyColor) lines.push(`Primary wall color MUST BE EXACTLY ${constraints.bodyColor}. No substitutions.`);
    if (constraints.trimColor) lines.push(`Trim color MUST BE EXACTLY ${constraints.trimColor}. No substitutions.`);
  }

  if (lines.length === 0 && notes) {
    return `Honor the user's notes EXACTLY where they specify materials, finishes, or colors: ${notes}. These are mandatory requirements.`;
  }

  if (constraints.explicitRequirements.length > 0) {
    lines.push(`Original user note (must follow exactly): ${constraints.explicitRequirements[0]}`);
  }

  return lines.join(' ');
}

function resolveCustomProjectCategory(category: string, analysis?: VisionAnalysis): string {
  if (category !== 'custom_project') return category;

  const trade = analysis?.suggested_trade;
  const locationType = analysis?.suggested_location_type;

  if (trade === 'paint') return locationType === 'exterior' ? 'exterior_paint' : 'interior_paint';
  if (trade === 'flooring') return 'flooring';
  if (trade === 'roofing') return 'roofing';
  if (trade === 'deck') return 'deck_patio';
  if (trade === 'landscaping') return 'landscaping';
  if (trade === 'bathroom') return 'bathroom';
  if (trade === 'kitchen') return 'kitchen';

  return 'custom_project';
}

function buildStyleGuidance(category: string, styleDesc: string, constraints: DesignConstraints, notes?: string) {
  const exactConstraintHeavy = hasStrongExactConstraint(constraints) || /exact|must be|specific|match/i.test(notes || '');
  if (category === 'custom_project') {
    return exactConstraintHeavy
      ? 'Use the homeowner notes as the DOMINANT instruction. Apply only very light stylistic interpretation where the notes leave room.'
      : `Use ${styleDesc} styling only where it does not conflict with the homeowner notes.`;
  }
  if (exactConstraintHeavy && (category === 'exterior_paint' || category === 'roofing' || category === 'flooring' || category === 'interior_paint' || category === 'deck_patio' || category === 'landscaping')) {
    return 'Keep style influence very light so exact requested colors and materials stay dominant and exact.';
  }
  return `Style guidance: ${styleDesc}. Apply this style ONLY to the scope of work, not to unchanged areas.`;
}

/**
 * Build an EXACT edit prompt with maximum preservation language.
 * This is the primary function for generating edit instructions.
 * Uses aggressive language to combat AI hallucination.
 */
function buildEditPrompt(
  category: string,
  style: string,
  notes?: string,
  analysis?: VisionAnalysis,
  extraGuidance?: string
): string {
  const resolvedCategory = resolveCustomProjectCategory(category, analysis);
  const styleDesc = STYLE_DESCRIPTORS[style] || style;
  const constraints = extractDesignConstraints(notes);
  const constraintText = buildConstraintText(resolvedCategory, constraints, notes);
  const analysisContext = buildAnalysisPromptContext(resolvedCategory, analysis);
  const preservationGuidance = buildExteriorPreservationGuidance(resolvedCategory, analysis, notes);

  const preservationInstruction = PRESERVATION_INSTRUCTIONS[resolvedCategory] || PRESERVATION_INSTRUCTIONS[category] || '';

  // For custom_project, generate dynamic preservation text
  let categoryInstruction = '';
  if (category === 'custom_project') {
    categoryInstruction = resolvedCategory === 'custom_project'
      ? 'Apply the requested custom design/update described by the homeowner. ABSOLUTELY EVERYTHING ELSE NOT REQUESTED MUST REMAIN PIXEL-PERFECT IDENTICAL TO THE SOURCE PHOTO.'
      : `Treat this custom project like a ${resolvedCategory.replace(/_/g, ' ')} scope. ${PRESERVATION_INSTRUCTIONS[resolvedCategory] || 'All unchanged areas must be pixel-perfect identical to the source.'}`;
  }

  const parts = [
    preservationInstruction,
    '=== ABSOLUTELY MANDATORY: ONLY MODIFY THE FOLLOWING SCOPE. EVERYTHING ELSE MUST BE PIXEL-PERFECT IDENTICAL TO THE SOURCE PHOTO. ===',
    analysisContext ? `STRUCTURAL PRESERVATION: ${analysisContext}` : '',
    preservationGuidance,
    constraintText ? `MANDATORY EXACT REQUIREMENTS: ${constraintText}` : '',
    categoryInstruction,
    buildStyleGuidance(category, styleDesc, constraints, notes),
    extraGuidance ? `Variation guidance: ${extraGuidance}` : '',
    'CRITICAL INSTRUCTION: The edited image must be a photorealistic ''after'' version that could be shown side-by-side with the original as a believable before-and-after. The camera angle, room layout, building structure, and all unrenovated elements must remain EXACTLY as in the original. If a stranger saw these two photos together, they should believe it''s the same space after construction.',
    '=== FINAL REMINDER: Do NOT hallucinate changes to anything outside the explicit scope. Every element not being modified must look exactly like the original photo. ===',
    'Return one highly believable concept, not multiple alternatives inside one image.',
  ].filter(Boolean).join('\n\n');

  return parts;
}

function buildTextPrompt(
  category: string,
  style: string,
  notes?: string,
  analysis?: VisionAnalysis,
  extraGuidance?: string
): string {
  const resolvedCategory = resolveCustomProjectCategory(category, analysis);
  const styleDesc = STYLE_DESCRIPTORS[style] || style;
  const basePrompt = TEXT_PROMPTS[resolvedCategory] || TEXT_PROMPTS[category] || 'Professional photograph of a home renovation.';
  const constraints = extractDesignConstraints(notes);
  const constraintText = buildConstraintText(resolvedCategory, constraints, notes);
  const analysisContext = buildAnalysisPromptContext(resolvedCategory, analysis);
  const preservationGuidance = buildExteriorPreservationGuidance(resolvedCategory, analysis, notes);

  return [
    basePrompt,
    '=== IMPORTANT: Only the scope items should appear changed. The property structure, dimensions, and all non-scope elements must remain realistic and consistent. ===',
    analysisContext ? `Structural preservation: ${analysisContext}` : '',
    preservationGuidance,
    constraintText ? `Mandatory exact requirements: ${constraintText}` : '',
    `Category: ${category === 'custom_project' ? 'custom project' : resolvedCategory.replace(/_/g, ' ')}.`,
    buildStyleGuidance(category, styleDesc, constraints, notes),
    extraGuidance ? `Presentation guidance: ${extraGuidance}` : '',
    'Generate one high-quality, photorealistic concept only.',
  ].filter(Boolean).join(' ');
}

async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateWithEdit(
  client: OpenAI,
  referenceImageUrl: string,
  category: string,
  style: string,
  notes?: string,
  analysis?: VisionAnalysis,
  extraGuidance?: string
): Promise<string | null> {
  try {
    const instruction = buildEditPrompt(category, style, notes, analysis, extraGuidance);
    console.log(`[OpenAI edit] category=${category} style=${style}`);
    console.log(`[OpenAI edit] instruction=${instruction.substring(0, 250)}...`);

    const imageBuffer = await fetchImageAsBuffer(referenceImageUrl);
    const imageFile = await toFile(imageBuffer, 'reference.jpg', { type: 'image/jpeg' });

    const response = await client.images.edit({
      model: 'gpt-image-1',
      image: imageFile,
      prompt: instruction,
      n: 1,
      size: '1024x1024',
      quality: 'high',
    });

    const imageData = response.data?.[0];
    if (!imageData) return null;

    if (imageData.b64_json) {
      return `data:image/png;base64,${imageData.b64_json}`;
    }
    if (imageData.url) {
      return imageData.url;
    }
    return null;
  } catch (err) {
    console.error('[OpenAI edit error]', err);
    return null;
  }
}

async function generateTextToImage(
  client: OpenAI,
  category: string,
  style: string,
  notes?: string,
  analysis?: VisionAnalysis,
  extraGuidance?: string
): Promise<string | null> {
  try {
    const prompt = buildTextPrompt(category, style, notes, analysis, extraGuidance);
    console.log(`[OpenAI generate] interior=${INTERIOR_CATEGORIES.has(category)} prompt=${prompt.substring(0, 220)}...`);

    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'high',
    });

    const imageData = response.data?.[0];
    if (!imageData) return null;
    if (imageData.b64_json) return `data:image/png;base64,${imageData.b64_json}`;
    if (imageData.url) return imageData.url;
    return null;
  } catch (err) {
    console.error('[OpenAI generate error]', err);
    return null;
  }
}

async function saveBase64ToSupabase(base64: string, projectId: string): Promise<string> {
  const { supabaseAdmin } = await import('./supabase/admin');
  const { v4: uuidv4 } = await import('uuid');

  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const filename = `generated/${projectId}/${uuidv4()}.png`;

  const { error } = await supabaseAdmin.storage
    .from('project-images')
    .upload(filename, buffer, { contentType: 'image/png', upsert: false });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from('project-images').getPublicUrl(filename);
  return data.publicUrl;
}

export async function generateConceptImages(params: {
  category: string;
  style: string;
  qualityTier: string;
  notes?: string;
  referenceImageUrl?: string;
  analysis?: VisionAnalysis;
  projectId: string;
  count?: number;
}): Promise<string[]> {
  const client = getClient();
  const requestedCount = params.count ?? 1;
  const count = Math.min(3, requestedCount || 1);
  const results: string[] = [];
  const variations = [
    'Present the result clearly with the scope changes visible. All unchanged areas must be pixel-perfect identical to the source photo.',
    'Create a slightly brighter variant while keeping the same scope changes. All unchanged areas must remain pixel-perfect identical to the source photo.',
    'Create a warmer-toned variant while keeping the same scope changes. All unchanged areas must remain pixel-perfect identical to the source photo.',
  ].slice(0, count);

  if (params.referenceImageUrl) {
    for (const variation of variations) {
      const result = await generateWithEdit(
        client,
        params.referenceImageUrl,
        params.category,
        params.style,
        params.notes,
        params.analysis,
        variation
      );
      if (!result) continue;
      try {
        const url = result.startsWith('data:')
          ? await saveBase64ToSupabase(result, params.projectId)
          : result;
        results.push(url);
      } catch {
        results.push(result);
      }
    }
  } else {
    for (const variation of variations) {
      const result = await generateTextToImage(
        client,
        params.category,
        params.style,
        params.notes,
        params.analysis,
        variation
      );
      if (!result) continue;
      try {
        const url = result.startsWith('data:')
          ? await saveBase64ToSupabase(result, params.projectId)
          : result;
        results.push(url);
      } catch {
        results.push(result);
      }
    }
  }

  return results.slice(0, count);
}
