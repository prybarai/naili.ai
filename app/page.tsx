'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  Sparkles,
  Trash2,
  Upload,
  Camera,
} from 'lucide-react';
import { PROJECT_CATEGORIES, STYLE_OPTIONS, type ProjectCategory, type QualityTier, type StylePreference } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import posthog from 'posthog-js';

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

/* ── Progress Status Definitions ── */
const PROGRESS_STEPS = [
  { key: 'analyzing', label: 'Analyzing your photos...', icon: '📸' },
  { key: 'estimating', label: 'Calculating your estimate...', icon: '📐' },
  { key: 'materials', label: 'Finding materials...', icon: '📦' },
  { key: 'brief', label: 'Preparing your project brief...', icon: '📝' },
  { key: 'concepts', label: 'Generating design concepts...', icon: '🎨' },
] as const;

type ProgressKey = (typeof PROGRESS_STEPS)[number]['key'];

/* ═══════════════════════════════════════════════════════════════════
   Main Component — Single-page renovation quote flow
   ═══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const hasPushedRef = useRef(false);

  /* ── Input state ── */
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [zipCode, setZipCode] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('interior_paint');
  const [style, setStyle] = useState<StylePreference>('modern');
  const [qualityTier, setQualityTier] = useState<QualityTier>('mid');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  /* ── Generation state ── */
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
    onDrop,
    onDropRejected,
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

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeoutMs = 20000
  ): Promise<Response | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return res;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  const markFinished = (key: ProgressKey) => {
    setFinishedSteps((prev) => new Set(prev).add(key));
  };

  const handleGenerate = async () => {
    if (!canSubmit) {
      if (files.length === 0) setError('Drop at least one photo.');
      else if (zipCode.trim().length !== 5) setError('Enter a valid ZIP code.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(['analyzing', 'estimating', 'materials', 'brief', 'concepts']);
    setFinishedSteps(new Set());

    try {
      const sessionId = uuidv4();

      posthog.capture('naili_generation_started', {
        category,
        style,
        quality_tier: qualityTier,
        photo_count: files.length,
      });

      // 1. Create project
      markFinished('analyzing');
      const projectRes = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_type: PROJECT_CATEGORIES[category].type,
          project_category: category,
          zip_code: zipCode.trim(),
          style_preference: style,
          quality_tier: qualityTier,
          notes: notes.trim() || undefined,
          session_id: sessionId,
        }),
      });

      if (!projectRes.ok) {
        const body = await projectRes.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error || 'Could not create project.'
        );
      }

      const { project } = (await projectRes.json()) as { project: { id: string } };
      const projectId = project.id;
      markFinished('estimating');

      // 2. Upload photos
      let referenceImageUrl = '';
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);
        const uploadRes = await fetch('/api/projects/upload-image', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const { url } = (await uploadRes.json()) as { url: string };
          if (!referenceImageUrl) referenceImageUrl = url;
        }
      }

      if (!referenceImageUrl) {
        throw new Error('Could not upload photos.');
      }

      // 3. Fire ALL APIs in parallel
      markFinished('materials');
      const results = await Promise.allSettled([
        fetchWithTimeout('/api/vision/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: referenceImageUrl,
            category,
            zip_code: zipCode.trim(),
            notes: notes.trim() || undefined,
          }),
        }),
        fetchWithTimeout('/api/vision/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            category,
            location_type: PROJECT_CATEGORIES[category].type,
            style,
            quality_tier: qualityTier,
            zip_code: zipCode.trim(),
            notes: notes.trim() || undefined,
          }),
        }),
        fetchWithTimeout('/api/vision/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            category,
            style,
            quality_tier: qualityTier,
            estimate_mid: 15000,
            notes: notes.trim() || undefined,
          }),
        }),
        fetchWithTimeout('/api/vision/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            category,
            style,
            quality_tier: qualityTier,
            notes: notes.trim() || undefined,
            estimate_low: 10000,
            estimate_high: 20000,
          }),
        }),
        fetchWithTimeout('/api/vision/generate-concepts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            category,
            style,
            quality_tier: qualityTier,
            notes: notes.trim() || undefined,
            reference_image_url: referenceImageUrl,
            count: 2,
          }),
        }),
      ]);

      // Log which APIs succeeded/failed
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        console.warn(
          `${failed.length}/${results.length} API calls failed/timed out. Navigating anyway.`
        );
      }

      markFinished('brief');
      markFinished('concepts');

      // 4. Navigate to results after a brief pause so user sees completion
      hasPushedRef.current = true;
      await new Promise((r) => setTimeout(r, 600));
      router.push(`/vision/results/${projectId}`);

      posthog.capture('naili_generation_completed', {
        category,
        style,
        quality_tier: qualityTier,
        project_id: projectId,
      });
    } catch (err) {
      console.error(err);
      posthog.capture('naili_generation_failed', {
        category,
        style,
        quality_tier: qualityTier,
      });
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      setLoading(false);
      setProgress([]);
      setFinishedSteps(new Set());
    }
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */

  // ── Progress screen during generation ──
  if (loading) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,185,138,0.12),transparent_55%)]" />
        <div className="relative z-10 mx-auto w-full max-w-lg text-center">
          <Card className="p-8 sm:p-10">
            {/* Animated icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-light/20">
              <Loader2 className="h-8 w-8 animate-spin text-sand-dark" />
            </div>

            <h2 className="text-2xl font-bold text-ink">Building your plan</h2>
            <p className="mt-2 text-sm text-ink-500">
              Analyzing your photos and crunching the numbers...
            </p>

            {/* Progress steps */}
            <div className="mt-8 space-y-3 text-left">
              {PROGRESS_STEPS.map((step) => {
                const isFinished = finishedSteps.has(step.key);
                const isActive = progress.includes(step.key) && !isFinished;
                return (
                  <div
                    key={step.key}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all',
                      isFinished
                        ? 'bg-mint/10 text-ink'
                        : isActive
                          ? 'bg-sand-light/10 text-ink'
                          : 'text-ink-400'
                    )}
                  >
                    <span className="shrink-0 text-lg">
                      {isFinished ? '✅' : step.icon}
                    </span>
                    <span className="flex-1 font-medium">{step.label}</span>
                    {isFinished && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-mint" />
                    )}
                    {isActive && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sand-dark" />
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-xs text-ink-400">
              This usually takes about 15–30 seconds
            </p>
          </Card>
        </div>
      </main>
    );
  }

  // ── Input form ──
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-canvas px-4 py-12 sm:py-16">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,185,138,0.12),transparent_55%)]" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        {/* ── Hero ── */}
        <div className="mb-10 text-center animate-reveal-up">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            See exactly what your{' '}
            <span className="bg-gradient-to-r from-sand-dark to-amber-600 bg-clip-text text-transparent">
              renovation
            </span>{' '}
            will cost
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-500 sm:text-lg">
            Upload a photo, enter your ZIP, get a real estimate in seconds.
            Powered by AI that actually looks at your space.
          </p>
        </div>

        {/* ── Photo upload ── */}
        <Card className="p-5 transition-all duration-300 hover:shadow-lift sm:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
            Upload photos
          </p>
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer rounded-[1.75rem] border-2 border-dashed p-6 text-center transition-all duration-300 sm:p-8',
              isDragActive
                ? 'border-sand-dark bg-sand-light/20 scale-[1.02] shadow-glow'
                : files.length === 0
                  ? 'border-panel hover:border-sand hover:bg-canvas-50 animate-pulse-soft'
                  : 'border-panel hover:border-sand hover:bg-canvas-50'
            )}
          >
            <input {...getInputProps()} />
            {previews.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {previews.map((preview, idx) => (
                    <div key={preview} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Upload ${idx + 1}`}
                        className="h-24 w-32 rounded-2xl object-cover shadow-sm transition-all duration-300 group-hover:scale-[1.02] sm:h-28 sm:w-36"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(idx);
                        }}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-panel bg-canvas-50 shadow-sm opacity-0 transition-opacity duration-200 hover:bg-canvas-200 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3 text-ink-600" />
                      </button>
                    </div>
                  ))}
                </div>
                {files.length < MAX_FILES && (
                  <p className="text-sm text-ink-500">
                    Drop more photos or click to add
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas-200 text-sand-dark transition-transform duration-300 hover:scale-110">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="text-lg font-semibold text-ink">
                  Drop your photos here
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {SUPPORTED_IMAGE_LABEL} &middot; Up to {MAX_FILES} photos
                </p>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-mint" /> Good lighting
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-mint" /> Show the whole room
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-mint" /> Multiple angles help
            </span>
          </div>
        </Card>

        {/* ── ZIP Code ── */}
        <div className="mt-5">
          <Card className="p-5 transition-all duration-300 hover:shadow-lift sm:p-6">
            <Input
              label="Your ZIP code for local pricing"
              placeholder="10001"
              value={zipCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZipCode(v);
              }}
              required
            />
          </Card>
        </div>

        {/* ── Project category ── */}
        <div className="mt-5">
          <Card className="p-5 transition-all duration-300 hover:shadow-lift sm:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
              What are you planning?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES_FOR_DISPLAY.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'rounded-xl border px-3 py-4 text-left transition-all duration-200 hover:-translate-y-0.5',
                    category === cat.value
                      ? 'border-sand-dark bg-gradient-to-br from-sand-light/20 to-amber-50 ring-1 ring-sand-dark shadow-soft'
                      : 'border-panel bg-canvas-50 hover:border-sand hover:shadow-soft'
                  )}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <p className="mt-1 text-sm font-semibold text-ink">{cat.label}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Style + quality ── */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Card className="p-5 transition-all duration-300 hover:shadow-lift sm:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
              Style direction
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STYLE_OPTIONS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setStyle(key as StylePreference)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5',
                    style === key
                      ? 'border-sand-dark bg-gradient-to-br from-sand-light/20 to-amber-50 font-semibold text-ink shadow-soft'
                      : 'border-panel bg-canvas-50 text-ink-600 hover:border-sand hover:shadow-soft'
                  )}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 transition-all duration-300 hover:shadow-lift sm:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
              Finish quality
            </p>
            <div className="flex flex-wrap gap-2">
              {QUALITY_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => setQualityTier(tier.value)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5',
                    qualityTier === tier.value
                      ? 'border-sand-dark bg-gradient-to-br from-sand-light/20 to-amber-50 font-semibold text-ink shadow-soft'
                      : 'border-panel bg-canvas-50 text-ink-600 hover:border-sand hover:shadow-soft'
                  )}
                >
                  {tier.emoji} {tier.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-500">
              {QUALITY_TIERS.find((t) => t.value === qualityTier)?.label === 'Budget'
                ? 'Cost-conscious materials, good for rentals or quick cleanups.'
                : qualityTier === 'mid'
                  ? 'Best default — balances durability, looks, and resale value.'
                  : 'Higher-end finishes, upgraded materials, custom detailing.'}
            </p>
          </Card>
        </div>

        {/* ── Notes ── */}
        <div className="mt-5">
          <Card className="p-5 transition-all duration-300 hover:shadow-lift sm:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
              Anything else to share? (optional)
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you're hoping to change, any specific materials, or concerns..."
              className="min-h-[80px] w-full resize-y rounded-xl border border-panel bg-canvas-50 p-3 text-sm text-ink placeholder:text-ink-400 transition-all duration-200 focus:border-sand-dark focus:outline-none focus:ring-1 focus:ring-sand-dark focus:shadow-soft"
              rows={3}
            />
          </Card>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mt-5 animate-reveal-up rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-soft">
            {error}
          </div>
        )}

        {/* ── Generate button ── */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="w-full max-w-md px-10 py-5 text-lg shadow-soft transition-all duration-300 hover:shadow-lift hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Get your estimate
          </Button>

          {!error && !canSubmit && (
            <p className="text-xs text-ink-400 animate-reveal-up">
              {files.length === 0 && 'Drop at least one photo to get started'}
              {files.length > 0 && zipCode.trim().length !== 5 && 'Enter a 5-digit ZIP code to continue'}
            </p>
          )}
        </div>

        {/* ── Trust line ── */}
        <div className="mt-10">
          <Card className="p-5 text-center transition-all duration-300 hover:shadow-lift sm:p-6">
            <div className="mb-2 flex items-center justify-center gap-2 font-semibold text-ink">
              <Camera className="h-4 w-4 text-sand-dark" />
              Built from your photo, not a formula
            </div>
            <p className="text-sm text-ink-500">
              Your estimate uses your photos, your choices, and real regional cost
              data — not a generic average. Every assumption is listed so you know
              where the number comes from.
            </p>
          </Card>
        </div>

        <p className="mt-8 text-center text-xs text-ink-400">
          Your photos are used only to generate your estimate and design concepts.
          <br />
          No generic averages. Every number comes from your photo + local market data.
        </p>
      </div>
    </main>
  );
}
