'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Ruler,
  Search,
  Sparkles,
  UserPlus,
  Wrench,
  List,
  DollarSign,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  Building2,
  Paintbrush,
  Zap,
  HardHat,
  Hammer,
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
import AnnotatedConcepts from '@/components/vision/AnnotatedConcepts';
import type { Estimate, IntelligenceReport, MaterialList, Project, ProjectBrief, ProjectVideo, QualityTier, StylePreference, ProjectCategory } from '@/types';
import IntelligenceReportComponent from '@/components/vision/IntelligenceReport';
import CostPlayground from '@/components/vision/CostPlayground';
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

interface SectionNav {
  id: string;
  label: string;
  icon: typeof Layers;
}

const NAV_SECTIONS: SectionNav[] = [
  { id: 'section-hero', label: 'Overview', icon: ImageIcon },
  { id: 'section-compare', label: 'Before & After', icon: Layers },
  { id: 'section-annotated', label: 'Annotated Concept', icon: MapPin },
  { id: 'section-cost', label: 'Cost Breakdown', icon: DollarSign },
  { id: 'section-materials', label: 'Materials', icon: ShoppingBag },
  { id: 'section-brief', label: 'Project Brief', icon: ClipboardList },
  { id: 'section-intel', label: 'Intel Report', icon: TrendingUp },
  { id: 'section-contractors', label: 'Contractors', icon: Building2 },
];

function tierLabel(tier: Project['quality_tier']) {
  switch (tier) {
    case 'budget': return 'Budget';
    case 'premium': return 'Premium';
    default: return 'Mid-Range';
  }
}

function categoryEmoji(cat: string): string {
  const m: Record<string, string> = {
    kitchen: '🍳', bathroom: '🚿', roofing: '🏠',
    deck_patio: '🪬', landscaping: '🌿', exterior_paint: '🎨',
    flooring: '🪵', interior_paint: '🖌️', custom_project: '🏡',
  };
  return m[cat] || '🔨';
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

const MATERIAL_CATEGORY_ICONS: Record<string, any> = {
  Countertop: Paintbrush,
  Flooring: Ruler,
  Cabinetry: Layers,
  'Wall Finish': Paintbrush,
  'Tile Work': Zap,
  Fixtures: Wrench,
  Lighting: Zap,
  Plumbing: Wrench,
  Electrical: Zap,
  Labor: HardHat,
  default: ShoppingBag,
};

function getMaterialCategoryIcon(cat: string) {
  const key = Object.keys(MATERIAL_CATEGORY_ICONS).find(k => cat.toLowerCase().includes(k.toLowerCase()));
  return MATERIAL_CATEGORY_ICONS[key || 'default'];
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
  conceptImageCountRef.current = conceptImages.length;
  const needsPolling = !estimate || !materials || !brief || conceptImages.length === 0;

  const [activeSection, setActiveSection] = useState('section-hero');

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
      const data = await res.json() as { project: Project; estimate: Estimate | null; materials: MaterialList | null; brief: ProjectBrief | null; };
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

  const mockAnnotations = useMemo(() => {
    if (!materials?.line_items) return [];
    return materials.line_items.slice(0, 8).map((item, i) => ({
      materialName: item.item,
      category: item.category,
      x: 20 + ((i * 25) % 70),
      y: 25 + ((i * 20) % 55),
      price: '$' + item.estimated_cost_low.toLocaleString() + ' - $' + item.estimated_cost_high.toLocaleString(),
      shopUrl: item.retailer_url || undefined,
      quantity: item.quantity + ' ' + item.unit,
    }));
  }, [materials]);

  useEffect(() => setMounted(true), []);

  const laborMid = estimate?.estimate_breakdown?.labor_mid ?? (estimate ? Math.round(estimate.mid_estimate * 0.58) : 0);
  const materialsMidEst = estimate?.estimate_breakdown?.materials_mid ?? (estimate ? Math.round(estimate.mid_estimate * 0.3) : 0);
  const permitsMid = estimate ? Math.round(estimate.mid_estimate * 0.05) : 0;
  const totalBd = laborMid + materialsMidEst + permitsMid;
  const laborPct = totalBd > 0 ? (laborMid / totalBd) * 100 : 58;
  const materialsPct = totalBd > 0 ? (materialsMidEst / totalBd) * 100 : 30;
  const permitsPct = totalBd > 0 ? (permitsMid / totalBd) * 100 : 5;

  const detectedFeatures = useMemo(() => buildDetectedFeatures(project, estimate, materials), [project, estimate, materials]);
  const matchHref = '/get-quotes?project=' + encodeURIComponent(projectId) + '&zip=' + encodeURIComponent(project.zip_code) + '&category=' + encodeURIComponent(project.project_category) + '&estimate=' + encodeURIComponent(String(estimate?.mid_estimate || ''));

  useEffect(() => {
    const ids = NAV_SECTIONS.map(s => s.id).filter(id => document.getElementById(id));
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [conceptImages, estimate]);

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
      setMaterials({ ...nm, id: materials?.id || '', project_id: projectId, created_at: materials?.created_at || new Date().toISOString() });
      posthog.capture('naili_materials_regenerated', { project_id: projectId });
    } catch (err) {
      setRegenError('Could not refresh materials. Please try again.');
      console.error('Regenerate materials error:', err);
    } finally { setIsRegenerating(false); }
  };

  const [intelligenceReport, setIntelligenceReport] = useState<IntelligenceReport | null | undefined>(undefined);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [hasAttemptedIntelligence, setHasAttemptedIntelligence] = useState(false);

  useEffect(() => {
    if (!project?.zip_code || hasAttemptedIntelligence) return;
    setHasAttemptedIntelligence(true);
    setIsLoadingIntelligence(true);
    fetch('/api/vision/intelligence-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId, zip_code: project.zip_code, category: project.project_category,
        style: project.style_preference, quality_tier: project.quality_tier, notes: project.notes,
      }),
    })
      .then((r) => r.json())
      .then((data) => setIntelligenceReport((data.report as IntelligenceReport) || null))
      .catch(() => setIntelligenceReport(null))
      .finally(() => setIsLoadingIntelligence(false));
  }, [project?.zip_code, hasAttemptedIntelligence, project.zip_code, project.project_category, project.quality_tier, project.style_preference, project.notes, projectId]);

  useEffect(() => {
    posthog.capture('naili_results_viewed', { project_id: projectId, zip_code: project.zip_code, project_category: project.project_category, quality_tier: project.quality_tier });
  }, [project.project_category, project.quality_tier, project.zip_code, projectId]);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const SidebarNav = () => (
    <nav className="space-y-0.5">
      {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollToSection(id)}
          className={cn(
            'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-300',
            activeSection === id
              ? 'bg-ink/5 text-ink shadow-sm'
              : 'text-ink-400 hover:bg-canvas-100 hover:text-ink-600'
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{label}</span>
          {activeSection === id && (
            <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500/60 transition-all duration-300" />
          )}
        </button>
      ))}
    </nav>
  );

  // Loading skeleton
  if (!estimate) {
    if (isTimedOut) {
      return (
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-20">
          <div className="relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-ink">Still working on your plan...</h2>
          <p className="mt-2 max-w-md text-center text-sm text-ink-500">The initial calculation is taking a moment.</p>
          <button onClick={handleRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:opacity-90">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <section className="relative mb-0 overflow-hidden rounded-b-[2rem] bg-[linear-gradient(135deg,#0f1115_0%,#1a1d25_50%,#0f1115_100%)] shadow-[0_32px_100px_rgba(0,0,0,0.3)] sm:rounded-b-[2.5rem]">
          <div className="px-4 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-12">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-2 h-3 w-40 rounded-full bg-white/5 animate-pulse" />
              <div className="mx-auto h-16 w-72 rounded-xl bg-white/10 animate-pulse sm:h-20 sm:w-96" />
              <div className="mx-auto mt-3 h-3 w-48 rounded-full bg-white/5 animate-pulse" />
            </div>
            <div className="mx-auto max-w-4xl">
              <div className="aspect-[4/3] w-full rounded-[1.5rem] bg-white/5 animate-pulse" />
            </div>
          </div>
        </section>
        <div className="-mt-4 space-y-10 sm:space-y-14 lg:space-y-16">
          {[1, 2, 3, 4].map((s) => (
            <section key={s} className="mx-auto w-full max-w-4xl">
              <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft sm:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-canvas-200 animate-pulse" />
                  <div className="flex-1"><div className="h-5 w-48 rounded bg-canvas-200 animate-pulse" /><div className="mt-1 h-3 w-36 rounded bg-canvas-200 animate-pulse" /></div>
                </div>
                <div className="mb-6 h-7 w-full rounded-full bg-canvas-200 animate-pulse" />
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className={cn('mx-auto transition-opacity duration-700', mounted ? 'opacity-100' : 'opacity-0')}>
      {/* STICKY ESTIMATE BAR */}
      <div className={cn(
        'fixed left-0 right-0 top-0 z-40 border-b border-hairline bg-white/95 shadow-soft backdrop-blur-md transition-all duration-400 print:hidden',
        stickyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">Estimate</span>
            <span className="text-xl font-bold text-ink">{formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLeadModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <MessageSquareText className="h-3.5 w-3.5" /> Get Contractor Quotes
            </button>
            <Link
              href={matchHref}
              onClick={() => posthog.capture('naili_match_cta_clicked', { project_id: projectId, placement: 'sticky' })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-white px-3.5 py-2 text-xs font-semibold text-ink transition-all hover:bg-canvas-50"
            >
              Browse All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE TABBAR NAV */}
      <div className="sticky top-0 z-30 overflow-x-auto border-b border-hairline bg-white/90 backdrop-blur-md lg:hidden print:hidden scrollbar-none">
        <div className="flex gap-1.5 px-4 py-2.5 min-w-max">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={cn(
                'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap',
                activeSection === id
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-500 hover:bg-canvas-100'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:pb-16">
        <div className="flex gap-8">
          {/* DESKTOP SIDEBAR NAV */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-64 lg:flex-shrink-0 lg:self-start">
            <div className="rounded-xl border border-hairline bg-white/70 backdrop-blur-xl p-3 shadow-soft">
              <div className="mb-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                <List className="mr-1.5 inline-block h-3 w-3" />
                Sections
              </div>
              <SidebarNav />
            </div>
          </aside>

          {/* MAIN */}
          <div className="min-w-0 flex-1">
            {/* ===== 1. HERO ===== */}
            <section id="section-hero" className="scroll-mt-20 scroll-animate">
              <div className="relative mb-4 overflow-hidden rounded-b-[2rem] bg-[linear-gradient(135deg,#0f1115_0%,#1a1d25_50%,#0f1115_100%)] shadow-[0_32px_100px_rgba(0,0,0,0.3)] sm:rounded-b-[2.5rem]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(216,185,138,0.10),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(100,200,170,0.06),transparent_40%)]" />
                <div className="relative px-4 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-12 lg:px-12">
                  <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                    <Badge variant="gray" className="border-white/15 bg-white/8 text-white/80">{categoryEmoji(project.project_category)} {categoryLabel}</Badge>
                    <Badge variant="gray" className="border-white/15 bg-white/8 text-white/80"><MapPin className="mr-0.5 h-3 w-3" /> ZIP {project.zip_code}</Badge>
                    <Badge variant="gray" className="border-white/15 bg-white/8 text-white/80">{tierLabel(project.quality_tier)}</Badge>
                  </div>
                  <div className="mb-6 text-center">
                    <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                      Your {categoryLabel} Renovation Plan
                    </h1>
                    <p className="mt-3 text-sm text-white/50">
                      📍 {project.zip_code} · {tierLabel(project.quality_tier)} · Photos analyzed: {project.uploaded_image_urls?.length || 1}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== 2. BEFORE & AFTER ===== */}
            <section id="section-compare" className="scroll-mt-20 scroll-animate">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50"><Layers className="h-5 w-5 text-indigo-500" /></div>
                  <div><h2 className="text-xl font-bold text-ink sm:text-2xl">Before &amp; After</h2><p className="text-sm text-ink-400">Drag to compare original with renovation concept</p></div>
                </div>
              </div>
              {originalImage && (
                <div className="space-y-4">
                  {hasAnyConcepts ? (
                    <>
                      <BeforeAfterSlider beforeImage={originalImage} afterImage={conceptImages[selectedConcept]} beforeLabel="Before" afterLabel="After" priority />
                      <p className="text-center text-xs text-ink-400 italic">AI-generated concept - final results may vary.</p>
                      {conceptImages.length > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-1">
                          {conceptImages.map((url, i) => (
                            <button
                              key={url}
                              onClick={() => setSelectedConcept(i)}
                              className={cn(
                                'relative h-16 w-24 overflow-hidden rounded-lg border-2 transition-all duration-200',
                                selectedConcept === i
                                  ? 'border-amber-500/60 shadow-[0_0_20px_rgba(216,185,138,0.2)]'
                                  : 'border-hairline opacity-50 hover:opacity-80'
                              )}
                            >
                              <img src={url} alt={'Concept ' + (i + 1)} className="h-full w-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="relative overflow-hidden rounded-[1.5rem]">
                      <img src={originalImage} alt="Original photo" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <Sparkles className="h-8 w-8 animate-pulse text-amber-300" />
                          <p className="text-lg font-bold text-white">Generating concepts...</p>
                          <p className="text-sm text-white/60">AI is creating your before &amp; after visual</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ===== 3. ANNOTATED CONCEPT ===== */}
            <section id="section-annotated" className="scroll-mt-20 scroll-animate">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50"><MapPin className="h-5 w-5 text-amber-600" /></div>
                  <div><h2 className="text-xl font-bold text-ink sm:text-2xl">Annotated Concept</h2><p className="text-sm text-ink-400">Interactive hotspots with material details</p></div>
                </div>
              </div>
              {hasAnyConcepts && mockAnnotations.length > 0 ? (
                <AnnotatedConcepts
                  imageUrl={conceptImages[selectedConcept]}
                  annotations={mockAnnotations}
                  onAnnotationClick={(a) => posthog.capture('naili_annotation_clicked', { project_id: projectId, material: a.materialName })}
                />
              ) : (
                <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-8 text-center shadow-soft">
                  <MapPin className="mx-auto mb-3 h-8 w-8 text-ink-300" />
                  <p className="text-ink-400 text-sm">Annotations will appear once concepts and materials are ready.</p>
                </div>
              )}
            </section>

            {/* ===== 4. COST BREAKDOWN ===== */}
            <section id="section-cost" className="scroll-mt-20 scroll-animate">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
                  <div><h2 className="text-xl font-bold text-ink sm:text-2xl">Cost Breakdown</h2><p className="text-sm text-ink-400">Estimated project costs by category</p></div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-hairline bg-gradient-to-br from-emerald-50/50 to-white p-6 shadow-soft sm:p-8">
                <div className="mb-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">Estimated Cost Range</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                    {formatCurrencyRange(estimate.low_estimate, estimate.high_estimate)}
                  </p>
                  <p className="mt-1 text-sm text-ink-400">
                    Midpoint: <span className="font-semibold text-ink">{formatCurrency(estimate.mid_estimate)}</span>
                  </p>
                </div>

                {/* Bar chart */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-ink">How your budget breaks down</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-ink"><HardHat className="mr-1.5 inline-block h-4 w-4 text-emerald-500" /> Labor</span>
                        <span className="text-ink-500">{formatCurrency(laborMid)} ({Math.round(laborPct)}%)</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: laborPct + '%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-ink"><ShoppingBag className="mr-1.5 inline-block h-4 w-4 text-blue-500" /> Materials</span>
                        <span className="text-ink-500">{formatCurrency(materialsMidEst)} ({Math.round(materialsPct)}%)</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-blue-100">
                        <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: materialsPct + '%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-ink"><FileText className="mr-1.5 inline-block h-4 w-4 text-amber-500" /> Permits &amp; Fees</span>
                        <span className="text-ink-500">{formatCurrency(permitsMid)} ({Math.round(permitsPct)}%)</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100">
                        <div className="h-full rounded-full bg-amber-500 transition-all duration-1000" style={{ width: permitsPct + '%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {estimate?.region_multiplier && (
                  <div className="mt-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                    <span className="text-sm font-medium text-ink"><MapPin className="mr-1.5 inline-block h-4 w-4 text-emerald-600" /> Regional cost factor</span>
                    <Badge variant="green">{estimate.region_multiplier.toFixed(2)}x</Badge>
                  </div>
                )}
              </div>

              {/* Interactive CostPlayground */}
              {estimate && (
                <CostPlayground
                  projectId={projectId}
                  initialEstimate={estimate}
                  initialTier={project.quality_tier}
                  initialStyle={(project.style_preference || 'modern') as StylePreference}
                  category={project.project_category}
                  zipCode={project.zip_code}
                  notes={project.notes || ''}
                  onEstimateUpdate={setEstimate}
                />
              )}
            </section>

            {/* ===== 5. MATERIALS & SUPPLIES ===== */}
            <section id="section-materials" className="scroll-mt-20 scroll-animate">
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><ShoppingBag className="h-5 w-5 text-blue-600" /></div>
                    <div><h2 className="text-xl font-bold text-ink sm:text-2xl">Materials &amp; Supplies</h2><p className="text-sm text-ink-400">Everything needed for this renovation</p></div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateMaterials}
                    disabled={isRegenerating}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-semibold text-ink transition-all hover:bg-canvas-50 disabled:opacity-50"
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', isRegenerating && 'animate-spin')} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
                {regenError && <p className="mt-1 text-xs text-red-500">{regenError}</p>}
              </div>

              {materials ? (
                <div className="space-y-4">
                  {/* Material cards grid */}
                  {materials.line_items.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {materials.line_items.map((item, idx) => {
                        const IconComp = getMaterialCategoryIcon(item.category);
                        return (
                          <div key={idx} className="flex items-start gap-3 rounded-xl border border-hairline bg-canvas-50 p-4 shadow-soft transition-all hover:shadow-md">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                              <IconComp className="h-5 w-5 text-ink-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-ink truncate">{item.item}</p>
                              <p className="text-xs text-ink-400">{item.quantity} {item.unit}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="gray" className="text-[10px]">{item.category}</Badge>
                                <span className="text-xs font-medium text-emerald-600">{formatCurrency(item.estimated_cost_low)} - {formatCurrency(item.estimated_cost_high)}</span>
                              </div>
                              {item.retailer_url && (
                                <a href={item.retailer_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                  <ShoppingBag className="h-3 w-3" /> Shop
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <MaterialsAccordion materials={materials} />
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-8 text-center shadow-soft">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-ink-300" />
                  <p className="text-ink-400 text-sm">Loading materials list...</p>
                </div>
              )}
            </section>

            {/* ===== 6. PROJECT BRIEF ===== */}
            <section id="section-brief" className="scroll-mt-20 scroll-animate">
              {brief ? (
                <ProjectBriefDocument project={project} brief={brief} estimate={estimate} materials={materials} categoryLabel={categoryLabel} />
              ) : (
                <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-8 text-center shadow-soft">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-ink-300" />
                  <p className="text-ink-400 text-sm">Loading project brief...</p>
                </div>
              )}
            </section>

            {/* ===== 7. INTELLIGENCE REPORT ===== */}
            <section id="section-intel" className="scroll-mt-20 scroll-animate">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                  <div><h2 className="text-xl font-bold text-ink sm:text-2xl">Intelligence Report</h2><p className="text-sm text-ink-400">Market data, trends, and insights for your area</p></div>
                </div>
              </div>
              {intelligenceReport ? (
                <IntelligenceReportComponent report={intelligenceReport} />
              ) : isLoadingIntelligence ? (
                <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-8 text-center shadow-soft">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-400" />
                  <p className="text-ink-400 text-sm">Loading market intelligence...</p>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-8 text-center shadow-soft">
                  <TrendingUp className="mx-auto mb-3 h-8 w-8 text-ink-300" />
                  <p className="text-ink-400 text-sm">Intelligence report will appear once available.</p>
                </div>
              )}
            </section>

            {/* ===== 8. GET CONTRACTORS ===== */}
            <section id="section-contractors" className="scroll-mt-20 scroll-animate print:hidden">
              <div className={cn(
                'rounded-[1.75rem] p-6 shadow-soft sm:p-8 transition-all',
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
                        <Building2 className="h-7 w-7 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-ink">
                        {leadSubmitted ? 'Request Submitted!' : 'Ready to get started?'}
                      </h2>
                      <p className="mt-1 text-sm text-ink-500">
                        {leadSubmitted
                          ? 'Your project scope is locked. A Naili advisor will connect you with qualified contractors.'
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
                        className="inline-flex items-center justify-center rounded-xl border border-hairline bg-canvas-50 px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition-all hover:bg-canvas-50"
                      >
                        Browse contractors
                      </Link>
                    )}
                    {!leadSubmitted && (
                      <button
                        type="button"
                        aria-label="Get connected with contractors"
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
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-canvas-100 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] print:hidden',
          stickyVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

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
