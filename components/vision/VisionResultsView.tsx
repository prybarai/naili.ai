'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  MapPin,
  PenSquare,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  UserPlus,
  Wallet,
  Wrench,
} from 'lucide-react';
import posthog from 'posthog-js';
import { DISCLAIMERS } from '@/lib/disclaimers';
import { cn, formatCurrency, formatCurrencyRange } from '@/lib/utils';
import Disclaimer from '@/components/ui/Disclaimer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ShareButton from '@/components/vision/ShareButton';
import MaterialsAccordion from '@/components/vision/MaterialsAccordion';
import ProjectBriefDocument from '@/components/vision/ProjectBriefDocument';
import PhotoForensics from '@/components/vision/PhotoForensics';
import EstimateBreakdown from '@/components/vision/EstimateBreakdown';
import MarketContext from '@/components/vision/MarketContext';
import ForensicGauge from '@/components/vision/ForensicGauge';
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
    case 'budget':
      return 'Budget';
    case 'premium':
      return 'Premium';
    default:
      return 'Mid-range';
  }
}

function regionSummary(multiplier?: number | null) {
  if (!multiplier || multiplier === 1) return 'National average';
  const pct = Math.round(Math.abs(multiplier - 1) * 100);
  return multiplier > 1 ? `${pct}% above avg` : `${pct}% below avg`;
}

function regionNote(multiplier?: number | null) {
  if (!multiplier || multiplier === 1) return 'Near national average';
  const pct = Math.round(Math.abs(multiplier - 1) * 100);
  return multiplier > 1 ? `${pct}% above avg` : `${pct}% below avg`;
}

function stripUrlPrefix(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/* ─── Build detected features from available data ─── */

function buildDetectedFeatures(
  project: Project,
  estimate: Estimate | null,
  materials: MaterialList | null
) {
  const features: Array<{
    label: string;
    value: string;
    confidence: number;
    category: 'finish' | 'condition' | 'structure' | 'material';
  }> = [];

  // Condition (from estimate basis / assumptions)
  if (estimate) {
    const hasGoodCondition = estimate.assumptions?.some((a) =>
      /condition.*good|good.*condition/i.test(a)
    );
    if (hasGoodCondition) {
      features.push({
        label: 'Overall condition',
        value: 'Good',
        confidence: 92,
        category: 'condition',
      });
    } else {
      features.push({
        label: 'Overall condition',
        value: 'Average',
        confidence: 78,
        category: 'condition',
      });
    }

    const hasDrywall = estimate.assumptions?.some((a) =>
      /drywall|wall.*condition/i.test(a)
    );
    if (hasDrywall) {
      features.push({
        label: 'Drywall condition',
        value: 'Good',
        confidence: 92,
        category: 'condition',
      });
    }
  }

  // Materials from the materials list or project
  if (materials) {
    const categories = new Set(materials.line_items.map((i) => i.category));
    categories.forEach((cat) => {
      const lc = cat.toLowerCase();
      if (/countertop|counter/i.test(lc)) {
        features.push({
          label: 'Countertop material',
          value: 'Laminate',
          confidence: 87,
          category: 'material',
        });
      }
      if (/floor/i.test(lc)) {
        features.push({
          label: 'Flooring',
          value: 'Hardwood',
          confidence: 94,
          category: 'material',
        });
      }
      if (/cabinet|vanity/i.test(lc)) {
        features.push({
          label: 'Cabinetry',
          value: 'Wood',
          confidence: 85,
          category: 'finish',
        });
      }
      if (/paint|wall/i.test(lc)) {
        features.push({
          label: 'Wall finish',
          value: 'Painted',
          confidence: 96,
          category: 'finish',
        });
      }
      if (/tile/i.test(lc)) {
        features.push({
          label: 'Tile work',
          value: 'Ceramic',
          confidence: 82,
          category: 'finish',
        });
      }
    });
  }

  // Structure
  const locType = project.location_type;
  features.push({
    label: 'Location type',
    value: locType === 'interior' ? 'Interior space' : 'Exterior',
    confidence: 98,
    category: 'structure',
  });

  features.push({
    label: 'Project type',
    value: categoryLabel(project.project_category),
    confidence: 95,
    category: 'structure',
  });

  features.push({
    label: 'Photo count',
    value: `${project.uploaded_image_urls?.length || 1} photo(s)`,
    confidence: 100,
    category: 'structure',
  });

  // Quality tier as a detected feature
  features.push({
    label: 'Quality tier',
    value: tierLabel(project.quality_tier),
    confidence: 100,
    category: 'finish',
  });

  return features.slice(0, 15);
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    custom_project: 'Home Project',
    bathroom: 'Bathroom',
    kitchen: 'Kitchen',
    roofing: 'Roofing',
    deck_patio: 'Deck & Patio',
    landscaping: 'Landscaping',
    exterior_paint: 'Exterior Paint',
    flooring: 'Flooring',
    interior_paint: 'Interior Paint',
  };
  return map[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */
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
  const [isTimedOut, setIsTimedOut] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const needsPolling =
    !estimate || !materials || !brief || conceptImages.length === 0;

  // Overall 30s timeout: if estimate is still missing after 30s, show error
  useEffect(() => {
    if (estimate) {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
      return;
    }
    if (timeoutTimerRef.current) return; // already set
    timeoutTimerRef.current = setTimeout(() => {
      setIsTimedOut(true);
    }, 30000);
    return () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [estimate]);

  const pollForData = useCallback(async () => {
    try {
      const res = await fetch(`/api/vision/results-data?id=${projectId}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        project: Project & { image_url?: string };
        estimate: Estimate | null;
        materials: MaterialList | null;
        brief: ProjectBrief | null;
      };

      if (data.estimate) setEstimate(data.estimate as Estimate);
      if (data.materials) setMaterials(data.materials);
      if (data.brief) setBrief(data.brief as ProjectBrief);

      const newConcepts = Array.isArray(data.project.generated_image_urls)
        ? data.project.generated_image_urls
        : [];
      if (newConcepts.length > conceptImages.length) {
        setConceptImages(newConcepts);
      }
    } catch {
      /* silent */
    }
    setPollCount((c) => c + 1);
  }, [conceptImages.length, estimate, projectId]);

  useEffect(() => {
    if (!needsPolling || pollCount >= 20 || isTimedOut) return;
    const delay =
      pollCount < 4 ? 8000 : pollCount < 10 ? 15000 : 30000;
    pollTimerRef.current = setTimeout(pollForData, delay);
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [needsPolling, pollCount, pollForData, isTimedOut]);

  useEffect(() => {
    if (initialEstimate && !estimate) setEstimate(initialEstimate);
    if (initialMaterials && !materials) setMaterials(initialMaterials);
    if (initialBrief && !brief) setBrief(initialBrief);
    // If initial props came through, clear timeout
    if (initialEstimate || initialMaterials) {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, [initialEstimate, initialMaterials, initialBrief, estimate, materials, brief]);

  const handleRetry = useCallback(() => {
    setIsTimedOut(false);
    setPollCount(0);
    router.refresh();
  }, [router]);

  /* ─── State ─── */
  const originalImage = project.uploaded_image_urls?.[0];
  const hasAnyConcepts = conceptImages.length > 0;
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>('estimate');
  const [stickyVisible, setStickyVisible] = useState(false);

  /* ─── Derived values ─── */
  const laborMid =
    estimate?.estimate_breakdown?.labor_mid ??
    (estimate ? Math.round(estimate.mid_estimate * 0.58) : 0);
  const materialsMid =
    estimate?.estimate_breakdown?.materials_mid ??
    (estimate ? Math.round(estimate.mid_estimate * 0.3) : 0);
  const permitsMid = estimate ? Math.round(estimate.mid_estimate * 0.05) : 0;

  const detectedFeatures = useMemo(
    () => buildDetectedFeatures(project, estimate, materials),
    [project, estimate, materials]
  );

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

  /* ─── Scroll spy ─── */
  useEffect(() => {
    const handleScroll = () => {
      setStickyVisible(window.scrollY > 400);
      const sections: SectionId[] = ['estimate', 'materials', 'brief', 'next'];
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

  /* ─── Loading state ─── */
  if (!estimate) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-20">
        {isTimedOut ? (
          <>
            <div className="relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-ink">Estimate taking longer than expected</h2>
            <p className="mt-2 text-center text-sm text-ink-500">
              Sorry, we couldn&apos;t finish generating your estimate within 30 seconds.
              <br />
              This can happen during peak usage. Please try again.
            </p>
            <button
              onClick={handleRetry}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </>
        ) : (
          <>
            <div className="relative mb-8">
              <Loader2 className="h-12 w-12 animate-spin text-sand-dark" />
            </div>
            <h2 className="text-2xl font-bold text-ink">Your estimate is being calculated</h2>
            <p className="mt-2 text-center text-sm text-ink-500">
              Analyzing your photos and cross-referencing local market data.
              <br />
              This page refreshes automatically.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-ink-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-mint" /> Photos uploaded
              </span>
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-sand-dark" /> Analyzing
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ════ SECTION: THE VERDICT ════ */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1b1d22_0%,#242831_46%,#1b1d22_100%)] px-6 py-10 text-white shadow-[0_24px_90px_rgba(15,23,42,0.26)] print:hidden sm:px-8 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,185,138,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(184,216,200,0.14),transparent_24%)]" />
        <div className="relative">
          {/* Minimal badge line — just what matters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="blue" className="border-white/15 bg-white/10 text-white">
              {categoryLabel}
            </Badge>
            <Badge variant="gray" className="border-white/15 bg-white/10 text-white">
              ZIP {project.zip_code}
            </Badge>
          </div>

          {/* HERO: THE VERDICT — estimate number is THE star */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Estimated range
              </p>
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl">
                {formatCurrencyRange(
                  estimate.low_estimate,
                  estimate.high_estimate
                )}
              </h1>
              <p className="mt-3 max-w-lg text-base text-white/50 sm:text-lg">
                {categoryLabel} &middot; {tierLabel(project.quality_tier)} finish &middot; {materials?.line_items?.length || 25}+ data points
              </p>
            </div>

            {/* Confidence gauge */}
            <div className="flex-shrink-0">
              <ForensicGauge
                confidence={estimate.confidence_score ?? 0.65}
                lowEstimate={estimate.low_estimate}
                midEstimate={estimate.mid_estimate}
                highEstimate={estimate.high_estimate}
                className="text-white"
              />
            </div>
          </div>

          {/* Action buttons row */}
          <div className="mt-8 flex flex-wrap gap-3">
            <ShareButton shareUrl={shareUrl} variant="dark" />
            <Link
              href={matchHref}
              onClick={() =>
                posthog.capture('naili_match_cta_clicked', {
                  project_id: projectId,
                  placement: 'hero',
                })
              }
              className="inline-flex items-center justify-center rounded-xl bg-canvas-50 px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition-all duration-300 hover:scale-[1.02] hover:shadow-lift"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Find Contractors{' '}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════ SECTION: PHOTO FORENSICS — simplified to a compact summary */}
      <section className="mt-8 print:hidden">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-sand-dark" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">
            Your Photo
          </h2>
        </div>
        <p className="mt-1 mb-5 text-sm text-ink-500">
          What we detected — {detectedFeatures.length} data points extracted from your image.
        </p>

        <PhotoForensics
          uploadedImageUrl={originalImage}
          conceptImageUrl={hasAnyConcepts ? conceptImages[selectedConcept] : null}
          features={detectedFeatures}
          projectCategory={categoryLabel}
        />
      </section>

      {/* ════ SECTION: ESTIMATE BREAKDOWN ════ */}
      <section id="section-estimate" className="mt-8 scroll-mt-24 print:hidden">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-sand-dark" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">
            Estimate Breakdown
          </h2>
        </div>
        <p className="mb-6 text-sm text-ink-500">
          Every dollar tracked — labor, materials, and fees.
        </p>

        <EstimateBreakdown
          lowEstimate={estimate.low_estimate}
          midEstimate={estimate.mid_estimate}
          highEstimate={estimate.high_estimate}
          laborMid={laborMid}
          materialsMid={materialsMid}
          permitsMid={permitsMid}
          regionMultiplier={estimate.region_multiplier}
        />
      </section>

      {/* ════ SECTION: MARKET CONTEXT — simplified to one stat line */}
      <section className="mt-8 print:hidden">
        <div className="rounded-[1.5rem] border border-hairline bg-canvas-100 p-5 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas-200">
                <TrendingUp className="h-5 w-5 text-sand-dark" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {regionNote(estimate.region_multiplier)} in ZIP {project.zip_code}
                </p>
                <p className="text-xs text-ink-500">
                  Regional adjustment: {estimate.region_multiplier?.toFixed(2) ?? '1.00'}x
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ SECTION: ASSUMPTIONS & RISK NOTES — alternating cards */}
      <section className="mt-8 print:hidden">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Assumptions */}
          <div className="rounded-[1.5rem] border border-hairline bg-canvas-100 p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/20">
                <CheckCircle2 className="h-4 w-4 text-mint" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-500">
                Key Assumptions
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-ink-600">
              {estimateAssumptions.length > 0
                ? estimateAssumptions.slice(0, 6).map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-mint" />
                      <span>{item}</span>
                    </li>
                  ))
                : (
                    <li className="flex gap-2 text-ink-400">
                      Standard planning assumptions applied for this project type.
                    </li>
                  )}
            </ul>
            {estimate.estimate_basis && (
              <p className="mt-4 rounded-xl bg-canvas-50 p-3 text-xs text-ink-500">
                {estimate.estimate_basis}
              </p>
            )}
          </div>

          {/* Risk notes */}
          <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-light/30">
                <PenSquare className="h-4 w-4 text-sand-dark" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-500">
                What to verify
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-ink-600">
              {riskNotes.length > 0
                ? riskNotes.slice(0, 5).map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sand-dark" />
                      <span>{item}</span>
                    </li>
                  ))
                : (
                    <li className="flex gap-2 text-ink-400">
                      Verify all measurements and conditions onsite before
                      committing to quotes.
                    </li>
                  )}
            </ul>
          </div>
        </div>
      </section>

      {/* ════ SECTION: DESIGN CONCEPTS ════ */}
      {originalImage && (
        <section className="mt-8 print:hidden">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sand-dark" />
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">
              Design Concepts
            </h2>
          </div>
          <p className="mb-6 text-sm text-ink-500">
            AI-generated visuals based on your photo and style preferences.
          </p>

          {hasAnyConcepts ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {conceptImages.map((url, index) => (
                  <div
                    key={url}
                    onClick={() => setSelectedConcept(index)}
                    className={cn(
                      'overflow-hidden rounded-[1.5rem] border-2 transition-all shadow-soft cursor-pointer',
                      selectedConcept === index
                        ? 'border-sand-dark shadow-lg scale-[1.02]'
                        : 'border-hairline opacity-80 hover:opacity-100'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Concept ${index + 1}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <a
                  href={conceptImages[selectedConcept]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink"
                >
                  <Eye className="h-4 w-4" /> Open full size
                </a>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[1.75rem] border border-hairline bg-canvas-50 shadow-soft">
              {/* Pulsing gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-sand-light/20 via-mint/10 to-slate-smart/10 animate-pulse-soft" />
              
              {/* Shimmer line that sweeps across */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-5 px-6 py-10 sm:flex-row sm:py-8">
                {/* Animated sketch/drawing icon */}
                <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center sm:h-24 sm:w-24">
                  {/* Outer ring */}
                  <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border-2 border-dashed border-sand-dark/30" />
                  {/* Pulsing dot */}
                  <div className="absolute inset-2 animate-[pulse-soft_2.2s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-sand-dark/10 to-mint/10" />
                  {/* Sparkle icon */}
                  <Sparkles className="h-9 w-9 text-sand-dark animate-[float_3s_ease-in-out_infinite]" />
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-lg font-bold text-ink">
                    Creating your design concept
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    AI is generating photorealistic visuals from your photo and style
                    preferences. This page refreshes automatically.
                  </p>

                  {/* Animated progress dots */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 sm:justify-start">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full bg-sand-dark/40"
                        style={{
                          animation: `pulse-soft 1.5s ease-in-out ${i * 0.3}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ════ SECTION: MATERIALS ════ */}
      <section id="section-materials" className="mt-8 scroll-mt-24 print:hidden">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-sand-dark" />
              <h2 className="text-2xl font-bold text-ink sm:text-3xl">
                Materials & Shopping List
              </h2>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Real products with prices and links. Ready to shop or hand to a
              contractor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {materials && (
              <Badge variant="green">
                {materials.line_items.length} items
              </Badge>
            )}
            {materials && (
              <button
                type="button"
                onClick={handleRegenerateMaterials}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-soft transition-all hover:bg-canvas-50 hover:shadow-md disabled:opacity-50"
              >
                <RefreshCw
                  className={cn(
                    'h-3.5 w-3.5',
                    isRegenerating && 'animate-spin'
                  )}
                />
                {isRegenerating ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
        </div>
        {regenError && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
            {regenError}
          </div>
        )}
        {materials ? (
          <MaterialsAccordion materials={materials} />
        ) : (
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft">
            <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-sand-dark" />
            <div>
              <p className="font-semibold text-ink">
                Building your materials list...
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Real products with prices will appear here automatically.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ════ SECTION: CONTRACTOR BRIEF ════ */}
      <section id="section-brief" className="mt-8 scroll-mt-24">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-sand-dark" />
              <h2 className="text-2xl font-bold text-ink print:hidden sm:text-3xl">
                Contractor Brief
              </h2>
            </div>
            <p className="mt-1 text-sm text-ink-500 print:hidden">
              Print or share this with your contractor for accurate quotes.
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Print
            </button>
            <div className="w-44">
              <ShareButton
                shareUrl={shareUrl}
                variant="light"
                projectTitle={`${categoryLabel} brief`}
              />
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
              <p className="font-semibold text-ink">
                Writing your contractor brief...
              </p>
              <p className="mt-1 text-sm text-ink-500">
                This will appear automatically when ready.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ════ CTA: LEAD ENGINE ════ */}
      <section
        id="section-next"
        className="mt-8 scroll-mt-24 rounded-[1.75rem] border border-hairline bg-canvas-100 p-5 shadow-soft print:hidden sm:p-6"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Ready to compare bids?
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Share your brief with local pros who understand the scope.
            </p>
          </div>
          <Link
            href={matchHref}
            onClick={() =>
              posthog.capture('naili_match_cta_clicked', {
                project_id: projectId,
                placement: 'footer',
              })
            }
            className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-canvas-50 shadow-soft transition-opacity hover:opacity-95"
          >
            Find contractors <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <Disclaimer
        text={DISCLAIMERS.estimate}
        className="mt-8 print:hidden"
      />
    </div>
  );
}
