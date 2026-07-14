'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Sparkles,
  Trash2,
  Camera,
  ArrowRight,
} from 'lucide-react';

import { PROJECT_CATEGORIES, STYLE_OPTIONS, type ProjectCategory, type QualityTier, type StylePreference } from '@/types';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import posthog from 'posthog-js';
import dynamic from 'next/dynamic';

const BelowFoldSections = dynamic(() => import('@/components/BelowFoldSections'), { ssr: false });

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_LABEL = 'JPG, PNG, or WEBP up to 10MB';
const MAX_FILES = 3;

function revokePreviewUrls(urls: string[]) {
  urls.forEach((url) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  });
}

function getFileRejectionMessage(rejections: FileRejection[]) {
  const firstError = rejections[0]?.errors[0];
  if (!firstError) return `Please upload ${SUPPORTED_IMAGE_LABEL}.`;
  if (firstError.code === 'file-too-large') return 'That photo is too large. Use images under 10MB each.';
  if (firstError.code === 'file-invalid-type') return `Format not supported. Please use ${SUPPORTED_IMAGE_LABEL}.`;
  if (firstError.code === 'too-many-files') return 'Maximum 3 photos.';
  return firstError.message || `Please upload ${SUPPORTED_IMAGE_LABEL}.`;
}

const QUALITY_TIERS = [
  { value: 'budget' as QualityTier, label: 'Budget', emoji: '💰' },
  { value: 'mid' as QualityTier, label: 'Mid-range', emoji: '⭐' },
  { value: 'premium' as QualityTier, label: 'Premium', emoji: '💎' },
];

const CATEGORIES_FOR_DISPLAY = Object.entries(PROJECT_CATEGORIES).map(([key, val]) => ({
  value: key as ProjectCategory,
  ...val,
}));

const PROGRESS_STEPS = [
  { key: 'analyzing', label: 'Analyzing your photos...', icon: '📸' },
  { key: 'estimating', label: 'Calculating your estimate...', icon: '📐' },
  { key: 'materials', label: 'Finding materials...', icon: '📦' },
  { key: 'brief', label: 'Preparing your project brief...', icon: '📝' },
  { key: 'concepts', label: 'Generating design concepts...', icon: '🎨' },
] as const;

type ProgressKey = (typeof PROGRESS_STEPS)[number]['key'];

/* ─────────────────────────────────────────────────────────────
   PAGE — GrowGardens-inspired design for Naili
   ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const hasPushedRef = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [zipCode, setZipCode] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('interior_paint');
  const [style, setStyle] = useState<StylePreference>('modern');
  const [qualityTier, setQualityTier] = useState<QualityTier>('mid');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressKey[]>([]);
  const [finishedSteps, setFinishedSteps] = useState<Set<ProgressKey>>(new Set());


  const canSubmit = useMemo(
    () => files.length > 0 && zipCode.trim().length === 5,
    [files.length, zipCode]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      const toAdd = acceptedFiles.slice(0, remaining);
      if (toAdd.length === 0) return prev;
      const newUrls = toAdd.map((f) => URL.createObjectURL(f));
      setPreviews((p) => [...p, ...newUrls]);
      setError(null);
      posthog.capture('naili_home_photos_dropped', { count: toAdd.length });
      return [...prev, ...toAdd];
    });
  }, []);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    setError(getFileRejectionMessage(rejections));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, onDropRejected,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: MAX_FILES,
    maxSize: MAX_UPLOAD_BYTES,
    multiple: true,
    // Mobile: prompt camera immediately
    useFsAccessApi: false,
  });

  // Override input attrs to add mobile camera capture
  const mobileInputProps = {
    ...getInputProps(),
    capture: undefined, // Let mobile browsers decide between camera+gallery
    multiple: true,
  };

  const removePhoto = (index: number) => {
    revokePreviewUrls([previews[index]]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 20000): Promise<Response | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } catch { return null; } finally { clearTimeout(timer); }
  };

  // Extended timeout for image generation which takes 30-60s
  const fetchWithLongTimeout = async (url: string, options: RequestInit): Promise<Response | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } catch { return null; } finally { clearTimeout(timer); }
  };

  const markFinished = (key: ProgressKey) => setFinishedSteps((prev) => new Set(prev).add(key));

  const handleGenerate = async () => {
    if (!canSubmit) {
      if (files.length === 0) setError('Drop at least one photo.');
      else if (zipCode.trim().length !== 5) setError('Enter a valid ZIP code.');
      return;
    }
    setLoading(true); setError(null);
    setProgress(['analyzing', 'estimating', 'materials', 'brief', 'concepts']);
    setFinishedSteps(new Set());
    try {
      const sessionId = uuidv4();
      posthog.capture('naili_generation_started', { category, style, quality_tier: qualityTier, photo_count: files.length });
      markFinished('analyzing');
      const projectRes = await fetch('/api/projects/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_type: PROJECT_CATEGORIES[category].type, project_category: category, zip_code: zipCode.trim(),
          style_preference: style, quality_tier: qualityTier, notes: notes.trim() || undefined, session_id: sessionId,
        }),
      });
      if (!projectRes.ok) throw new Error('Could not create project.');
      const { project } = (await projectRes.json()) as { project: { id: string } };
      const projectId = project.id;
      markFinished('estimating');
      const uploadResults = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('project_id', projectId);
          const uploadRes = await fetch('/api/projects/upload-image', { method: 'POST', body: formData });
          if (uploadRes.ok) {
            const { url } = (await uploadRes.json()) as { url: string };
            return url;
          }
          return null;
        })
      );
      const urls = uploadResults.filter(Boolean) as string[];
      if (urls.length === 0) throw new Error('Could not upload photos.');
      const referenceImageUrl = urls[0];

      // Step 1: Analyze photo via DeepSeek vision
      const photoAnalysisRes = await fetchWithTimeout('/api/vision/analyze-photo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: referenceImageUrl, category, zip_code: zipCode.trim(), notes: notes.trim() || undefined }),
      });

      // Step 2: Get the real estimate (this produces mid/low/high values we need)
      const estimateRes = await fetchWithTimeout('/api/vision/estimate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId, category, location_type: PROJECT_CATEGORIES[category].type,
          style, quality_tier: qualityTier, zip_code: zipCode.trim(), notes: notes.trim() || undefined,
        }),
      });

      // Extract real estimate values for downstream calls
      let estimateMid = 15000;
      let estimateLow = 10000;
      let estimateHigh = 20000;
      if (estimateRes && estimateRes.ok) {
        const estimateData = await estimateRes.json();
        const est = estimateData.estimate || estimateData;
        estimateMid = est.estimate_mid ?? est.mid ?? estimateMid;
        estimateLow = est.estimate_low ?? est.low ?? estimateLow;
        estimateHigh = est.estimate_high ?? est.high ?? estimateHigh;
      }
      markFinished('estimating');

      // Step 3: Fire materials, brief, and concepts in parallel with REAL estimate values
      await Promise.allSettled([
        fetchWithTimeout('/api/vision/materials', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, estimate_mid: estimateMid, notes: notes.trim() || undefined }),
        }),
        fetchWithTimeout('/api/vision/brief', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, notes: notes.trim() || undefined, estimate_low: estimateLow, estimate_high: estimateHigh }),
        }),
        fetchWithLongTimeout('/api/vision/generate-concepts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, notes: notes.trim() || undefined, reference_image_url: referenceImageUrl, count: 2 }),
        }),
      ]);
      markFinished('materials');
      markFinished('brief');
      markFinished('concepts');
      hasPushedRef.current = true;
      await new Promise((r) => setTimeout(r, 600));
      router.push(`/vision/results/${projectId}`);
      posthog.capture('naili_generation_completed', { category, style, quality_tier: qualityTier, project_id: projectId });
    } catch (err) {
      console.error(err);
      posthog.capture('naili_generation_failed', { category, style, quality_tier: qualityTier });
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false); setProgress([]); setFinishedSteps(new Set());
    }
  };

  /* ── Progress screen ── */
  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#1b1d22] via-[#242831] to-[#1b1d22] flex flex-col items-center justify-center px-4">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,185,138,0.10),transparent_55%)]" />
        <div className="relative z-10 mx-auto w-full max-w-lg text-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 sm:p-10">
            <div className="mx-auto mb-6 relative">
              <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border-2 border-dashed border-sand/20" />
              <div className="relative flex h-16 w-16 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sand" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Building your plan</h2>
            <p className="mt-2 text-sm text-white/50">Analyzing your photos and crunching the numbers...</p>
            <div className="mt-8 space-y-3 text-left">
              {PROGRESS_STEPS.map((step) => {
                const isFinished = finishedSteps.has(step.key);
                const isActive = progress.includes(step.key);
                if (!isActive) return null;
                return (
                  <div key={step.key} className={cn('flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-500', isFinished && 'bg-white/5')}>
                    <span className="text-lg">{isFinished ? '✅' : step.icon}</span>
                    <span className={cn('text-sm', isFinished ? 'text-white/70' : 'text-white/90')}>{step.label}</span>
                    {!isFinished && <Loader2 className="ml-auto h-4 w-4 animate-spin text-sand" />}
                    {isFinished && <CheckCircle2 className="ml-auto h-4 w-4 text-green-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Landing page ── */
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(216,185,138,0.12),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(184,216,200,0.08),transparent_50%)]" />

      <div className="relative z-20">
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': 'https://www.naili.ai/#website',
                url: 'https://www.naili.ai',
                name: 'Naili',
                description: 'Upload a photo, get a data-backed renovation estimate in seconds. Smart renovation planning for homeowners.',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://www.naili.ai/search?q={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'Organization',
                '@id': 'https://www.naili.ai/#organization',
                name: 'Naili',
                url: 'https://www.naili.ai',
                description: 'AI-powered renovation planning platform. Get realistic estimates, material lists, and design concepts from a single photo.',
                sameAs: [
                  'https://twitter.com/naili_ai',
                  'https://www.linkedin.com/company/naili-ai',
                ],
                foundingDate: '2025',
              },
            ],
          }),
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ═══════════ HERO ═══════════ */}
        <div className="pt-24 sm:pt-28 lg:pt-32 pb-4 text-center">
          <div className="animate-reveal-up">
            <p className="nl-eyebrow">Smart Renovation Planning</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="text-ink">Know what your </span>
              <span className="nl-gradient-text">renovation</span>
              <br />
              <span className="text-ink">costs before you start</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-ink-500 leading-relaxed">
              Upload a photo, tell us your zip code, and get a real, data-backed estimate in seconds — not days.
            </p>
          </div>
        </div>

        {/* ═══════════ UPLOAD ZONE ═══════════ */}
        <div className="mx-auto max-w-3xl">
          <div className="animate-reveal-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
            <div {...getRootProps()} className={cn(
              'relative cursor-pointer rounded-[2rem] border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-500',
              isDragActive
                ? 'border-sand bg-sand/10 scale-[1.02] shadow-[0_0_60px_rgba(216,185,138,0.25)]'
                : previews.length > 0
                  ? 'border-sand-dark/40 bg-white/60 hover:border-sand-dark hover:shadow-[0_0_40px_rgba(216,185,138,0.15)]'
                  : 'border-ink/15 bg-white/70 hover:border-sand-dark/50 hover:bg-white/80 hover:shadow-[0_0_40px_rgba(216,185,138,0.12)]'
            )}>
              <input {...mobileInputProps} />
              {previews.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-3">
                    {previews.map((preview, idx) => (
                      <div key={preview} className="group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt={`Upload ${idx + 1}`} loading="eager" className="h-28 w-36 rounded-2xl object-cover shadow-md transition-all duration-300 group-hover:scale-[1.03] sm:h-32 sm:w-40" />
                        <button type="button" aria-label="Remove photo" onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-panel bg-canvas-50 shadow-md opacity-0 transition-all duration-200 hover:bg-canvas-200 group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5 text-ink-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {files.length < MAX_FILES && <p className="text-sm text-ink-500">Drop more photos or click to add</p>}
                </div>
              ) : (
                <>
                  <div className="mx-auto mb-5 relative">
                    <div className="absolute inset-0 animate-[float_3s_ease-in-out_infinite]">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-sand/20 to-amber-50 blur-xl" />
                    </div>
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sand/20 to-amber-50 text-sand-dark mx-auto transition-transform duration-300 hover:scale-110">
                      <Camera className="h-9 w-9" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-ink">Upload your space</p>
                  <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto">Drop a photo of the room or area you want to renovate. The more angles, the better your estimate.</p>
                  <p className="mt-3 text-xs text-ink-400">{SUPPORTED_IMAGE_LABEL} &middot; Up to {MAX_FILES} photos</p>
                </>
              )}
            </div>
          </div>
            {/* 📱 Mobile fallback: always-visible file picker button */}
            <div className="mt-4 sm:hidden">
              <label htmlFor="mobile-file-input" className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-sand-dark/50 bg-white/80 px-6 py-3 text-sm font-semibold text-ink shadow-soft transition-all hover:bg-sand-light/20 active:scale-[0.98]">
                <Camera className="h-4 w-4" />
                Choose photos
              </label>
              <input
                id="mobile-file-input"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => {
                  const chosenFiles = Array.from(e.target.files || []);
                  if (chosenFiles.length > 0) {
                    onDrop(chosenFiles);
                  }
                  e.target.value = '';
                }}
              />
            </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-ink-500 animate-reveal-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-mint" /> Good lighting</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-mint" /> Show the whole room</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-mint" /> Multiple angles help</span>
          </div>

          {/* ═══════════ CATEGORY SELECTOR ═══════════ */}
          <div className="mt-8 animate-reveal-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <p className="nl-eyebrow text-center">What are you planning?</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {CATEGORIES_FOR_DISPLAY.map((cat) => (
                <button key={cat.value} onClick={() => setCategory(cat.value)} className={cn(
                  'rounded-xl border px-2 py-3 text-center transition-all duration-200 hover:-translate-y-0.5',
                  category === cat.value
                    ? 'border-sand-dark bg-gradient-to-br from-sand-light/30 to-amber-50 ring-1 ring-sand-dark shadow-soft'
                    : 'border-panel bg-white/60 hover:border-sand hover:shadow-soft backdrop-blur-sm'
                )}>
                  <span className="text-xl sm:text-2xl">{cat.emoji}</span>
                  <p className="mt-1 text-[11px] sm:text-xs font-semibold text-ink leading-tight">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════ DETAILS ROW ═══════════ */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3 animate-reveal-up" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
            <div className="rounded-xl border border-panel bg-white/60 backdrop-blur-sm p-4 transition-all hover:border-sand/50 hover:shadow-soft">
              <label className="mono-label flex items-center gap-1.5 mb-2"><MapPin className="h-3 w-3" /> ZIP code</label>
              <input type="text" inputMode="numeric" placeholder="10001" value={zipCode}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 5); setZipCode(v); }}
                className="w-full bg-transparent text-ink text-lg font-bold placeholder:text-ink-400 focus:outline-none" required />
            </div>
            <div className="rounded-xl border border-panel bg-white/60 backdrop-blur-sm p-4 transition-all hover:border-sand/50 hover:shadow-soft">
              <p className="mono-label mb-2">Style</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(STYLE_OPTIONS).map(([key, val]) => (
                  <button key={key} onClick={() => setStyle(key as StylePreference)} className={cn(
                    'rounded-lg border px-2 py-1 text-[11px] transition-all',
                    style === key ? 'border-sand-dark bg-sand-light/20 font-semibold text-ink' : 'border-panel bg-white/40 text-ink-500 hover:border-sand'
                  )}>{val.label}</button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-panel bg-white/60 backdrop-blur-sm p-4 transition-all hover:border-sand/50 hover:shadow-soft">
              <p className="mono-label mb-2">Finish</p>
              <div className="flex gap-1.5">
                {QUALITY_TIERS.map((tier) => (
                  <button key={tier.value} onClick={() => setQualityTier(tier.value)} className={cn(
                    'flex-1 rounded-lg border px-2 py-1 text-[11px] text-center transition-all',
                    qualityTier === tier.value ? 'border-sand-dark bg-sand-light/20 font-semibold text-ink' : 'border-panel bg-white/40 text-ink-500 hover:border-sand'
                  )}>{tier.emoji} {tier.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 animate-reveal-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else to share? (optional) — specific materials, colors, or concerns..."
              className="w-full resize-y rounded-xl border border-panel bg-white/60 backdrop-blur-sm p-3 text-sm text-ink placeholder:text-ink-400 transition-all duration-200 focus:border-sand-dark focus:outline-none focus:ring-1 focus:ring-sand-dark focus:shadow-soft" rows={2} />
          </div>

          {error && <div className="mt-4 animate-reveal-up rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-soft">{error}</div>}

          {/* ═══════════ CTA BUTTON ═══════════ */}
          <div className="mt-8 flex flex-col items-center gap-3 animate-reveal-up" style={{ animationDelay: '0.45s', animationFillMode: 'both' }}>
            <button onClick={handleGenerate} disabled={!canSubmit} className={cn(
              'group relative w-full max-w-lg overflow-hidden rounded-full px-10 py-5 text-xl font-bold transition-all duration-300',
              canSubmit
                ? 'bg-ink text-canvas-50 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_32px_rgba(23,24,28,0.2)] hover:shadow-[0_12px_40px_rgba(23,24,28,0.3)]'
                : 'bg-ink/60 text-white/50 cursor-not-allowed'
            )}>
              {canSubmit && (
                <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
              )}
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Sparkles className="h-6 w-6" />
                Get my realistic estimate
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            {!error && !canSubmit && (
              <p className="text-xs text-ink-400">
                {files.length === 0 && 'Drop at least one photo to get started'}
                {files.length > 0 && zipCode.trim().length !== 5 && 'Enter a 5-digit ZIP code to continue'}
              </p>
            )}
          </div>

          <div className="mt-5 text-center animate-reveal-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-3 text-xs text-ink-400">
              <span className="flex items-center gap-1"><Camera className="h-3 w-3 text-sand-dark" /> Based on your photos</span>
              <span className="w-px h-3 bg-ink/10" />
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-sand-dark" /> Local pricing data</span>
              <span className="w-px h-3 bg-ink/10" />
              <span className="flex items-center gap-1">💯 No generic averages</span>
            </div>
          </div>
        </div>

        <BelowFoldSections />
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
    </div>
  );
}
