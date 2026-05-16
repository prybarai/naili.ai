import { notFound } from 'next/navigation';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import VisionResultsView from '../../../../components/vision/VisionResultsView';
import type { Estimate, MaterialList, Project, ProjectBrief } from '../../../../types';

interface PageProps {
  params: Promise<{ project_id: string }>;
}

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
    // Bathroom-specific
    if (/mid refresh bathroom scope/i.test(s)) return 'Mid-range bathroom refresh — updating fixtures, surfaces, and finishes.';
    if (/full gut bathroom scope/i.test(s)) return 'Full bathroom renovation — complete tear-out and rebuild.';
    if (/cosmetic bathroom scope/i.test(s)) return 'Cosmetic bathroom update — paint, hardware, and accessories.';
    if (/bathroom size multiplier/i.test(s)) {
      const size = s.match(/(small|medium|large)/i)?.[1] || 'medium';
      return `${size.charAt(0).toUpperCase() + size.slice(1)}-sized bathroom based on photo analysis.`;
    }
    // Kitchen-specific
    if (/kitchen.*scope/i.test(s)) return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + '.';
    // Flooring
    if (/flooring area/i.test(s)) return 'Flooring area estimated from visible room dimensions.';
    // Generic cleanup: replace underscores, capitalize first letter
    let cleaned = s.replace(/_/g, ' ');
    if (!cleaned.endsWith('.')) cleaned += '.';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  });
}

function humanizeRiskNotes(raw: string[]): string[] {
  // Risk notes are already mostly human-readable, just ensure they end with periods
  return raw.map((s) => {
    let cleaned = s.trim();
    if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) cleaned += '.';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  });
}

export async function generateMetadata({ params }: PageProps) {
  const { project_id } = await params;
  return {
    title: 'Your Project Plan — Naili',
    description: 'Review your AI-powered project plan with cost estimates, design concepts, and contractor brief.',
    robots: { index: false, follow: false },
  };
}

export default async function VisionResultsPage({ params }: PageProps) {
  const { project_id } = await params;

  const [projectRes, estimateRes, materialsRes, briefRes] = await Promise.all([
    supabaseAdmin.from('projects').select('*').eq('id', project_id).single(),
    supabaseAdmin.from('estimates').select('*').eq('project_id', project_id).order('created_at', { ascending: false }).limit(1).single(),
    supabaseAdmin.from('material_lists').select('*').eq('project_id', project_id).order('created_at', { ascending: false }).limit(1).single(),
    supabaseAdmin.from('project_briefs').select('*').eq('project_id', project_id).order('created_at', { ascending: false }).limit(1).single(),
  ]);

  if (!projectRes.data) notFound();

  const project = projectRes.data as Project;
  const estimate = estimateRes.data as Estimate | null;
  const materials = materialsRes.data as MaterialList | null;
  const brief = briefRes.data as ProjectBrief | null;
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
  const shareUrl = `${appUrl}/vision/results/${project_id}`;
  const estimateAssumptions = humanizeAssumptions(cleanList(estimate?.assumptions));
  const riskNotes = humanizeRiskNotes(cleanList(estimate?.risk_notes));
  const likelyTrades = cleanList((brief as ProjectBrief & { likely_trades?: string[] } | null)?.likely_trades);
  const siteQuestions = cleanList(brief?.site_verification_questions);

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
