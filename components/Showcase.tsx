import Link from 'next/link';
import { ArrowRight, Sparkles, Eye } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatCurrencyRange } from '@/lib/utils';

type ProjectRow = {
  id: string;
  project_category: string;
  created_at: string;
  uploaded_image_urls: string[] | null;
  generated_image_urls: string[] | null;
  notes?: string | null;
};

type EstimateRow = {
  project_id: string;
  low_estimate: number;
  high_estimate: number;
  created_at: string;
};

function friendlyCategory(raw: string) {
  const map: Record<string, string> = {
    custom_project: 'Home Project',
    bathroom: 'Bathroom',
    kitchen: 'Kitchen',
    roofing: 'Roofing',
    deck_patio: 'Deck & Patio',
    landscaping: 'Landscaping',
    exterior_paint: 'Exterior Paint',
    flooring: 'Flooring',
    general_repair: 'General Repair',
  };
  return map[raw] || raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function Showcase() {
  const { data: projectsData } = await supabaseAdmin
    .from('projects')
    .select('id, project_category, created_at, uploaded_image_urls, generated_image_urls, notes')
    .order('created_at', { ascending: false })
    .limit(6);

  const projects = ((projectsData || []) as ProjectRow[])
    .filter((p) => {
      const hasBefore = p.uploaded_image_urls?.[0]?.trim();
      const hasAfter = p.generated_image_urls?.[0]?.trim();
      return hasBefore && hasAfter && p.uploaded_image_urls?.[0] !== p.generated_image_urls?.[0];
    })
    .slice(0, 3);

  const projectIds = projects.map((p) => p.id);

  const { data: estimatesData } =
    projectIds.length > 0
      ? await supabaseAdmin
          .from('estimates')
          .select('project_id, low_estimate, high_estimate, created_at')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
      : { data: [] as EstimateRow[] };

  const estimateByProject = new Map<string, EstimateRow>();
  ((estimatesData as EstimateRow[] | null) || []).forEach((e) => {
    if (!estimateByProject.has(e.project_id)) estimateByProject.set(e.project_id, e);
  });

  return (
    <section className="section relative">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-panel bg-canvas-50/80 px-4 py-2">
            <Eye className="h-4 w-4 text-sand-dark" />
            <span className="text-sm font-semibold text-ink-600">Recent projects</span>
          </div>
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl lg:text-5xl">
            See what Naili can do
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-ink-600">
            Real projects analyzed by our AI — with design concepts, cost estimates, and materials lists.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-[2rem] border border-hairline bg-white p-12 text-center shadow-soft">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-sand-dark" />
            <h3 className="text-xl font-semibold text-ink">Projects coming soon</h3>
            <p className="mt-2 text-ink-600">Upload a photo above to be one of the first.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {projects.map((project) => {
              const estimate = estimateByProject.get(project.id);
              const beforeImage = project.uploaded_image_urls?.[0];
              const afterImage = project.generated_image_urls?.[0];
              const category = friendlyCategory(project.project_category);

              return (
                <Link
                  key={project.id}
                  href={`/vision/results/${project.id}`}
                  className="group overflow-hidden rounded-[1.5rem] border border-hairline bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] hover:-translate-y-1"
                >
                  {/* Image with before/after hover */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-canvas-200">
                    {beforeImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={beforeImage}
                        alt={`${category} before`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {afterImage && beforeImage && afterImage !== beforeImage && (
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={afterImage}
                          alt={`${category} concept`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Labels */}
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm">
                      {category}
                    </div>
                    {afterImage && afterImage !== beforeImage && (
                      <div className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                        Hover for concept
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-ink">{category}</h3>
                      <span className="text-xs text-ink-400">
                        {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {estimate && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas-50 px-4 py-2.5">
                        <span className="text-xs font-medium text-ink-500">Estimated cost</span>
                        <span className="text-sm font-bold text-ink">
                          {formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-sand-dark">
                      View full plan <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/my-projects" className="btn-ghost inline-flex items-center">
            View all projects <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
