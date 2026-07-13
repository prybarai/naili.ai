import { notFound } from 'next/navigation';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import VisionResultsView from '../../../../components/vision/VisionResultsView';
import type { Estimate, MaterialList, Project, ProjectBrief } from '../../../../types';

interface PageProps {
  params: Promise<{ project_id: string }>;
}

export const revalidate = 0;

function toTitleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanList(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.toLowerCase() !== 'null' && item.toLowerCase() !== 'undefined');
}

/* ── Humanize raw assumptions into user-friendly language ── */
function humanizeAssumptions(raw: string[]): string[] {
  return raw.map((s) => {
    // Room size / floor area
    if (/room planning assumption.*floor sq ft/i.test(s)) {
      const size = s.match(/^(small|medium|large)/i)?.[1] || 'medium';
      return `Based on a ${size}-sized room layout detected from your photo.`;
    }
    // Paintable wall area
    if (/paintable wall area/i.test(s)) return 'Wall area adjusted for doors, windows, and openings visible in your photo.';
    // Wall area signal
    if (/wall area signal/i.test(s)) return 'Wall coverage area estimated from visible surfaces in your photo.';
    // Opening deductions
    if (/opening deductions|window.*deductions/i.test(s)) return 'Cost adjusted for visible doors and windows that reduce paintable area.';
    // Ceiling height
    if (/vaulted ceiling/i.test(s)) return 'Vaulted ceilings detected — labor estimate increased for extra height.';
    if (/tall ceiling/i.test(s)) return 'Tall ceilings detected — labor estimate increased for extra height.';
    if (/standard ceiling/i.test(s)) return 'Standard ceiling height assumed.';
    // Scope
    if (/walls only scope/i.test(s)) return 'Estimate covers wall painting only.';
    if (/walls and ceiling/i.test(s)) return 'Estimate covers walls and ceiling.';
    if (/walls.*ceiling.*trim/i.test(s)) return 'Estimate covers walls, ceiling, and trim work.';
    // Photo reads as
    if (/uploaded photo reads as/i.test(s)) {
      const type = s.replace(/.*reads as a?\s*/i, '').replace(/_/g, ' ');
      return `Your photo appears to show a ${type}.`;
    }
    // Visible project size
    if (/visible project size/i.test(s)) {
      const size = s.replace(/.*around\s*/i, '');
      return `Estimated project scope: approximately ${size}.`;
    }
    // Current condition
    if (/current visible condition/i.test(s)) {
      const condition = s.replace(/.*appears\s*/i, '');
      return `Current condition appears ${condition}.`;
    }
    // Visible materials
    if (/visible materials include/i.test(s)) return s.charAt(0).toUpperCase() + s.slice(1) + '.';
    // Homeowner goal
    if (/homeowner goal interpreted/i.test(s)) {
      const goal = s.replace(/.*interpreted as:\s*/i, '');
      return `Your renovation goal: ${goal}`;
    }
    // Photo confidence
    if (/photo visibility confidence was low/i.test(s)) return 'Photo clarity was limited — estimate range is wider to account for uncertainty.';
    if (/photo visibility confidence was high/i.test(s)) return 'Clear photo — estimate is based closely on visible details.';
    if (/photo visibility confidence was moderate/i.test(s)) return 'Moderate photo clarity — standard estimation assumptions applied.';
    // Stories
    if (/story exterior/i.test(s)) {
      const stories = s.match(/(\d)-story/)?.[1] || '';
      return `Detected a ${stories}-story exterior from your photo.`;
    }
    // Room appears
    if (/room appears/i.test(s)) {
      const size = s.match(/appears\s+(\w+)/i)?.[1] || 'medium';
      return `Room size appears ${size} based on photo analysis.`;
    }
    // Roof complexity
    if (/roof complexity appears/i.test(s)) {
      const level = s.match(/appears\s+(\w+)/i)?.[1] || 'moderate';
      return `Roof complexity appears ${level} from the photo.`;
    }
    // Width/depth
    if (/visible width reads as/i.test(s)) {
      const w = s.replace(/.*reads as\s*/i, '').replace(/_/g, ' ');
      return `Space width appears ${w}.`;
    }
    if (/visible depth reads as/i.test(s)) {
      const d = s.replace(/.*reads as\s*/i, '').replace(/_/g, ' ');
      return `Space depth appears ${d}.`;
    }
    // Size cues
    if (/visible size cues/i.test(s)) return 'Size estimated from visible architectural cues in your photo.';
    // Key challenge
    if (/key visible challenge/i.test(s)) {
      const challenge = s.replace(/.*challenge:\s*/i, '');
      return `Key consideration: ${challenge}`;
    }
    // Photo observation
    if (/photo observation/i.test(s)) {
      const obs = s.replace(/.*observation:\s*/i, '');
      return obs.charAt(0).toUpperCase() + obs.slice(1);
    }
    // Photo-based planning note
    if (/photo-based planning note/i.test(s)) {
      const note = s.replace(/.*note:\s*/i, '');
      return note.charAt(0).toUpperCase() + note.slice(1);
    }
    // Finish tier multiplier
    if (/finish multiplier applied/i.test(s)) {
      const tier = s.match(/(budget|mid|premium)/i)?.[1] || 'mid';
      const tierLabel: Record<string, string> = { budget: 'Budget', mid: 'Mid-range', premium: 'Premium' };
      return `${tierLabel[tier.toLowerCase()] || 'Mid-range'} finish level selected.`;
    }
    // Using homeowner-selected size
    if (/using homeowner-selected/i.test(s)) return 'Using the room size you selected.';
    // Region multiplier
    if (/region.*multiplier/i.test(s) || /regional.*adjustment/i.test(s)) return 'Pricing adjusted for your local area.';
    // Demo required
    if (/demo.*required/i.test(s) || /demolition/i.test(s)) return 'Demolition and removal work included in the estimate.';
    // Bathroom-specific
    if (/mid refresh bathroom scope/i.test(s)) return 'Mid-range bathroom refresh — updating fixtures, surfaces, and finishes.';
    if (/full gut bathroom scope/i.test(s)) return 'Full bathroom renovation — complete tear-out and rebuild.';
    if (/cosmetic bathroom scope/i.test(s)) return 'Cosmetic bathroom update — paint, hardware, and accessories.';
    if (/bathroom size multiplier/i.test(s)) {
      const size = s.match(/(small|medium|large)/i)?.[1] || 'medium';
      return `${size.charAt(0).toUpperCase() + size.slice(1)}-sized bathroom based on photo analysis.`;
    }
    // Kitchen-specific
    if (/kitchen.*scope/i.test(s)) {
      if (/cabinet/i.test(s)) return 'Kitchen renovation including cabinet work and custom cabinetry.';
      if (/gut|full remodel|full renovation/i.test(s)) return 'Full kitchen remodel — complete tear-out and rebuild.';
      if (/cosmetic|refresh|simple/i.test(s)) return 'Cosmetic kitchen refresh — updating surfaces and hardware.';
      return 'Kitchen renovation scope based on photo analysis.';
    }
    // Roofing-specific
    if (/roofing.*scope/i.test(s) || /roof.*replacement/i.test(s)) return 'Roof replacement scope.';
    // Deck/patio
    if (/deck.*scope/i.test(s) || /patio.*scope/i.test(s)) return 'Outdoor deck or patio project scope.';
    // Flooring-specific
    if (/flooring.*scope/i.test(s)) return 'Flooring installation scope.';
    if (/lvp|laminate|hardwood|tile/i.test(s) && /material/i.test(s)) {
      const mat = s.match(/(lvp|laminate|hardwood|tile)/i)?.[1] || '';
      return `${mat.toUpperCase()} flooring material selected.`;
    }
    // Landscaping
    if (/landscaping.*scope/i.test(s)) return 'Landscaping project scope.';
    // Exterior paint
    if (/exterior.*paint.*scope/i.test(s)) return 'Exterior painting scope.';
    // Prep level
    if (/light prep/i.test(s)) return 'Light surface preparation included.';
    if (/medium prep/i.test(s)) return 'Moderate surface preparation included.';
    if (/heavy prep/i.test(s)) return 'Heavy surface preparation and repair included.';
    // Sq ft / area measurements — hide raw numbers
    if (/\d+\s*(sq ft|square feet|floor sq ft|wall sq ft)/i.test(s)) return 'Area measurements estimated from your photo.';
    // Multiplier / factor strings — hide internal math
    if (/multiplier|factor|adjustment.*applied/i.test(s)) return 'Pricing adjusted based on project scope.';
    // Planning assumption — generic catch
    if (/planning assumption/i.test(s)) return 'Based on standard planning assumptions for this project type.';
    // Signal strings — hide internal AI signals
    if (/area signal|size signal|scope signal/i.test(s)) return 'Project scope estimated from visible details in your photo.';
    // Deduction strings
    if (/deduction/i.test(s)) return 'Adjusted for openings and non-work areas.';
    // Allowance strings
    if (/allowance/i.test(s)) return 'Budget allowance included for this category.'
    // Flooring
    if (/flooring area/i.test(s)) return 'Flooring area estimated from visible room dimensions.';
    // Generic cleanup: replace underscores, capitalize first letter
    let cleaned = s.replace(/_/g, ' ');
    if (!cleaned.endsWith('.')) cleaned += '.';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  });
}

function humanizeRiskNotes(raw: string[]): string[] {
  return raw.map((s) => {
    let cleaned = s.trim();
    if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) cleaned += '.';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  });
}

/* ── Clean up raw internal strings in brief free-text fields ── */
function humanizeBriefText(text: string | undefined | null): string {
  if (!text) return '';
  let t = text;
  // Replace internal style tokens
  t = t.replace(/\bwarm_natural\b/gi, 'warm, natural');
  t = t.replace(/\bcool_modern\b/gi, 'cool, modern');
  t = t.replace(/\bclassic_traditional\b/gi, 'classic traditional');
  t = t.replace(/\bminimalist_clean\b/gi, 'minimalist');
  t = t.replace(/\bbold_dramatic\b/gi, 'bold, dramatic');
  t = t.replace(/\bcoastal_relaxed\b/gi, 'coastal relaxed');
  t = t.replace(/\brusstic_farmhouse\b/gi, 'rustic farmhouse');
  t = t.replace(/\bmid_century\b/gi, 'mid-century');
  t = t.replace(/\bcustom_project\b/gi, 'home project');
  t = t.replace(/\bdeck_patio\b/gi, 'deck and patio');
  t = t.replace(/\binterior_paint\b/gi, 'interior paint');
  t = t.replace(/\bexterior_paint\b/gi, 'exterior paint');
  // Remove internal signal strings
  t = t.replace(/Visible size cues suggest [^.]+\./gi, '');
  t = t.replace(/Size cues suggest [^.]+\./gi, '');
  t = t.replace(/\b(small|medium|large)\s+(wall area signal|floor area signal|roof area signal|yard area signal)[^,.]*/gi, '');
  t = t.replace(/\b(standard|narrow|wide)\s+(width|depth)[^,.]*/gi, '');
  t = t.replace(/\b(low|medium|high)\s+confidence\b/gi, '');
  // Clean up leftover commas and whitespace from removals
  t = t.replace(/,\s*,/g, ',');
  t = t.replace(/,\s*\./g, '.');
  t = t.replace(/\s{2,}/g, ' ');
  t = t.replace(/\. \./g, '.');
  return t.trim();
}

export async function generateMetadata({ params }: PageProps) {
  const { project_id } = await params;

  // Fetch project to get dynamic metadata values
  const projectRes = await supabaseAdmin.from('projects').select('project_category, zip_code').eq('id', project_id).single();
  const project = projectRes.data as { project_category: string; zip_code: string } | null;

  const categoryMap: Record<string, string> = {
    custom_project: 'Home Project', bathroom: 'Bathroom', kitchen: 'Kitchen',
    roofing: 'Roofing', deck_patio: 'Deck & Patio', landscaping: 'Landscaping',
    exterior_paint: 'Exterior Paint', flooring: 'Flooring', interior_paint: 'Interior Paint',
  };

  const catLabel = (project && categoryMap[project.project_category]) ||
    (project ? project.project_category.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Renovation');
  const zip = project?.zip_code || '';

  return {
    title: `${catLabel} Estimate — Naili`,
    description: `Review your complete ${catLabel.toLowerCase()} plan for ${zip ? `ZIP ${zip}` : 'your area'}. AI-powered estimate, materials list, and design concepts.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VisionResultsPage({ params }: PageProps) {
  const { project_id } = await params;

  // Load project (required) and auxiliary data (may be null if backend APIs haven't written yet)
  const [projectRes, estimateRes, materialsRes, briefRes] = await Promise.all([
    supabaseAdmin.from('projects').select('*').eq('id', project_id).single(),
    supabaseAdmin.from('estimates').select('*').eq('project_id', project_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from('material_lists').select('*').eq('project_id', project_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from('project_briefs').select('*').eq('project_id', project_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (!projectRes.data) notFound();

  const project = projectRes.data as Project;
  const rawEstimate = estimateRes.data as Estimate | null;
  const estimate = rawEstimate ? {
    ...rawEstimate,
    estimate_basis: humanizeBriefText(rawEstimate.estimate_basis),
  } as Estimate : null;
  const materials = materialsRes.data as MaterialList | null;
  const rawBrief = briefRes.data as ProjectBrief | null;
  const brief = rawBrief ? {
    ...rawBrief,
    summary: humanizeBriefText(rawBrief.summary),
    homeowner_goals: humanizeBriefText(rawBrief.homeowner_goals),
    contractor_notes: humanizeBriefText(rawBrief.contractor_notes),
  } as ProjectBrief : null;
  const categoryMap: Record<string, string> = {
    custom_project: 'Home Project',
    bathroom: 'Bathroom',
    kitchen: 'Kitchen',
    roofing: 'Roofing',
    deck_patio: 'Deck & Patio',
    landscaping: 'Landscaping',
    exterior_paint: 'Exterior Paint',
    flooring: 'Flooring',
    general_repair: 'General Repair',
    interior_paint: 'Interior Paint',
  };
  const categoryLabel = categoryMap[project.project_category] || toTitleCase(project.project_category);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naili.ai';
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  const shareUrl = `${baseUrl}/vision/results/${project_id}`;
  const estimateAssumptions = humanizeAssumptions(cleanList(estimate?.assumptions));
  const riskNotes = humanizeRiskNotes(cleanList(estimate?.risk_notes));
  const likelyTrades = cleanList((brief as ProjectBrief & { likely_trades?: string[] } | null)?.likely_trades);
  const siteQuestions = cleanList(brief?.site_verification_questions);

  // Concept images are already loaded from the project record (generated_image_urls)
  // which is passed through via the project object. No extra fetch needed.

  return (
    <VisionResultsView
      projectId={project_id}
      project={project}
      estimate={estimate}
      materials={materials}
      brief={brief}
      categoryLabel={categoryLabel}
      shareUrl={shareUrl}
      estimateAssumptions={estimateAssumptions}
      riskNotes={riskNotes}
      likelyTrades={likelyTrades}
      siteQuestions={siteQuestions}
    />
  );
}
