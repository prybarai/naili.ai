import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
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
    draft: { label: 'Getting Started', color: 'text-ink-500', bg: 'bg-canvas-200' },
    processing: { label: 'Analyzing', color: 'text-sand-dark', bg: 'bg-sand/15' },
    estimated: { label: 'Estimate Ready', color: 'text-sand-dark', bg: 'bg-sand/15' },
    materials_generated: { label: 'Almost Done', color: 'text-[#5BA88C]', bg: 'bg-mint/15' },
    brief_generated: { label: 'Plan Ready', color: 'text-[#5BA88C]', bg: 'bg-mint/15' },
    complete: { label: 'Plan Ready', color: 'text-[#5BA88C]', bg: 'bg-mint/15' },
    completed: { label: 'Plan Ready', color: 'text-[#5BA88C]', bg: 'bg-mint/15' },
    failed: { label: 'Needs Review', color: 'text-red-600', bg: 'bg-red-50' },
  };
  return map[raw] || { label: raw.replace(/_/g, ' '), color: 'text-ink-500', bg: 'bg-canvas-200' };
}

export default async function MyProjectsPage() {
  // Get the current authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated, redirect to login (middleware should catch this, but double-check)
  if (!user) {
    redirect('/auth/login?redirect=/my-projects');
  }

  // Only fetch projects belonging to this user
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
    <main className="relative z-10 min-h-screen bg-canvas">
      <Nav />
      <section className="px-6 pb-8 pt-28 sm:px-10 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">My projects</h1>
              <p className="mt-2 text-lg text-ink-600">
                {projects.length > 0
                  ? `${projects.length} project${projects.length !== 1 ? 's' : ''} — open any card to view your full plan.`
                  : 'Upload a photo to start your first project.'}
              </p>
            </div>
            <Link href="/#upload" className="btn-primary flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" /> New project
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-10">
        <div className="mx-auto max-w-6xl">
          {projects.length === 0 ? (
            <div className="rounded-[2rem] border border-hairline bg-white p-16 text-center shadow-soft">
              <Sparkles className="mx-auto mb-4 h-10 w-10 text-sand-dark" />
              <h2 className="text-2xl font-semibold text-ink">No projects yet</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-600">
                Upload a photo of any room or space and Naili will create a complete renovation plan with cost estimates, materials, and design concepts.
              </p>
              <Link href="/#upload" className="btn-primary mt-8 inline-flex">
                Start your first project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const estimate = estimateByProject.get(project.id);
                const previewImage = project.generated_image_urls?.[0] || project.uploaded_image_urls?.[0] || null;
                const category = friendlyCategory(project.project_category);
                const status = friendlyStatus(project.status);

                return (
                  <Link
                    key={project.id}
                    href={`/vision/results/${project.id}`}
                    className="group overflow-hidden rounded-[1.5rem] border border-hairline bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-canvas-200">
                      {previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewImage}
                          alt={category}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-ink-400 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm">
                        {category}
                      </div>
                      <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${status.bg} ${status.color}`}>
                        {status.label}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-ink-400">
                        <span>ZIP {project.zip_code}</span>
                        <span>
                          {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {estimate ? (
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas-50 px-4 py-3">
                          <span className="text-xs font-medium text-ink-500">Estimated cost</span>
                          <span className="text-sm font-bold text-ink">
                            {formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl bg-canvas-50 px-4 py-3 text-center text-xs text-ink-400">
                          Estimate pending...
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-sand-dark">
                        View plan <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
