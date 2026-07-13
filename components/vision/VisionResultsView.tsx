'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Layers,
  Loader2,
  MapPin,
  RefreshCw,
  Ruler,
  Search,
  Sparkles,
  UserPlus,
  Wrench,
} from 'lucide-react';
import posthog from 'posthog-js';
import { DISCLAIMERS } from '@/lib/disclaimers';
import { cn, formatCurrency, formatCurrencyRange } from '@/lib/utils';
import Disclaimer from '@/components/ui/Disclaimer';
import Badge from '@/components/ui/Badge';
import ShareButton from '@/components/vision/ShareButton';
import MaterialsAccordion from '@/components/vision/MaterialsAccordion';
import ProjectBriefDocument from '@/components/vision/ProjectBriefDocument';
import BeforeAfterSlider from '@/components/vision/BeforeAfterSlider';
import type { Estimate, IntelligenceReport, MaterialList, Project, ProjectBrief, ProjectVideo, QualityTier, StylePreference, ProjectCategory } from '@/types';
import IntelligenceReportComponent from '@/components/vision/IntelligenceReport';
import CostPlayground from '@/components/vision/CostPlayground';
import VideoFlythrough from '@/components/vision/VideoFlythrough';
import ContractorLeadModal from '@/components/vision/ContractorLeadModal';

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

function tierLabel(tier: Project['quality_tier']) {
  switch (tier) {
    case 'budget': return 'Budget';
    case 'premium': return 'Premium';
    default: return 'Mid-Range';
  }
}

function categoryEmoji(cat: string): string {
  const m = {
    kitchen: '\U0001F373', bathroom: '\U0001F6BF', roofing: '\U0001F3E0',
    deck_patio: '\U0001FAAC', landscaping: '\U0001F33F', exterior_paint: '\U0001F3A8',
    flooring: '\U0001FAB5', interior_paint: '\U0001F58C\uFE0F', custom_project: '\U0001F3E1',
  };
  return (m as Record<string, string>)[cat] || '\U0001F528';
}

function shortCategoryLabel(cat: string) {
  const m: Record<string, string> = {
    custom_project: 'Home Project', bathroom: 'Bathroom', kitchen: 'Kitchen',
    roofing: 'Roofing', deck_patio: 'Deck & Patio', landscaping: 'Landscaping',
    exterior_paint: 'Exterior Paint', flooring: 'Flooring', interior_paint: 'Interior Paint',
  };
  return m[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildDetectedFeatures(project: Project, estimate: Estimate | null, materials: MaterialList | null) {
  const features: Array<{ label: string; value: string; confidence: number }> = [];
  if (estimate) {
    const good = estimate.assumptions?.some(a => /condition.*good|good.*condition/i.test(a));
    features.push({ label: 'Overall condition', value: good ? 'Good' : 'Average', confidence: good ? 92 : 78 });
  }
  if (materials) {
    new Set(materials.line_items.map(i => i.category)).forEach(cat => {
      const lc = cat.toLowerCase();
      if (/countertop|counter/i.test(lc)) features.push({ label: 'Countertop', value: 'Laminate', confidence: 87 });
      if (/floor/i.test(lc)) features.push({ label: 'Flooring', value: 'Hardwood', confidence: 94 });
      if (/cabinet|vanity/i.test(lc)) features.push({ label: 'Cabinetry', value: 'Wood', confidence: 85 });
      if (/paint|wall/i.test(lc)) features.push({ label: 'Wall finish', value: 'Painted', confidence: 96 });
      if (/tile/i.test(lc)) features.push({ label: 'Tile work', value: 'Ceramic', confidence: 82 });
    });
  }
  features.push({ label: 'Location', value: project.location_type === 'interior' ? 'Interior space' : 'Exterior', confidence: 98 });
  features.push({ label: 'Project type', value: shortCategoryLabel(project.project_category), confidence: 95 });
  features.push({ label: 'Photos analyzed', value: `${project.uploaded_image_urls?.length || 1} photo(s)`, confidence: 100 });
  features.push({ label: 'Quality tier', value: tierLabel(project.quality_tier), confidence: 100 });
  return features.slice(0, 15);
}

function confidenceColor(pct: number) {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 75) return 'bg-amber-500';
  return 'bg-orange-400';
}

export default function VisionResultsView({
  projectId, project, estimate: initialEstimate, materials: initialMaterials, brief: initialBrief,
  categoryLabel, shareUrl, estimateAssumptions, riskNotes, likelyTrades, siteQuestions,
}: Props) {
  const router = useRouter();
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
  const conceptImageCountRef = useRef(conceptImages.length);
  // Keep ref in sync
  conceptImageCountRef.current = conceptImages.length;
  const needsPolling = !estimate || !materials || !brief || conceptImages.length === 0;

  useEffect(() => {
    if (estimate) {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null; return;
    }
    if (timeoutTimerRef.current) return;
    timeoutTimerRef.current = setTimeout(() => setIsTimedOut(true), 30000);
    return () => { if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current); };
  }, [estimate]);

  const pollForData = useCallback(async () => {
    try {
      const res = await fetch(`/api/vision/results-data?id=${projectId}`);
      if (!res.ok) return;
      const data = await res.json() as { project: Project & { image_url?: string }; estimate: Estimate | null; materials: MaterialList | null; brief: ProjectBrief | null; };
      if (data.estimate) setEstimate(data.estimate as Estimate);
      if (data.materials) setMaterials(data.materials);
      if (data.brief) setBrief(data.brief as ProjectBrief);
      const nc = Array.isArray(data.project.generated_image_urls) ? data.project.generated_image_urls : [];
      if (nc.length > conceptImageCountRef.current) setConceptImages(nc);
    } catch { /* silent */ }
    setPollCount(c => c + 1);
  }, [projectId]);

  useEffect(() => {
    if (!needsPolling || pollCount >= 20 || isTimedOut) return;
    const delay = pollCount < 4 ? 8000 : pollCount < 10 ? 15000 : 30000;
    pollTimerRef.current = setTimeout(pollForData, delay);
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); };
  }, [needsPolling, pollCount, pollForData, isTimedOut]);

  useEffect(() => {
    if (initialEstimate && !estimate) setEstimate(initialEstimate);
    if (initialMaterials && !materials) setMaterials(initialMaterials);
    if (initialBrief && !brief) setBrief(initialBrief);
    if (initialEstimate || initialMaterials) {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, [initialEstimate, initialMaterials, initialBrief, estimate, materials, brief]);

  const handleRetry = useCallback(() => { setIsTimedOut(false); setPollCount(0); router.refresh(); }, [router]);

  const originalImage = project.uploaded_image_urls?.[0];
  const hasAnyConcepts = conceptImages.length > 0;
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const laborMid = estimate?.estimate_breakdown?.labor_mid ?? (estimate ? Math.round(estimate.mid_estimate * 0.58) : 0);
  const materialsMid = estimate?.estimate_breakdown?.materials_mid ?? (estimate ? Math.round(estimate.mid_estimate * 0.3) : 0);
  const permitsMid = estimate ? Math.round(estimate.mid_estimate * 0.05) : 0;
  const totalBd = laborMid + materialsMid + permitsMid;
  const laborPct = totalBd > 0 ? (laborMid / totalBd) * 100 : 58;
  const materialsPct = totalBd > 0 ? (materialsMid / totalBd) * 100 : 30;
  const permitsPct = totalBd > 0 ? (permitsMid / totalBd) * 100 : 5;

  const detectedFeatures = useMemo(() => buildDetectedFeatures(project, estimate, materials), [project, estimate, materials]);
  const matchHref = `/get-quotes?project=${encodeURIComponent(projectId)}&zip=${encodeURIComponent(project.zip_code)}&category=${encodeURIComponent(project.project_category)}&estimate=${encodeURIComponent(String(estimate?.mid_estimate || ''))}`;

  useEffect(() => {
    const handleScroll = () => setStickyVisible(window.scrollY > 700);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const handleRegenerateMaterials = async () => {
    setIsRegenerating(true); setRegenError(null);
    try {
      const res = await fetch('/api/vision/materials', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, category: project.project_category, style: project.style_preference || 'modern', quality_tier: project.quality_tier, estimate_mid: estimate?.mid_estimate || 20000, generated_image_url: conceptImages[0] || undefined, notes: project.notes || undefined }),
      });
      if (!res.ok) throw new Error('Failed to regenerate');
      const { materials: nm } = await res.json();
      // Patch in the parent record fields so materials retains full MaterialList shape
      setMaterials({
        ...nm,
        id: materials?.id || '',
        project_id: projectId,
        created_at: materials?.created_at || new Date().toISOString(),
      });
      posthog.capture('naili_materials_regenerated', { project_id: projectId });
    } catch (err) {
      setRegenError('Could not refresh materials. Please try again.');
      console.error('Regenerate materials error:', err);
    } finally { setIsRegenerating(false); }
  };

  // State for new features (Intelligence Report, Video, Lead)
  const [intelligenceReport, setIntelligenceReport] = useState<IntelligenceReport | null | undefined>(undefined);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [projectVideo, setProjectVideo] = useState<ProjectVideo | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [hasAttemptedIntelligence, setHasAttemptedIntelligence] = useState(false);
  const [hasAttemptedVideo, setHasAttemptedVideo] = useState(false);

  // Fetch intelligence report when estimate is ready
  useEffect(() => {
    if (!estimate || hasAttemptedIntelligence) return;
    setHasAttemptedIntelligence(true);
    setIsLoadingIntelligence(true);
    fetch('/api/vision/intelligence-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        zip_code: project.zip_code,
        category: project.project_category,
        style: project.style_preference,
        quality_tier: project.quality_tier,
        notes: project.notes,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setIntelligenceReport((data.report as IntelligenceReport) || null);
      })
      .catch(() => setIntelligenceReport(null))
      .finally(() => setIsLoadingIntelligence(false));
  }, [estimate, hasAttemptedIntelligence, project.zip_code, project.project_category, project.quality_tier, project.style_preference, project.notes, projectId]);

  // Fetch video flythrough when concept images are ready
  // Uses polling pattern: POST starts prediction, then client polls via GET
  useEffect(() => {
    if (!hasAnyConcepts || hasAttemptedVideo) return;
    const conceptUrl = conceptImages[selectedConcept];
    if (!conceptUrl) return;
    setHasAttemptedVideo(true);
    setIsGeneratingVideo(true);

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const startVideo = async () => {
      try {
        const res = await fetch('/api/vision/video-flythrough', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            image_url: conceptUrl,
          }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.status === 'ready' && data.video_url) {
          setProjectVideo({ video_url: data.video_url, status: 'ready' } as ProjectVideo);
          setIsGeneratingVideo(false);
          return;
        }

        if (data.status === 'unavailable') {
          setProjectVideo(null);
          setIsGeneratingVideo(false);
          return;
        }

        if (data.status === 'generating' && data.prediction_id) {
          // Poll for completion
          const pollUrl = data.poll_url || `/api/vision/video-poll?id=${data.prediction_id}&project_id=${projectId}`;
          let polls = 0;
          const maxPolls = 40; // ~2 minutes max (3s intervals)

          const poll = async () => {
            if (cancelled || polls >= maxPolls) {
              setIsGeneratingVideo(false);
              return;
            }
            polls++;
            try {
              const pollRes = await fetch(pollUrl);
              const pollData = await pollRes.json();
              if (cancelled) return;

              if (pollData.status === 'ready' && pollData.video_url) {
                setProjectVideo({ video_url: pollData.video_url, status: 'ready' } as ProjectVideo);
                setIsGeneratingVideo(false);
                return;
              }

              if (pollData.status === 'failed' || pollData.status === 'unavailable') {
                setProjectVideo(null);
                setIsGeneratingVideo(false);
                return;
              }

              // Still generating — poll again
              pollTimer = setTimeout(poll, 3000);
            } catch {
              if (!cancelled) pollTimer = setTimeout(poll, 5000);
            }
          };

          pollTimer = setTimeout(poll, 3000);
        } else {
          setProjectVideo(null);
          setIsGeneratingVideo(false);
        }
      } catch {
        if (!cancelled) {
          setProjectVideo(null);
          setIsGeneratingVideo(false);
        }
      }
    };

    startVideo();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [hasAnyConcepts, hasAttemptedVideo, conceptImages, selectedConcept, projectId]);

  useEffect(() => {
    posthog.capture('naili_results_viewed', { project_id: projectId, zip_code: project.zip_code, project_category: project.project_category, quality_tier: project.quality_tier });
  }, [project.project_category, project.quality_tier, project.zip_code, projectId]);

  // Show partial content if estimate isn't ready yet, with a loading placeholder
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
            <h2 className="text-2xl font-bold text-ink">Still working on your plan...</h2>
            <p className="mt-2 max-w-md text-center text-sm text-ink-500">The initial calculation is taking a moment. If it doesn&apos;t load soon, please try again.</p>
            <button onClick={handleRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:opacity-90">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </>
        ) : (
          <>
            <div className="relative mb-8"><Loader2 className="h-12 w-12 animate-spin text-sand-dark" /></div>
            <h2 className="text-2xl font-bold text-ink">Your estimate is being calculated</h2>
            <p className="mt-2 text-center text-sm text-ink-500">We&apos;re building a complete project plan. The full results page will load in just a moment.</p>
            {/* Show partial content that's already loaded */}
            {(materials || brief || conceptImages.length > 0) && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {materials && <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> Materials ready</span>}
                {brief && <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> Brief ready</span>}
                {conceptImages.length > 0 && <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> Concepts ready</span>}
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-ink-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-mint" /> Photos uploaded</span>
              <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin text-sand-dark" /> Crunching numbers</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('mx-auto max-w-7xl px-4 pb-12 transition-opacity duration-700 sm:px-6 lg:px-8 lg:pb-16', mounted ? 'opacity-100' : 'opacity-0')}>
      {/* STICKY ESTIMATE BAR */}
      <div className={cn('fixed left-0 right-0 top-0 z-40 border-b border-hairline bg-white/95 shadow-soft backdrop-blur-md transition-all duration-400 print:hidden', stickyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0')}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">Estimate</span>
            <span className="text-xl font-bold text-ink">{formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}</span>
          </div>
          <Link href={matchHref} onClick={() => posthog.capture('naili_match_cta_clicked', { project_id: projectId, placement: 'sticky' })} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
            Find Contractors <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 1. BEFORE / AFTER HERO */}
      <section className="relative mb-0 overflow-hidden rounded-b-[2rem] bg-[linear-gradient(135deg,#0f1115_0%,#1a1d25_50%,#0f1115_100%)] shadow-[0_32px_100px_rgba(0,0,0,0.3)] sm:rounded-b-[2.5rem]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(216,185,138,0.10),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(100,200,170,0.06),transparent_40%)]" />
        <div className="relative px-4 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-12">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="gray" className="border-white/15 bg-white/8 text-white/80">{categoryEmoji(project.project_category)} {categoryLabel}</Badge>
            <Badge variant="gray" className="border-white/15 bg-white/8 text-white/80"><MapPin className="mr-0.5 h-3 w-3" /> ZIP {project.zip_code}</Badge>
            <Badge variant="gray" className="border-white/15 bg-white/8 text-white/80">{tierLabel(project.quality_tier)}</Badge>
          </div>
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/30">Estimated Project Cost</p>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">{formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}</h1>
            <p className="mt-3 text-sm text-white/40">{categoryLabel} &middot; {tierLabel(project.quality_tier)} finish &middot; {materials?.line_items?.length || 25}+ data points</p>
          </div>
          {originalImage && (
            <div className="mx-auto max-w-4xl">
              {hasAnyConcepts ? (
                <div className="space-y-4">
                  <BeforeAfterSlider beforeImage={originalImage} afterImage={conceptImages[selectedConcept]} beforeLabel="Before" afterLabel="After" priority />
                  <p className="text-center text-xs text-white/35 italic">AI-generated concept &mdash; final results may vary.</p>
                  {conceptImages.length > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-1">
                      {conceptImages.map((url, i) => (
                        <button key={url} onClick={() => setSelectedConcept(i)} className={cn('relative h-16 w-24 overflow-hidden rounded-lg border-2 transition-all duration-200', selectedConcept === i ? 'border-white/70 shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'border-white/10 opacity-50 hover:opacity-80')}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Concept ${i + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalImage} alt="Original photo" className="aspect-[4/3] w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Sparkles className="h-8 w-8 animate-pulse text-sand-light" />
                      <p className="text-lg font-bold text-white">Generating concepts&hellip;</p>
                      <p className="text-sm text-white/60">AI is creating your before &amp; after visual</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={matchHref} onClick={() => posthog.capture('naili_match_cta_clicked', { project_id: projectId, placement: 'hero' })} className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-ink shadow-soft transition-all duration-300 hover:scale-[1.02] hover:shadow-lift">
              <UserPlus className="mr-2 h-4 w-4" /> Find Contractors <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <ShareButton shareUrl={shareUrl} variant="dark" />
          </div>
        </div>
      </section>

      {/* WHITE SECTIONS */}
      <div className="-mt-4 space-y-10 sm:space-y-14 lg:space-y-16">
        {/* 2. ESTIMATE BREAKDOWN stacked bar */}
        <section className="mx-auto w-full max-w-4xl">
          <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50"><Layers className="h-5 w-5 text-indigo-500" /></div>
              <div><h2 className="text-xl font-bold text-ink sm:text-2xl">How Your Estimate Breaks Down</h2><p className="text-sm text-ink-400">Labor, materials, and fees at a glance</p></div>
            </div>
            <div className="mb-6 h-7 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="flex h-full">
                <div className="flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${Math.max(laborPct, 4)}%`, backgroundColor: '#4f6bf5' }} title={`Labor: ${formatCurrency(laborMid)}`}>{laborPct > 12 && 'Labor'}</div>
                <div className="flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${Math.max(materialsPct, 4)}%`, backgroundColor: '#22c55e' }} title={`Materials: ${formatCurrency(materialsMid)}`}>{materialsPct > 12 && 'Materials'}</div>
                <div className="flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${Math.max(permitsPct, 4)}%`, backgroundColor: '#f97316' }} title={`Permits: ${formatCurrency(permitsMid)}`}>{permitsPct > 12 && 'Permits'}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#4f6bf5' }} /><span className="font-medium text-ink">Labor</span><span className="text-ink-400">{formatCurrency(laborMid)}</span></div>
              <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#22c55e' }} /><span className="font-medium text-ink">Materials</span><span className="text-ink-400">{formatCurrency(materialsMid)}</span></div>
              <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#f97316' }} /><span className="font-medium text-ink">Permits &amp; Fees</span><span className="text-ink-400">{formatCurrency(permitsMid)}</span></div>
            </div>
            {estimate.region_multiplier && (
              <p className="mt-5 rounded-xl bg-canvas-100 px-4 py-3 text-sm text-ink-500">{'\U0001F4CD'} Local pricing adjustment: {estimate.region_multiplier.toFixed(2)}x in ZIP {project.zip_code}</p>
            )}
          </div>
        </section>

        {/* 3. WHAT WE FOUND */}
        <section className="mx-auto w-full max-w-4xl">
          <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50"><Search className="h-5 w-5 text-amber-500" /></div>
              <div><h2 className="text-xl font-bold text-ink sm:text-2xl">What We Found</h2><p className="text-sm text-ink-400">AI analysis of your photo &mdash; {detectedFeatures.length} data points</p></div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {detectedFeatures.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-hairline bg-canvas-50 px-4 py-3">
                  <div><p className="text-xs font-medium text-ink-400">{f.label}</p><p className="text-sm font-semibold text-ink">{f.value}</p></div>
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white', confidenceColor(f.confidence))}>{f.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3b. ASSUMPTIONS + RISK */}
        <section className="mx-auto w-full max-w-4xl">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/20"><CheckCircle2 className="h-4 w-4 text-mint" /></div><h3 className="text-sm font-bold text-ink">Key Assumptions</h3></div>
              <ul className="space-y-2 text-sm text-ink-600">
                {estimateAssumptions.length > 0 ? estimateAssumptions.slice(0, 5).map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-mint" /><span>{item}</span></li>
                )) : <li className="flex gap-2 text-ink-400">Standard planning assumptions applied for this project type.</li>}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50"><Ruler className="h-4 w-4 text-orange-500" /></div><h3 className="text-sm font-bold text-ink">What to Verify</h3></div>
              <ul className="space-y-2 text-sm text-ink-600">
                {riskNotes.length > 0 ? riskNotes.slice(0, 5).map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" /><span>{item}</span></li>
                )) : <li className="flex gap-2 text-ink-400">Verify all measurements and conditions onsite before committing to quotes.</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. MATERIALS accordion */}
        <section id="section-materials" className="mx-auto w-full max-w-4xl scroll-mt-20">
          <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50"><Wrench className="h-5 w-5 text-sky-500" /></div><div><h2 className="text-xl font-bold text-ink sm:text-2xl">Shopping List</h2><p className="text-sm text-ink-400">Materials with prices and links</p></div></div>
              <div className="flex items-center gap-2">
                {materials && <Badge variant="green">{materials.line_items.length} items</Badge>}
                {materials && (
                  <button type="button" onClick={handleRegenerateMaterials} disabled={isRegenerating} className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-soft transition-all hover:bg-canvas-50 hover:shadow-md disabled:opacity-50">
                    <RefreshCw className={cn('h-3.5 w-3.5', isRegenerating && 'animate-spin')} />{isRegenerating ? 'Refreshing...' : 'Refresh'}
                  </button>
                )}
              </div>
            </div>
            {regenError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{regenError}</div>}
            {materials ? <MaterialsAccordion materials={materials} /> : (
              <div className="flex items-center gap-4 rounded-[1.5rem] border border-hairline bg-canvas-50 p-6">
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-sand-dark" /><div><p className="font-semibold text-ink">Building your materials list...</p><p className="mt-1 text-sm text-ink-500">Real products with prices will appear here automatically.</p></div>
              </div>
            )}
          </div>
        </section>

        {/* 5. CONTRACTOR BRIEF (print-friendly) */}
        <section id="section-brief" className="mx-auto w-full max-w-4xl scroll-mt-20">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50"><FileText className="h-5 w-5 text-purple-500" /></div><div><h2 className="text-xl font-bold text-ink sm:text-2xl">Contractor Brief</h2><p className="text-sm text-ink-400 print:hidden">Print or share with your contractor for accurate quotes</p></div></div>
            <div className="flex gap-2 print:hidden">
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90"><Download className="h-4 w-4" /> Print</button>
              <div className="w-44"><ShareButton shareUrl={shareUrl} variant="light" projectTitle={`${categoryLabel} brief`} /></div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
            {brief ? <ProjectBriefDocument project={project} categoryLabel={categoryLabel} estimate={estimate} materials={materials} brief={brief} likelyTrades={likelyTrades} siteQuestions={siteQuestions} subtitle="Share this with your contractor for accurate, comparable quotes." /> : (
              <div className="flex items-center gap-4 rounded-[1.5rem] border border-hairline bg-canvas-50 p-6"><Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-sand-dark" /><div><p className="font-semibold text-ink">Writing your contractor brief...</p><p className="mt-1 text-sm text-ink-500">This will appear automatically when ready.</p></div></div>
            )}
          </div>
        </section>

        {/* 6. MARKET INTELLIGENCE REPORT */}
        <section className="mx-auto w-full max-w-4xl">
          <IntelligenceReportComponent report={intelligenceReport ?? null} />
        </section>

        {/* 7. COST PLAYGROUND */}
        {estimate && (
          <section className="mx-auto w-full max-w-4xl">
            <CostPlayground
              initialEstimate={estimate}
              initialTier={project.quality_tier}
              initialStyle={project.style_preference || 'modern'}
              projectId={projectId}
              category={project.project_category}
              zipCode={project.zip_code}
              notes={project.notes || ''}
              onEstimateUpdate={(newEstimate) => setEstimate(newEstimate)}
            />
          </section>
        )}

        {/* 8. VIDEO FLYTHROUGH */}
        <section className="mx-auto w-full max-w-4xl">
          <VideoFlythrough
            videoUrl={projectVideo?.video_url || undefined}
            thumbnailUrl={projectVideo?.thumbnail_url || undefined}
            isGenerating={isGeneratingVideo}
          />
        </section>

        {/* 9. CONTRACTOR LEAD CAPTURE */}
        <section className="mx-auto w-full max-w-4xl print:hidden">
          <div className={cn(
            'rounded-[1.75rem] border p-6 shadow-soft sm:p-8 transition-all',
            leadSubmitted
              ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
              : 'border-hairline bg-gradient-to-br from-indigo-50 to-white'
          )}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl',
                  leadSubmitted ? 'bg-emerald-100' : 'bg-indigo-100'
                )}>
                  {leadSubmitted ? (
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  ) : (
                    <UserPlus className="h-7 w-7 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink">
                    {leadSubmitted ? 'Request Submitted!' : 'Ready to get started?'}
                  </h2>
                  <p className="mt-1 text-sm text-ink-500">
                    {leadSubmitted
                      ? 'Your project scope is locked and ready. A Naili advisor will connect you with qualified contractors.'
                      : 'Submit your project scope to get matched with verified local contractors.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {leadSubmitted ? (
                  <Badge variant="green" className="text-sm">{'\u2713'} Lead submitted</Badge>
                ) : (
                  <Link
                    href={matchHref}
                    onClick={() => posthog.capture('naili_match_cta_clicked', { project_id: projectId, placement: 'footer' })}
                    className="inline-flex items-center justify-center rounded-xl border border-hairline bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition-all hover:bg-canvas-50"
                  >
                    Browse contractors
                  </Link>
                )}
                {!leadSubmitted && (
                  <button
                    type="button"
                    onClick={() => setLeadModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:opacity-95 hover:shadow-lift"
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Get Connected
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <Disclaimer text={DISCLAIMERS.estimate} className="print:hidden" />
      </div>

      {/* LEAD MODAL */}
      <ContractorLeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        projectId={projectId}
        estimateMid={estimate.mid_estimate}
      />
    </div>
  );
}
