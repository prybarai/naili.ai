import Link from 'next/link';
import { ArrowRight, Camera, Sparkles } from 'lucide-react';
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

  /* Pick projects that have both before and after images, deduplicate by category */
  const seen = new Set<string>();
  const projects = ((projectsData || []) as ProjectRow[])
    .filter((p) => {
      const hasBefore = p.uploaded_image_urls?.[0]?.trim();
      const hasAfter = p.generated_image_urls?.[0]?.trim();
      if (!hasBefore || !hasAfter || p.uploaded_image_urls?.[0] === p.generated_image_urls?.[0]) return false;
      // Deduplicate by category so we don't show 3 identical "Bathroom" cards
      if (seen.has(p.project_category)) return false;
      seen.add(p.project_category);
      return true;
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

  /* If all projects are the same category (e.g. all bathrooms), only show 1 featured */
  const featured = projects[0] || null;
  const showGrid = projects.length > 1;

  return (
    <section className="relative bg-graphite py-20 md:py-28">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-blueprint-dark bg-[length:48px_48px] opacity-20" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mono-label mb-3 !text-sand/70">See it in action</p>
          <h2 className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-5xl">
            From photo to plan in seconds
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            Upload a photo of any room. Get AI design concepts, cost estimates, and a full materials list.
          </p>
        </div>

        {!featured ? (
          /* No projects — show a compelling CTA */
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-sand" />
            <h3 className="text-xl font-semibold text-white">Be the first to try it</h3>
            <p className="mx-auto mt-2 max-w-md text-white/50">
              Upload a photo of your bathroom, kitchen, or any room and see what Naili can do.
            </p>
            <Link
              href="/#upload"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sand px-6 py-3 text-sm font-bold text-graphite transition-all hover:bg-sand-light hover:shadow-lg"
            >
              <Camera className="h-4 w-4" /> Upload your first photo
            </Link>
          </div>
        ) : showGrid ? (
          /* Multiple unique categories — show grid */
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
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {afterImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={afterImage} alt={`${category} AI concept`} className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0" />
                    )}
                    {beforeImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={beforeImage} alt={`${category} original`} className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite/80 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 flex gap-2">
                      <span className="rounded-full border border-sand/30 bg-sand/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sand backdrop-blur-md transition-opacity group-hover:opacity-0">AI concept</span>
                      <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100">Original</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-base font-bold text-white">{category}</div>
                      {estimate && (
                        <div className="mt-1 text-sm text-white/70">{formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm font-semibold text-white/70 transition-colors group-hover:text-sand">View full plan</span>
                    <ArrowRight className="h-4 w-4 text-white/40 transition-all group-hover:text-sand" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Single featured project — large hero-style card */
          <div className="mx-auto max-w-4xl">
            <Link
              href={`/vision/results/${featured.id}`}
              className="group block overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-sand/30 hover:shadow-[0_12px_48px_rgba(216,185,138,0.15)]"
            >
              <div className="grid md:grid-cols-2">
                {/* Before */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {featured.uploaded_image_urls?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.uploaded_image_urls[0]}
                      alt="Before"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite/60 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-md">
                    Before
                  </span>
                </div>
                {/* After */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {featured.generated_image_urls?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.generated_image_urls[0]}
                      alt="AI concept"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite/60 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-sand/30 bg-sand/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sand backdrop-blur-md">
                    AI concept
                  </span>
                </div>
              </div>

              {/* Info bar */}
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <div className="text-lg font-bold text-white">{friendlyCategory(featured.project_category)}</div>
                  {estimateByProject.get(featured.id) && (
                    <div className="mt-0.5 text-sm text-white/60">
                      Estimated {formatCurrencyRange(
                        estimateByProject.get(featured.id)!.low_estimate,
                        estimateByProject.get(featured.id)!.high_estimate
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-sand transition-all group-hover:gap-3">
                  View full plan <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/#upload"
            className="inline-flex items-center gap-2 rounded-full bg-sand px-7 py-3.5 text-sm font-bold text-graphite transition-all hover:bg-sand-light hover:shadow-lg"
          >
            <Camera className="h-4 w-4" /> Try it with your space
          </Link>
          <p className="mt-3 text-sm text-white/40">Free. No sign-up required.</p>
        </div>
      </div>
    </section>
  );
}
