'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

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
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

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
  });

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
      let referenceImageUrl = '';
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);
        const uploadRes = await fetch('/api/projects/upload-image', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const { url } = (await uploadRes.json()) as { url: string };
          if (!referenceImageUrl) referenceImageUrl = url;
        }
      }
      if (!referenceImageUrl) throw new Error('Could not upload photos.');
      markFinished('materials');
      await Promise.allSettled([
        fetchWithTimeout('/api/vision/analyze-photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: referenceImageUrl, category, zip_code: zipCode.trim(), notes: notes.trim() || undefined }) }),
        fetchWithTimeout('/api/vision/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: projectId, category, location_type: PROJECT_CATEGORIES[category].type, style, quality_tier: qualityTier, zip_code: zipCode.trim(), notes: notes.trim() || undefined }) }),
        fetchWithTimeout('/api/vision/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, estimate_mid: 15000, notes: notes.trim() || undefined }) }),
        fetchWithTimeout('/api/vision/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, notes: notes.trim() || undefined, estimate_low: 10000, estimate_high: 20000 }) }),
        fetchWithTimeout('/api/vision/generate-concepts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, notes: notes.trim() || undefined, reference_image_url: referenceImageUrl, count: 2 }) }),
      ]);
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
      <main className="relative min-h-screen bg-gradient-to-br from-[#1b1d22] via-[#242831] to-[#1b1d22] flex flex-col items-center justify-center px-4">
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
      </main>
    );
  }

  /* ── Landing page ── */
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(216,185,138,0.12),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(184,216,200,0.08),transparent_50%)]" />

      <div className="relative z-20">
        <Nav />
      </div>

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
              <input {...getInputProps()} />
              {previews.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-3">
                    {previews.map((preview, idx) => (
                      <div key={preview} className="group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt={`Upload ${idx + 1}`} className="h-28 w-36 rounded-2xl object-cover shadow-md transition-all duration-300 group-hover:scale-[1.03] sm:h-32 sm:w-40" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-panel bg-white shadow-md opacity-0 transition-all duration-200 hover:bg-canvas-200 group-hover:opacity-100">
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
                className="w-full bg-transparent text-ink text-lg font-bold placeholder:text-ink-300 focus:outline-none" required />
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

        {/* ═══════════ HOW IT WORKS — Numbered steps ═══════════ */}
        <div className="nl-section pb-8">
          <p className="nl-eyebrow text-center">How It Works</p>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-ink mb-8">From photo to renovation plan in minutes</h2>
          <div className="grid gap-6 sm:grid-cols-4">
            {[{ step: '1', emoji: '📸', title: 'Upload a Photo', desc: 'Snap a picture of the room or outdoor space.' },
              { step: '2', emoji: '🎯', title: 'Choose Your Scope', desc: 'Tell us your ZIP, style, and quality level.' },
              { step: '3', emoji: '🤖', title: 'AI Analyzes Everything', desc: 'Naili estimates costs, lists materials, and generates concepts.' },
              { step: '4', emoji: '📋', title: 'Get Your Plan', desc: 'Full estimate + materials + design concepts in one page.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="nl-step mx-auto">{item.step}</div>
                <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
                <p className="text-sm text-ink-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative section break */}
        <div className="nl-image-break">
          <div className="h-48 sm:h-56 bg-gradient-to-r from-sand/10 via-sand-light/20 to-mint/10 rounded-[2rem] flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl block mb-2">🏠</span>
              <p className="text-sm text-ink-400 italic">Your renovation, visualized</p>
            </div>
          </div>
        </div>

        {/* ═══════════ STATS — Gradient text ═══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[{ value: '50+', label: 'Project Categories' }, { value: 'Smart', label: 'AI Engine' }, { value: 'Free', label: 'To Get Started' }, { value: 'Real', label: 'Local Pricing' }].map((stat) => (
            <div key={stat.label} className="nl-stat">
              <div className="nl-gradient-text nl-stat__value">{stat.value}</div>
              <p className="nl-stat__label">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ═══════════ FEATURES — Card grid ═══════════ */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[{ emoji: '🧠', title: 'Smart Cost Engine', desc: 'Real, data-backed estimates for any renovation — not generic averages. Powered by local pricing across 50+ categories.' },
            { emoji: '🎨', title: 'Design Concepts', desc: 'See AI-generated before-and-after concepts of your specific space. Visualize your dream renovation before spending a dime.' },
            { emoji: '📦', title: 'Materials & Brief', desc: 'Get a complete project brief with material list, step-by-step scope, and everything you need to hire or DIY.' },
          ].map((card) => (
            <div key={card.title} className="nl-card text-center">
              <div className="text-3xl mb-3">{card.emoji}</div>
              <h3 className="font-bold text-ink mb-1">{card.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* ═══════════ GUIDES — Zone cards linking to blog ═══════════ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div><p className="nl-eyebrow">Renovation Guides</p><h2 className="font-bold text-lg text-ink">What you need to know</h2></div>
            <Link href="/blog" className="text-xs text-ink-500 hover:text-ink transition-colors">View all →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { slug: 'kitchen-remodel-cost', name: 'Kitchen Renovation Costs', desc: 'What to expect for a full kitchen remodel in 2026 — from budget to premium.' },
              { slug: 'bathroom-remodel-cost', name: 'Bathroom Remodel Guide', desc: 'Step-by-step walkthrough of a bathroom renovation, including permits and timeline.' },
              { slug: 'interior-painting-cost', name: 'Painting & Finishing Tips', desc: 'How to estimate paint quantities, prep surfaces, and choose the right finish.' },
            ].map((guide) => (
              <Link key={guide.slug} href={`/blog/${guide.slug}`} className="nl-zone">
                <div className="nl-zone__name">{guide.name}</div>
                <p className="text-sm text-ink-500">{guide.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════ CALCULATORS — One more nudge ═══════════ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div><p className="nl-eyebrow">Free Tools</p><h2 className="font-bold text-lg text-ink">Renovation calculators</h2></div>
            <Link href="/calculators" className="text-xs text-ink-500 hover:text-ink transition-colors">Try them →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/calculators" className="nl-zone">
              <div className="nl-zone__name">💰 Quick Cost Estimator</div>
              <p className="text-sm text-ink-500">Ballpark any renovation by category, square footage, and quality level.</p>
            </Link>
            <Link href="/calculators" className="nl-zone">
              <div className="nl-zone__name">📈 ROI Calculator</div>
              <p className="text-sm text-ink-500">See typical resale value recoup rates for kitchens, baths, roofing, and more.</p>
            </Link>
            <Link href="/calculators" className="nl-zone">
              <div className="nl-zone__name">📦 Material Estimator</div>
              <p className="text-sm text-ink-500">Quick quantity estimates for paint, flooring, tile, and other materials.</p>
            </Link>
          </div>
        </div>

        {/* ═══════════ NEWSLETTER ═══════════ */}
        <div className="nl-newsletter mb-8">
          <p className="nl-eyebrow">Stay Updated</p>
          <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">Renovation tips, straight to your inbox</h2>
          <p className="text-sm text-ink-500 max-w-md mx-auto mb-6">Get monthly cost trends, project ideas, and pro tips — free.</p>
          {newsletterSubmitted ? (
            <div className="flex items-center justify-center gap-2 text-sm text-mint font-semibold">
              <CheckCircle2 className="h-4 w-4" /> You&apos;re subscribed!
            </div>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = (e.target as HTMLFormElement).email?.value;
              if (email) { posthog.capture('naili_newsletter_signup', { email }); setNewsletterSubmitted(true); setShowNewsletterForm(false); }
            }}>
              {showNewsletterForm ? (
                <div className="flex gap-2 max-w-sm mx-auto flex-wrap justify-center">
                  <input type="email" name="email" placeholder="your@email.com" required className="flex-1 min-w-[200px] rounded-full border border-panel bg-canvas px-4 py-2.5 text-sm text-ink outline-none focus:border-sand focus:ring-2 focus:ring-sand/20" />
                  <button type="submit" className="rounded-full bg-ink text-canvas-50 px-5 py-2.5 text-sm font-semibold transition hover:opacity-90">Subscribe</button>
                </div>
              ) : (
                <button onClick={() => setShowNewsletterForm(true)} className="rounded-full bg-ink text-canvas-50 px-6 py-2.5 text-sm font-semibold transition hover:opacity-90">
                  Join the list
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />
    </main>
  );
}
