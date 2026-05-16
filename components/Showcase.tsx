import Link from 'next/link';
import { ArrowRight, Sparkles, ArrowUpRight } from 'lucide-react';
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
      <div className="absolute inset-0 bg-blueprint-dark bg-[length:48px_48px] opacity-20" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mono-label mb-3 !text-sand/70">Transformations</p>
          <h2 className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-5xl">
            Before &amp; after
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            Real spaces transformed by Naili. Hover to see the original.
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
                  className="group relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sand/30 hover:shadow-[0_8px_40px_rgba(216,185,138,0.15)]"
                >
                  {/* Image — show concept (after) as default, before on hover */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* After/concept image — shown by default */}
                    {afterImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={afterImage}
                        alt={`${category} AI concept`}
                        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
                      />
                    )}
                    {/* Before image — revealed on hover */}
                    {beforeImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={beforeImage}
                        alt={`${category} original`}
                        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite/80 via-transparent to-transparent" />

                    {/* Labels */}
                    <div className="absolute left-3 top-3 flex gap-2">
                      <span className="rounded-full border border-sand/30 bg-sand/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sand backdrop-blur-md transition-opacity group-hover:opacity-0">
                        AI concept
                      </span>
                      <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100">
                        Original
                      </span>
                    </div>

                    {/* Category + estimate overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-base font-bold text-white">{category}</div>
                      {estimate && (
                        <div className="mt-1 text-sm text-white/70">
                          {formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm font-semibold text-white/70 transition-colors group-hover:text-sand">
                      View full plan
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/40 transition-all group-hover:text-sand group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/my-projects" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:border-sand/30 hover:text-sand">
            View all projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
