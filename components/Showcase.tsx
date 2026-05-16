import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
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
    bathroom: 'Bathroom Remodel',
    kitchen: 'Kitchen Refresh',
    roofing: 'Roof Replacement',
    deck_patio: 'Deck & Patio',
    landscaping: 'Landscaping',
    exterior_paint: 'Exterior Paint',
    flooring: 'New Flooring',
    general_repair: 'General Repair',
    interior_paint: 'Interior Paint',
  };
  return map[raw] || raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function Showcase() {
  const { data: projectsData } = await supabaseAdmin
    .from('projects')
    .select('id, project_category, created_at, uploaded_image_urls, generated_image_urls, notes')
    .order('created_at', { ascending: false })
    .limit(12);

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
    <section className="relative bg-graphite py-20 md:py-28">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-blueprint-dark bg-[length:48px_48px] opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mono-label mb-3 !text-mint/70">Recent projects</p>
          <h2 className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-5xl">
            See what Naili can do
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            Real projects analyzed by our AI — with design concepts, cost estimates, and materials lists.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-sand" />
            <h3 className="text-xl font-semibold text-white">Projects coming soon</h3>
            <p className="mt-2 text-white/50">Upload a photo above to be one of the first.</p>
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
                  className="group overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/8"
                >
                  {/* Image with hover reveal */}
                  <div className="relative aspect-[4/3] overflow-hidden">
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

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite/60 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {category}
                    </div>

                    {/* Hover hint */}
                    {afterImage && afterImage !== beforeImage && (
                      <div className="absolute bottom-3 left-3 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                        AI concept
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    {estimate && (
                      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-2.5">
                        <span className="text-xs font-medium text-white/50">Estimated cost</span>
                        <span className="text-sm font-bold text-white">
                          {formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm font-semibold text-sand transition-colors group-hover:text-sand-light">
                      View full plan <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/my-projects" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:border-white/25 hover:text-white">
            View all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
