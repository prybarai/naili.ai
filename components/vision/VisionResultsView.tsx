'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  PenSquare,
  Sparkles,
  TrendingUp,
  Wallet,
  Wrench,
} from 'lucide-react';
import posthog from 'posthog-js';
import { DISCLAIMERS } from '@/lib/disclaimers';
import { cn, formatCurrency, formatCurrencyRange } from '@/lib/utils';
import Disclaimer from '@/components/ui/Disclaimer';
import Badge from '@/components/ui/Badge';
import ShareButton from '@/components/vision/ShareButton';
import MaterialsAccordion from '@/components/vision/MaterialsAccordion';
import ConceptsLoader from '@/components/vision/ConceptsLoader';
import BeforeAfterSlider from '@/components/vision/BeforeAfterSlider';
import ProjectBriefDocument from '@/components/vision/ProjectBriefDocument';
import Button from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import type { Estimate, MaterialList, Project, ProjectBrief, SectionId } from '@/types';

/* ─── Props ─── */

interface Props {
  projectId: string;
  project: Project;
  estimate: Estimate | null;
  materials: MaterialList | null;
  brief: ProjectBrief | null;
  categoryLabel: string;
  shareUrl: string;
  estimateAssumptions: string[];
  riskNotes: string[];
  likelyTrades: string[];
  siteQuestions: string[];
}

/* ─── Helpers ─── */

function tierLabel(tier: Project['quality_tier']) {
  switch (tier) {
    case 'budget': return 'Budget';
    case 'premium': return 'Premium';
    default: return 'Mid-range';
  }
}

function regionSummary(multiplier?: number | null) {
  if (!multiplier || multiplier === 1) return 'National average';
  const pct = Math.round(Math.abs(multiplier - 1) * 100);
  return multiplier > 1 ? `${pct}% above avg` : `${pct}% below avg`;
}

function qualityTierCopy(tier: string) {
  const map: Record<string, string> = { budget: 'Practical finishes, standard materials', mid: 'Quality finishes, mid-range materials', premium: 'Premium finishes, high-end materials' };
  return map[tier] || 'Standard selections';
}

function regionNote(multiplier?: number | null) {
  if (!multiplier || multiplier === 1) return 'Near national average';
  const pct = Math.round(Math.abs(multiplier - 1) * 100);
  return multiplier > 1 ? `${pct}% above avg` : `${pct}% below avg`;
}

function derivePermitAllowance(estimate: Estimate) {
  return Math.round(estimate.mid_estimate * 0.05);
}

function deriveContingency(estimate: Estimate) {
  return Math.round(estimate.mid_estimate * 0.12);
}

export default function VisionResultsView({
  projectId,
  project,
  estimate: initialEstimate,
  materials: initialMaterials,
  brief: initialBrief,
  categoryLabel,
  shareUrl,
  estimateAssumptions,
  riskNotes,
  likelyTrades,
  siteQuestions,
}: Props) {
  const router = useRouter();

  /* ─── Polling for missing data ─── */
  const [estimate, setEstimate] = useState(initialEstimate);
  const [materials, setMaterials] = useState(initialMaterials);
  const [brief, setBrief] = useState(initialBrief);
  const [conceptImages, setConceptImages] = useState<string[]>(
    Array.isArray(project.generated_image_urls) ? project.generated_image_urls : []
  );
  const [pollCount, setPollCount] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const needsPolling = !estimate || !materials || !brief || conceptImages.length === 0;

  const pollForData = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/get?id=${projectId}`);
      if (!res.ok) return;
      const { project: updatedProject } = await res.json() as { project: Project };
      const newConcepts = Array.isArray(updatedProject.generated_image_urls)
        ? updatedProject.generated_image_urls
        : [];
      if (newConcepts.length > conceptImages.length) {
        setConceptImages(newConcepts);
      }
    } catch { /* silent */ }
    router.refresh();
    setPollCount((c) => c + 1);
  }, [conceptImages.length, projectId, router]);

  useEffect(() => {
    if (!needsPolling || pollCount >= 20) return;
    const delay = pollCount < 4 ? 8000 : pollCount < 10 ? 15000 : 30000;
    pollTimerRef.current = setTimeout(pollForData, delay);
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); };
  }, [needsPolling, pollCount, pollForData]);

  useEffect(() => {
    if (initialEstimate && !estimate) setEstimate(initialEstimate);
    if (initialMaterials && !materials) setMaterials(initialMaterials);
    if (initialBrief && !brief) setBrief(initialBrief);
  }, [initialEstimate, initialMaterials, initialBrief, estimate, materials, brief]);

  /* ─── State ─── */
  const originalImage = project.uploaded_image_urls?.[0];
  const hasAnyConcepts = conceptImages.length > 0;
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>('concepts');
  const [stickyVisible, setStickyVisible] = useState(false);

  /* ─── Scroll spy ─── */
  useEffect(() => {
    const handleScroll = () => {
      setStickyVisible(window.scrollY > 400);
      const sections: SectionId[] = ['concepts', 'estimate', 'materials', 'brief', 'next'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sections[i]}`);
        if (el && el.offsetTop - 120 <= window.scrollY) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: SectionId) => {
    const el = document.getElementById(`section-${id}`);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  /* ─── Analytics ─── */
  useEffect(() => {
    posthog.capture('naili_results_viewed', {
      project_id: projectId,
      zip_code: project.zip_code,
      project_category: project.project_category,
      quality_tier: project.quality_tier,
    });
  }, [project.project_category, project.quality_tier, project.zip_code, projectId]);

  /* ─── Derived ─── */
  const selectedConceptUrl = conceptImages[selectedConcept] || conceptImages[0] || null;
  const laborMid = estimate?.estimate_breakdown?.labor_mid ?? (estimate ? Math.round(estimate.mid_estimate * 0.58) : 0);
  const materialsMid = estimate?.estimate_breakdown?.materials_mid ?? (estimate ? Math.round(estimate.mid_estimate * 0.3) : 0);
  const permitsMid = estimate ? Math.round(estimate.mid_estimate * 0.05) : 0;
  const contingencyMid = estimate ? Math.round(estimate.mid_estimate * 0.12) : 0;
  const matchHref = `/get-quotes?project=${encodeURIComponent(projectId)}&zip=${encodeURIComponent(project.zip_code)}&category=${encodeURIComponent(project.project_category)}&estimate=${encodeURIComponent(String(estimate?.mid_estimate || ''))}`;
  const reviseHref = `/vision/start?${new URLSearchParams({
    from: projectId,
    category: project.project_category,
    zip: project.zip_code,
    style: project.style_preference || 'modern',
    quality: project.quality_tier,
    notes: project.notes || '',
    image: originalImage || '',
  }).toString()}`;

  /* ─── Regenerate materials ─── */
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const handleRegenerateMaterials = async () => {
    setIsRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch('/api/vision/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          category: project.project_category,
          style: project.style_preference || 'modern',
          quality_tier: project.quality_tier,
          estimate_mid: estimate?.mid_estimate || 20000,
          generated_image_url: conceptImages[0] || undefined,
          analysis: (project as any).analysis || undefined,
          notes: project.notes || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to regenerate');
      const { materials: newMaterials } = await res.json();
      setMaterials(newMaterials);
      posthog.capture('naili_materials_regenerated', { project_id: projectId });
    } catch (err) {
      setRegenError('Could not refresh materials. Please try again.');
      console.error('Regenerate materials error:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const readySections = [estimate, materials, brief, hasAnyConcepts ? true : null].filter(Boolean);
  const readyCount = readySections.length;
  const totalSections = 4;

  const donutSegments = estimate ? [
    { label: 'Labor', value: laborMid, color: '#D8B98A' },
    { label: 'Materials', value: materialsMid, color: '#B8D8C8' },
    { label: 'Permits', value: permitsMid, color: '#93C5FD' },
    { label: 'Contingency', value: contingencyMid, color: '#E5E7EB' },
  ] : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1b1d22_0%,#242831_46%,#1b1d22_100%)] px-6 py-8 text-white shadow-[0_24px_90px_rgba(15,23,42,0.26)] print:hidden sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,185,138,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(184,216,200,0.14),transparent_24%)]" />
        <div className="relative">
          {/* Badge line */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="blue" className="border-white/15 bg-white/10 text-white">naili vision</Badge>
            <Badge variant="gray" className="border-white/15 bg-white/10 text-white">{categoryLabel}</Badge>
            <Badge variant={estimate || materials || brief ? 'green' : 'amber'}>
              {estimate || materials || brief ? 'Plan ready' : 'Still generating'}
            </Badge>
          </div>

          {/* Estimate range — the hero */}
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              {estimate ? formatCurrencyRange(estimate.low_estimate, estimate.high_estimate) : 'Preparing your estimate…'}
            </h1>
            <p className="mt-3 text-base text-white/70 sm:text-lg">
              {estimate
                ? `Your ${categoryLabel.toLowerCase()} estimate, grounded in your photo, finish level, and ZIP code.`
                : 'Your estimate and brief are being built from your photo and project details.'}
            </p>
          </div>

          {/* Mini badges */}
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/80">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 backdrop-blur">
              <MapPin className="h-4 w-4" /> ZIP {project.zip_code}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 backdrop-blur">
              <Sparkles className="h-4 w-4" /> {project.quality_tier} tier
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 backdrop-blur">
              <Wrench className="h-4 w-4" /> {materials?.line_items?.length || '—'} line items
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <ShareButton shareUrl={shareUrl} variant="dark" />
            <Button
              className="border border-white/20 bg-white/10 text-white hover:bg-white/15"
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-4 w-4" /> Print
            </Button>
            <Link
              href={reviseHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <PenSquare className="mr-2 h-4 w-4" /> Refine
            </Link>
            <Link
              href={matchHref}
              onClick={() => posthog.capture('naili_match_cta_clicked', { project_id: projectId, placement: 'hero' })}
              className="inline-flex items-center justify-center rounded-xl bg-canvas-50 px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition-opacity hover:opacity-95"
            >
              Get Quotes <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Local context banner ── */}
      <section className="mt-5 grid gap-3 print:hidden md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-500"><Wallet className="h-4 w-4 text-sand-dark" /> Smart estimate</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">{estimate ? formatCurrencyRange(estimate.low_estimate, estimate.high_estimate) : 'Still preparing'}</div>
          <p className="mt-2 text-sm text-slate-600">Photo-aware cost planning grounded in your finish tier and ZIP code.</p>
        </div>
        <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-500"><FileText className="h-4 w-4 text-sand-dark" /> Contractor brief</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">{brief ? 'Ready to share before quotes' : 'Still drafting'}</div>
          <p className="mt-2 text-sm text-slate-600">A cleaner walk-through summary, scope notes, and quote questions.</p>
        </div>
        <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-500"><TrendingUp className="h-4 w-4 text-mint" /> Local context</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">{regionSummary(estimate?.region_multiplier)}</div>
          <p className="mt-2 text-sm text-slate-600">{qualityTierCopy(project.quality_tier)}</p>
        </div>
      </section>

      {/* ── Concept images ── */}
      <section className="mt-10 print:hidden">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Concept images</h2>
            <p className="mt-1 text-sm text-slate-500">A visual direction grounded in the original photo, not a generic style template.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {hasAnyConcepts && selectedConceptUrl && (
              <a href={selectedConceptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink">
                <Eye className="h-4 w-4" /> Open selected concept
              </a>
            )}
            {originalImage && (
              <ConceptsLoader
                projectId={projectId}
                category={project.project_category}
                style={project.style_preference || 'modern'}
                qualityTier={project.quality_tier}
                notes={project.notes || undefined}
                referenceImageUrl={originalImage}
                hasImages={hasAnyConcepts}
                mode="manual"
                buttonLabel="Regenerate concept"
              />
            )}
          </div>
        </div>
      </section>

      {/* ─── Section: Concept Images ─── */}
      <section id="section-concepts" className="mt-10 scroll-mt-24 print:hidden">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">Design concepts</h2>
            <p className="mt-1 text-sm text-ink-500">AI-generated visuals based on your photo and style preferences.</p>
          </div>
          {originalImage && (
            <ConceptsLoader
              projectId={projectId}
              category={project.project_category}
              style={project.style_preference || 'modern'}
              qualityTier={project.quality_tier}
              notes={project.notes || undefined}
              referenceImageUrl={originalImage}
              hasImages={hasAnyConcepts}
              mode="manual"
              buttonLabel="+ New concept"
            />
          )}
        </div>

        {hasAnyConcepts && selectedConceptUrl && originalImage ? (
          <div className="space-y-5">
            <BeforeAfterSlider beforeImage={originalImage} afterImage={selectedConceptUrl} beforeLabel="Your photo" afterLabel={`Concept ${selectedConcept + 1}`} />
            {conceptImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {conceptImages.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedConcept(index)}
                    className={cn(
                      'flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all',
                      selectedConcept === index ? 'border-sand-dark shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Concept ${index + 1}`} className="h-20 w-28 object-cover sm:h-24 sm:w-36" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : hasAnyConcepts ? (
          <div className="grid gap-4 md:grid-cols-2">
            {conceptImages.map((url, index) => (
              <div key={url} className="overflow-hidden rounded-[1.5rem] border border-hairline shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Concept ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sand/20">
              <Loader2 className="h-6 w-6 animate-spin text-sand-dark" />
            </div>
            <div>
              <p className="font-semibold text-ink">Generating your design concepts...</p>
              <p className="mt-1 text-sm text-ink-500">Usually takes 30–60 seconds. This page updates automatically.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Smart cost estimate ── */}
      <section className="mt-10 rounded-[2rem] border border-hairline bg-canvas-50 p-6 shadow-soft print:hidden sm:p-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Smart cost estimate</h2>
            <p className="mt-1 text-sm text-slate-500">A planning estimate built from the visible scope, your notes, and local pricing, not a generic benchmark.</p>
          </div>
          <div className="flex items-center gap-3">
            {estimate?.confidence_score && (
              <Badge variant={estimate.confidence_score >= 0.75 ? 'green' : estimate.confidence_score >= 0.55 ? 'amber' : 'gray'} className="w-fit">
                {estimate.confidence_score >= 0.85 ? 'High confidence' : estimate.confidence_score >= 0.65 ? 'Good confidence' : estimate.confidence_score >= 0.45 ? 'Medium confidence' : 'Estimate is broad'}
              </Badge>
            )}
            {estimate && <Badge variant="amber" className="w-fit">{qualityTierCopy(project.quality_tier)}</Badge>}
          </div>
        </div>

        {estimate ? (
          <div className="mt-5 space-y-5">
            {/* Range bar */}
            <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between text-sm text-ink-500">
                <span>Low</span>
                <span className="text-base font-bold text-ink">Most likely</span>
                <span>High</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xl font-bold text-ink-600">{formatCurrency(estimate.low_estimate)}</span>
                <span className="text-3xl font-bold text-ink">{formatCurrency(estimate.mid_estimate)}</span>
                <span className="text-xl font-bold text-ink-600">{formatCurrency(estimate.high_estimate)}</span>
              </div>
              <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-canvas-200">
                <div className="absolute inset-0 bg-gradient-to-r from-sand/60 via-sand-dark to-mint/60" />
                <div className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-[3px] border-white bg-ink shadow-lg" style={{ left: 'calc(50% - 12px)' }} />
              </div>
              <div className="mt-3 text-center text-xs text-ink-500">{regionNote(estimate.region_multiplier)}</div>
            </div>

            {/* Donut + breakdown */}
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">Cost breakdown</h3>
                <div className="space-y-3">
                  {donutSegments.filter(s => s.value > 0).map(seg => (
                    <div key={seg.label} className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="flex-1 text-sm text-ink-600">{seg.label}</span>
                      <span className="text-sm font-semibold text-ink">{formatCurrency(seg.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">What affects your cost</h3>
                <div className="space-y-3 text-sm text-ink-600">
                  {estimateAssumptions.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-mint" />
                      <span>{item}</span>
                    </div>
                  ))}
                  {riskNotes.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-sand-dark" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {estimate.estimate_basis && (
                  <p className="mt-4 rounded-xl bg-canvas-50 p-3 text-xs text-ink-500">{estimate.estimate_basis}</p>
                )}
              </div>
            </div>

            <Disclaimer text={DISCLAIMERS.estimate} />
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-4 rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft">
            <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-sand-dark" />
            <div>
              <p className="font-semibold text-ink">Calculating your estimate...</p>
              <p className="mt-1 text-sm text-ink-500">This page updates automatically.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Materials list ── */}
      <section className="mt-10 print:hidden">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">Materials &amp; shopping list</h2>
            <p className="mt-1 text-sm text-ink-500">Real products with prices and links. Ready to shop or hand to a contractor.</p>
          </div>
          <div className="flex items-center gap-2">
            {materials && (
              <Badge variant="green">{materials.line_items.length} items</Badge>
            )}
            {materials && (
              <button
                type="button"
                onClick={handleRegenerateMaterials}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-soft transition-all hover:bg-canvas-50 hover:shadow-md disabled:opacity-50"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isRegenerating && 'animate-spin')} />
                {isRegenerating ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
        </div>
        {regenError && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{regenError}</div>
        )}
        {materials ? (
          <MaterialsAccordion materials={materials} />
        ) : (
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft">
            <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-sand-dark" />
            <div>
              <p className="font-semibold text-ink">Building your materials list...</p>
              <p className="mt-1 text-sm text-ink-500">Real products with prices will appear here automatically.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Project handoff brief ── */}
      <section className="mt-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-ink print:hidden sm:text-3xl">Contractor handoff brief</h2>
            <p className="mt-1 text-sm text-ink-500 print:hidden">Print or share this with your contractor for accurate quotes.</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90">
              <Download className="h-4 w-4" /> Print
            </button>
            <div className="w-44">
              <ShareButton shareUrl={shareUrl} variant="light" projectTitle={`${categoryLabel} brief`} />
            </div>
          </div>
        </div>

        {brief ? (
          <ProjectBriefDocument
            project={project}
            categoryLabel={categoryLabel}
            estimate={estimate}
            materials={materials}
            brief={brief}
            likelyTrades={likelyTrades}
            siteQuestions={siteQuestions}
            subtitle="Share this with your contractor for accurate, comparable quotes."
          />
        ) : (
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft print:hidden">
            <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-sand-dark" />
            <div>
              <p className="font-semibold text-ink">Writing your contractor brief...</p>
              <p className="mt-1 text-sm text-ink-500">This will appear automatically when ready.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Next step / ready to compare bids ── */}
      <section className="mt-10 rounded-[1.75rem] border border-hairline bg-canvas-50 p-5 shadow-soft print:hidden sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ready to compare bids?</h2>
            <p className="mt-1 text-sm text-slate-500">Share your brief with local pros who understand the scope.</p>
          </div>
          <Link
            href={matchHref}
            onClick={() => posthog.capture('naili_match_cta_clicked', { project_id: projectId, placement: 'footer' })}
            className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-canvas-50 shadow-soft transition-opacity hover:opacity-95"
          >
            Find contractors <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <Disclaimer text="Design concepts are AI-generated inspiration. Final costs depend on contractor quotes, site conditions, and material availability." className="mt-8 print:hidden" />
    </div>
  );
}
