'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { PROJECT_CATEGORIES, STYLE_OPTIONS, type ProjectCategory, type QualityTier, type StylePreference } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import type { VisionAnalysis } from '@/lib/visionAnalysis';
import posthog from 'posthog-js';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const SUPPORTED_IMAGE_LABEL = 'JPG, PNG, or WEBP up to 10MB';
const MAX_FILES = 3;

type Step = 'details' | 'working';

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
  { value: 'budget' as QualityTier, label: 'Budget', emoji: '💰', desc: 'Cost-conscious materials, good for rentals or quick cleanups.' },
  { value: 'mid' as QualityTier, label: 'Mid-range', emoji: '⭐', desc: 'Best default — balances durability, looks, and resale value.' },
  { value: 'premium' as QualityTier, label: 'Premium', emoji: '💎', desc: 'Higher-end finishes, upgraded materials, custom detailing.' },
];

const CATEGORIES_FOR_DISPLAY = Object.entries(PROJECT_CATEGORIES).map(([key, val]) => ({
  value: key as ProjectCategory,
  ...val,
}));

interface Props {
  initialPrefill?: {
    zip?: string;
    image?: string;
  };
}

/* ── Category selector ── */
function CategorySelector({
  selected,
  onSelect,
}: {
  selected: ProjectCategory | null;
  onSelect: (c: ProjectCategory) => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
        What are you planning?
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CATEGORIES_FOR_DISPLAY.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={cn(
              'rounded-xl border px-3 py-4 text-left transition-all',
              selected === cat.value
                ? 'border-sand-dark bg-sand-light/10 ring-1 ring-sand-dark'
                : 'border-panel bg-canvas-50 hover:border-sand hover:bg-canvas-100'
            )}
          >
            <span className="text-xl">{cat.emoji}</span>
            <p className="mt-1 text-sm font-semibold text-ink">{cat.label}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ── Style & Quality inline ── */
function StyleQualityPicker({
  style,
  qualityTier,
  onStyleChange,
  onQualityChange,
}: {
  style: StylePreference;
  qualityTier: QualityTier;
  onStyleChange: (s: StylePreference) => void;
  onQualityChange: (q: QualityTier) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
          Style direction
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STYLE_OPTIONS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => onStyleChange(key as StylePreference)}
              className={cn(
                'rounded-xl border px-3 py-2 text-sm transition-all',
                style === key
                  ? 'border-sand-dark bg-sand-light/20 font-semibold text-ink'
                  : 'border-panel bg-canvas-50 text-ink-600 hover:border-sand'
              )}
            >
              {val.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
          Finish quality
        </p>
        <div className="flex flex-wrap gap-2">
          {QUALITY_TIERS.map((tier) => (
            <button
              key={tier.value}
              onClick={() => onQualityChange(tier.value)}
              className={cn(
                'rounded-xl border px-3 py-2 text-sm transition-all',
                qualityTier === tier.value
                  ? 'border-sand-dark bg-sand-light/20 font-semibold text-ink'
                  : 'border-panel bg-canvas-50 text-ink-600 hover:border-sand'
              )}
            >
              {tier.emoji} {tier.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          {QUALITY_TIERS.find((t) => t.value === qualityTier)?.desc}
        </p>
      </Card>
    </div>
  );
}

/* ── Summary sidebar ── */
function SummarySidebar({
  files,
  previews,
  zipCode,
  category,
  style,
  qualityTier,
  error,
  onGo,
  canGo,
  loading,
}: {
  files: File[];
  previews: string[];
  zipCode: string;
  category: ProjectCategory | null;
  style: StylePreference;
  qualityTier: QualityTier;
  error: string | null;
  onGo: () => void;
  canGo: boolean;
  loading: boolean;
}) {
  return (
    <Card className="bg-[linear-gradient(135deg,#1b1d22_0%,#242831_46%,#1b1d22_100%)] p-5 text-white sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
        Your inputs
      </p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="rounded-2xl bg-white/10 px-3 py-2">
          <span className="text-white/60">Photos:</span>{' '}
          {files.length} uploaded
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2">
          <MapPin className="mr-1 inline h-3 w-3" />
          <span className="text-white/60">ZIP:</span> {zipCode}
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2">
          <span className="text-white/60">Project:</span>{' '}
          {category ? PROJECT_CATEGORIES[category].label : 'Not set'}
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2">
          <span className="text-white/60">Style:</span> {STYLE_OPTIONS[style]?.label}
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2">
          <span className="text-white/60">Quality:</span>{' '}
          {QUALITY_TIERS.find((t) => t.value === qualityTier)?.label || qualityTier}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <Button
        className="mt-5 w-full"
        size="lg"
        onClick={onGo}
        disabled={!canGo || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" /> Generate my plan
          </>
        )}
      </Button>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */
export default function VisionStartFlow({ initialPrefill }: Props) {
  const router = useRouter();
  const hasPushedRef = useRef(false);

  const [step, setStep] = useState<Step>('details');
  const [zipCode, setZipCode] = useState(initialPrefill?.zip || '');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState<ProjectCategory>('interior_paint');
  const [style, setStyle] = useState<StylePreference>('modern');
  const [qualityTier, setQualityTier] = useState<QualityTier>('mid');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canGo = useMemo(
    () => files.length > 0 && zipCode.trim().length === 5 && category !== null,
    [files.length, zipCode, category]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      const toAdd = acceptedFiles.slice(0, remaining);
      if (toAdd.length === 0) return prev;
      const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
      setPreviews((p) => [...p, ...newPreviews]);
      setError(null);
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

  /** Helper: fetch with timeout */
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

  const handleGenerate = async () => {
    if (!canGo) {
      if (files.length === 0) setError('Drop at least one photo.');
      else if (zipCode.trim().length !== 5) setError('Enter a valid ZIP code.');
      else if (!category) setError('Select a project type.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionId = uuidv4();

      posthog.capture('naili_generation_started', {
        category,
        style,
        quality_tier: qualityTier,
        photo_count: files.length,
      });

      // 1. Create project
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

      // 3. Fire ALL APIs in parallel, each with a 20s timeout.
      //    We collect results and navigate regardless of individual failures.
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
          `${failed.length}/${results.length} API calls failed/ timed out. Navigating anyway.`
        );
      }

      // 4. Navigate to results after all API calls complete
      setStep('working');
      hasPushedRef.current = true;
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
    }
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  if (step === 'working') {
    return null; // We're navigating away
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Tell us about your project
        </h1>
        <p className="mt-2 text-base text-ink-500">
          Fine-tune your estimate with a few quick choices.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Upload Zone */}
          <Card className="p-5 sm:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
              Upload photos
            </p>
            <div
              {...getRootProps()}
              className={cn(
                'cursor-pointer rounded-[1.75rem] border-2 border-dashed p-6 text-center transition-colors sm:p-8',
                isDragActive
                  ? 'border-sand-dark bg-canvas-200'
                  : 'border-panel hover:border-sand hover:bg-canvas-50'
              )}
            >
              <input {...getInputProps()} />
              {previews.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-3">
                    {previews.map((preview, idx) => (
                      <div key={preview} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt={`Upload ${idx + 1}`}
                          className="h-24 w-32 rounded-2xl object-cover shadow-sm sm:h-28 sm:w-36"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(idx);
                          }}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-panel bg-canvas-50 shadow-sm hover:bg-canvas-200"
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
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas-200 text-sand-dark">
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

            <div className="mt-4">
              <Input
                label="ZIP code for local pricing"
                placeholder="10001"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                required
              />
            </div>
          </Card>

          {/* Project type */}
          <CategorySelector selected={category} onSelect={setCategory} />

          {/* Notes */}
          <Card className="p-5 sm:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
              Anything else to share? (optional)
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you're hoping to change, any specific materials, or concerns..."
              className="min-h-[80px] w-full resize-y rounded-xl border border-panel bg-canvas-50 p-3 text-sm text-ink placeholder:text-ink-400 focus:border-sand-dark focus:outline-none focus:ring-1 focus:ring-sand-dark"
              rows={3}
            />
          </Card>

          {/* Style + Quality */}
          <StyleQualityPicker
            style={style}
            qualityTier={qualityTier}
            onStyleChange={setStyle}
            onQualityChange={setQualityTier}
          />
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <SummarySidebar
            files={files}
            previews={previews}
            zipCode={zipCode}
            category={category}
            style={style}
            qualityTier={qualityTier}
            error={error}
            onGo={handleGenerate}
            canGo={canGo}
            loading={loading}
          />

          <Card className="p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
              <Info className="h-4 w-4 text-sand-dark" />
              Built for confidence
            </div>
            <p className="text-sm text-ink-500">
              Your estimate uses your photos, your choices, and real regional cost
              data — not a generic average. Every assumption is listed so you know
              where the number comes from.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
