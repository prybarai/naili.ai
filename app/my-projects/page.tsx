import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Sparkles, ArrowRight, Upload } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { formatCurrencyRange } from '@/lib/utils';
import { redirect } from 'next/navigation';

type ProjectRow = {
  id: string;
  project_category: string;
  zip_code: string;
  quality_tier: string;
  status: string;
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

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Projects — Naili',
  description: 'Your saved home projects with AI-powered estimates, concepts, and contractor briefs.',
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

function friendlyStatus(raw: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Getting Started', color: 'text-stone-500', bg: 'bg-stone-100' },
    processing: { label: 'Analyzing', color: 'text-amber-700', bg: 'bg-amber-50' },
    estimated: { label: 'Estimate Ready', color: 'text-amber-700', bg: 'bg-amber-50' },
    materials_generated: { label: 'Almost Done', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    brief_generated: { label: 'Plan Ready', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    complete: { label: 'Plan Ready', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    completed: { label: 'Plan Ready', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    failed: { label: 'Needs Review', color: 'text-red-600', bg: 'bg-red-50' },
  };
  return map[raw] || { label: raw.replace(/_/g, ' '), color: 'text-stone-500', bg: 'bg-stone-100' };
}

export default async function MyProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/my-projects');
  }

  const { data: projectsData } = await supabaseAdmin
    .from('projects')
    .select('id, project_category, zip_code, quality_tier, status, created_at, uploaded_image_urls, generated_image_urls, notes')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const projects = (projectsData || []) as ProjectRow[];
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
    <div className="relative z-10 min-h-screen bg-stone-50">
      <section className="px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-28 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-800 sm:text-4xl md:text-5xl">My projects</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-stone-500">
                {projects.length > 0
                  ? `${projects.length} project${projects.length !== 1 ? 's' : ''} — tap any card to view your full plan.`
                  : 'Upload a photo to start your first project.'}
              </p>
            </div>
            <Link
              href="/#upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-900 active:scale-95 flex-shrink-0"
            >
              <Plus className="h-4 w-4" /> New project
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          {projects.length === 0 ? (
            <div className="rounded-2xl sm:rounded-[2rem] border border-stone-200 bg-white p-10 sm:p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
                <Upload className="h-7 w-7 text-stone-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-stone-800">No projects yet</h2>
              <p className="mx-auto mt-2 sm:mt-3 max-w-md text-sm sm:text-base text-stone-500">
                Upload a photo of any room or space and Naili will create a complete renovation plan with cost estimates, materials, and design concepts.
              </p>
              <Link
                href="/#upload"
                className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-xl bg-stone-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-stone-900 active:scale-95"
              >
                Start your first project <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const estimate = estimateByProject.get(project.id);
                const previewImage = project.generated_image_urls?.[0] || project.uploaded_image_urls?.[0] || null;
                const category = friendlyCategory(project.project_category);
                const status = friendlyStatus(project.status);

                return (
                  <Link
                    key={project.id}
                    href={`/vision/results/${project.id}`}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      {previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewImage}
                          alt={category}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-stone-300 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur-sm">
                        {category}
                      </div>
                      <div className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${status.bg} ${status.color}`}>
                        {status.label}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span>ZIP {project.zip_code}</span>
                        <span>
                          {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {estimate ? (
                        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-stone-50 px-3.5 py-2.5">
                          <span className="text-xs font-medium text-stone-500">Estimated cost</span>
                          <span className="text-sm font-bold text-stone-800">
                            {formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2.5 rounded-xl bg-stone-50 px-3.5 py-2.5 text-center text-xs text-stone-400">
                          Estimate pending...
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center gap-1 text-sm font-semibold text-stone-600 group-hover:text-stone-800">
                        View plan <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
