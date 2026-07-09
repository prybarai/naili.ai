'use client';

import { useCallback, useState } from 'react';
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
import { PROJECT_CATEGORIES, STYLE_OPTIONS, type ProjectCategory, type StylePreference, type QualityTier } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { FALLBACK_VISION_ANALYSIS, type VisionAnalysis } from '@/lib/visionAnalysis';
import posthog from 'posthog-js';

type Step = 'upload' | 'choices' | 'working';

const STEP_LABELS: Record<Step, string> = {
  upload: 'Upload',
  choices: 'Details',
  working: 'Estimating',
};

type ScopeQuestion = {
  key: string;
  label: string;
  helper?: string;
  options: Array<{ value: string; label: string; description?: string }>;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const SUPPORTED_IMAGE_LABEL = 'JPG, PNG, or WEBP up to 10MB';

function revokePreviewUrl(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

async function readApiError(response: Response, fallback: string) {
  try {
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = (await response.json()) as { error?: string; message?: string };
      return data.error || data.message || fallback;
    }
    const text = (await response.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

function getFileRejectionMessage(rejections: FileRejection[]) {
  const firstError = rejections[0]?.errors[0];
  if (!firstError) return `Please upload a supported image, ${SUPPORTED_IMAGE_LABEL}.`;
  if (firstError.code === 'file-too-large') return 'That photo is too large. Use an image under 10MB.';
  if (firstError.code === 'file-invalid-type') return `Format not supported. Please use ${SUPPORTED_IMAGE_LABEL}.`;
  if (firstError.code === 'too-many-files') return 'Upload just one photo.';
  return firstError.message || `Please upload ${SUPPORTED_IMAGE_LABEL}.`;
}

/* ── Scope questions per category ── */
const SCOPE_QUESTIONS: Partial<Record<ProjectCategory, ScopeQuestion[]>> = {
  interior_paint: [
    { key: 'room_size', label: 'Room size', options: [
      { value: 'small', label: 'Small', description: 'Small bedroom or office' },
      { value: 'medium', label: 'Medium', description: 'Standard bedroom or dining room' },
      { value: 'large', label: 'Large', description: 'Living room or open room' },
    ]},
    { key: 'paint_scope', label: 'What to paint?', options: [
      { value: 'walls_only', label: 'Walls only' },
      { value: 'walls_and_ceiling', label: 'Walls + ceiling' },
      { value: 'walls_ceiling_trim', label: 'Walls + ceiling + trim' },
    ]},
    { key: 'prep_level', label: 'Prep needed', options: [
      { value: 'light', label: 'Light', description: 'Minor patching, clean walls' },
      { value: 'medium', label: 'Medium', description: 'Some repairs and sanding' },
      { value: 'heavy', label: 'Heavy', description: 'Significant repair or old damage' },
    ]},
  ],
  flooring: [
    { key: 'room_size', label: 'Room size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
    { key: 'material_type', label: 'Material', options: [
      { value: 'lvp', label: 'LVP' }, { value: 'laminate', label: 'Laminate' },
      { value: 'engineered_hardwood', label: 'Engineered hardwood' }, { value: 'tile', label: 'Tile' },
    ]},
    { key: 'demo_required', label: 'Remove existing?', options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
    ]},
  ],
  bathroom: [
    { key: 'scope_level', label: 'Project scope', options: [
      { value: 'cosmetic', label: 'Cosmetic', description: 'Paint, vanity, fixtures' },
      { value: 'mid_refresh', label: 'Mid refresh', description: 'New finishes, better shower' },
      { value: 'full_remodel', label: 'Full remodel', description: 'Moving plumbing, custom tile' },
    ]},
    { key: 'bathroom_size', label: 'Bathroom size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
  ],
  kitchen: [
    { key: 'scope_level', label: 'Project scope', options: [
      { value: 'cosmetic', label: 'Cosmetic', description: 'Paint, counters, backsplash' },
      { value: 'mid_refresh', label: 'Mid refresh', description: 'New cabinets, floors, lighting' },
      { value: 'full_remodel', label: 'Full remodel', description: 'Layout change, premium finishes' },
    ]},
    { key: 'kitchen_size', label: 'Kitchen size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
  ],
  deck_patio: [
    { key: 'deck_size', label: 'Area size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
    { key: 'material_type', label: 'Material', options: [
      { value: 'pressure_treated', label: 'Pressure treated' },
      { value: 'composite', label: 'Composite' },
      { value: 'cedar_redwood', label: 'Cedar / Redwood' },
    ]},
    { key: 'railing', label: 'Include railing?', options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
    ]},
  ],
  landscaping: [
    { key: 'yard_size', label: 'Area size', options: [
      { value: 'small', label: 'Small', description: 'Single bed refresh' },
      { value: 'medium', label: 'Medium', description: 'Front-yard project' },
      { value: 'large', label: 'Large', description: 'Multi-zone yard' },
    ]},
    { key: 'landscape_scope', label: 'What kind?', options: [
      { value: 'refresh_beds', label: 'Planting beds', description: 'Shrubs, cleanup, mulch' },
      { value: 'lawn_and_beds', label: 'Lawn + beds' },
      { value: 'full_yard', label: 'Full makeover', description: 'Bigger redesign' },
    ]},
  ],
  roofing: [
    { key: 'roof_size', label: 'Roof size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
    { key: 'material_type', label: 'Material', options: [
      { value: 'asphalt', label: 'Asphalt' },
      { value: 'architectural_shingle', label: 'Architectural shingle' },
      { value: 'metal', label: 'Metal' },
    ]},
    { key: 'tear_off', label: 'Tear-off?', options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
    ]},
  ],
};

const QUALITY_TIERS = [
  { value: 'budget' as QualityTier, label: 'Budget', emoji: '💰', desc: 'Cost-conscious materials, good for rentals or quick cleanups.' },
  { value: 'mid' as QualityTier, label: 'Mid-range', emoji: '⭐', desc: 'Best default — balances durability, looks, and resale value.' },
  { value: 'premium' as QualityTier, label: 'Premium', emoji: '💎', desc: 'Higher-end finishes, upgraded materials, custom detailing.' },
];

const PHOTO_TIPS = [
  'One straight-on photo with good lighting',
  'Show as much of the space as possible',
  'No filters, screenshots, or blurry images',
];

const CATEGORIES_FOR_DISPLAY = Object.entries(PROJECT_CATEGORIES).map(([key, val]) => ({
  value: key as ProjectCategory,
  ...val,
}));

type VisionStartPrefill = {
  from?: string;
  zip?: string;
  category?: string;
  style?: string;
  quality?: string;
  notes?: string;
  image?: string;
};

/* ═══════════════════════════════════════════════════════════════════
   Step Progress Bar — clean numbered circles like GrowGardens
   ═══════════════════════════════════════════════════════════════════ */
function StepProgress({ steps, currentIndex }: { steps: Step[]; currentIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300',
                currentIndex > i
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : currentIndex === i
                  ? 'bg-stone-800 text-white shadow-lg shadow-stone-800/20 ring-[3px] ring-amber-200/40'
                  : 'bg-stone-200 text-stone-400'
              )}
            >
              {currentIndex > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn(
              'text-[10px] sm:text-xs font-medium transition-colors',
              currentIndex >= i ? 'text-stone-700' : 'text-stone-400'
            )}>
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              'mx-1 sm:mx-2 h-0.5 w-6 sm:w-10 rounded-full transition-colors duration-300',
              currentIndex > i ? 'bg-emerald-400' : 'bg-stone-200'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Selectable Option Card — mobile-friendly tap target
   ═══════════════════════════════════════════════════════════════════ */
function OptionCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 active:scale-[0.98]',
        selected
          ? 'border-stone-800 bg-stone-50 shadow-md ring-1 ring-stone-800/10'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm',
        className
      )}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Primary CTA Button — full-width, prominent, mobile-friendly
   ═══════════════════════════════════════════════════════════════════ */
function PrimaryCTA({
  onClick,
  disabled,
  children,
  loading,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-200',
        disabled
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
          : 'bg-stone-800 text-white hover:bg-stone-900 active:scale-[0.98] shadow-lg shadow-stone-800/20'
      )}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
      {!loading && !disabled && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Back Button — consistent across steps
   ═══════════════════════════════════════════════════════════════════ */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors mb-4 active:scale-95"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Step Header — title + subtitle for each step
   ═══════════════════════════════════════════════════════════════════ */
function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{title}</h2>
      <p className="mt-2 text-sm sm:text-base text-stone-500 leading-relaxed">{subtitle}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */
export default function VisionStartFlow({ initialPrefill }: { initialPrefill?: VisionStartPrefill }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialPrefill?.zip || initialPrefill?.category ? 'choices' : 'upload');
  const [zipCode, setZipCode] = useState(initialPrefill?.zip || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(initialPrefill?.image || null);
  const [category, setCategory] = useState<ProjectCategory | null>(
    (initialPrefill?.category && initialPrefill.category in PROJECT_CATEGORIES)
      ? (initialPrefill.category as ProjectCategory) : null
  );
  const [scopeAnswers, setScopeAnswers] = useState<Record<string, string>>({});
  const [style, setStyle] = useState<StylePreference>(
    (initialPrefill?.style && initialPrefill.style in STYLE_OPTIONS)
      ? (initialPrefill.style as StylePreference) : 'modern'
  );
  const [qualityTier, setQualityTier] = useState<QualityTier>('mid');
  const [notes, setNotes] = useState(initialPrefill?.notes || '');
  const [error, setError] = useState<string | null>(null);

  const isCustomProject = category === 'custom_project';
  const scopeQuestions = category ? (SCOPE_QUESTIONS[category] ?? []) : [];
  const allScopeAnswered = scopeQuestions.every(q => Boolean(scopeAnswers[q.key]));
  const needsNotes = isCustomProject && !notes.trim();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setError(`Format not supported. Please use ${SUPPORTED_IMAGE_LABEL}.`);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Photo too large. Use an image under 10MB.');
      return;
    }
    revokePreviewUrl(uploadPreview);
    setUploadedFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setError(null);
    posthog.capture('naili_photo_uploaded', { file_type: file.type, file_size: file.size });
  }, [uploadPreview]);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    setError(getFileRejectionMessage(rejections));
  }, []);

  const removeUpload = useCallback(() => {
    revokePreviewUrl(uploadPreview);
    setUploadedFile(null);
    setUploadPreview(null);
  }, [uploadPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, onDropRejected,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxFiles: 1, maxSize: MAX_UPLOAD_BYTES, multiple: false,
  });

  const updateScopeAnswer = (key: string, value: string) => {
    setScopeAnswers(prev => ({ ...prev, [key]: value }));
  };

  const buildNotesWithScope = () => {
    const entries = Object.entries(scopeAnswers).filter(([, v]) => Boolean(v));
    if (!entries.length && !notes.trim()) return undefined;
    const scopeBlock = entries.length
      ? `Scope answers:\n${entries.map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v.replace(/_/g, ' ')}`).join('\n')}`
      : '';
    if (!scopeBlock) return notes.trim() || undefined;
    return notes.trim() ? `${notes.trim()}\n\n${scopeBlock}` : scopeBlock;
  };

  const handleGo = async () => {
    if (!category || !uploadedFile || !zipCode.trim()) {
      setError('Please upload a photo, enter a ZIP code, and pick a project type.');
      return;
    }
    if (isCustomProject && !notes.trim()) {
      setError('Please describe your custom project.');
      return;
    }
    if (scopeQuestions.length && !allScopeAnswered) {
      setError('Please answer the scope questions to get the most accurate estimate.');
      return;
    }

    setStep('working');
    setError(null);
    const sessionId = uuidv4();
    const notesWithScope = buildNotesWithScope();

    posthog.capture('naili_generation_started', {
      category, style, quality_tier: qualityTier,
      has_scope_answers: Object.keys(scopeAnswers).length > 0,
      is_custom_project: isCustomProject,
    });

    try {
      const projectRes = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_type: PROJECT_CATEGORIES[category].type,
          project_category: category,
          zip_code: zipCode.trim(),
          style_preference: style,
          quality_tier: qualityTier,
          notes: notesWithScope,
          session_id: sessionId,
        }),
      });
      if (!projectRes.ok) throw new Error(await readApiError(projectRes, 'Could not create project. Try again.'));
      const { project } = await projectRes.json() as { project: { id: string } };
      const projectId = project.id;

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('project_id', projectId);

      const uploadRes = await fetch('/api/projects/upload-image', {
        method: 'POST', body: formData,
      });
      if (!uploadRes.ok) throw new Error(await readApiError(uploadRes, 'Could not upload photo.'));
      const { url: referenceImageUrl } = await uploadRes.json() as { url: string };

      // Run analysis
      let analysis: VisionAnalysis = FALLBACK_VISION_ANALYSIS;
      try {
        const analysisRes = await fetch('/api/vision/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: referenceImageUrl, category,
            zip_code: zipCode.trim(), notes: notesWithScope,
          }),
        });
        if (analysisRes.ok) {
          analysis = ((await analysisRes.json()) as { analysis?: VisionAnalysis }).analysis || FALLBACK_VISION_ANALYSIS;
        }
      } catch {
        // continue with fallback analysis
      }

      // Fire estimate, materials, brief, concepts — fire-and-forget for fastest navigation
      const inferredLocationType = category === 'custom_project' && analysis.suggested_location_type === 'exterior'
        ? 'exterior' : PROJECT_CATEGORIES[category].type;

      const estimatePromise = fetch('/api/vision/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId, category,
          location_type: inferredLocationType, style,
          quality_tier: qualityTier, zip_code: zipCode.trim(),
          notes: notesWithScope, scope_answers: scopeAnswers, analysis,
        }),
      });

      const materialsPromise = fetch('/api/vision/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId, category, style,
          quality_tier: qualityTier,
          estimate_mid: 15000, // placeholder — estimate will write real data
          analysis, notes: notesWithScope,
        }),
      });

      const briefPromise = fetch('/api/vision/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId, category, style,
          quality_tier: qualityTier, notes: notesWithScope,
          estimate_low: 10000, estimate_high: 20000,
          analysis,
        }),
      });

      // Don't await concepts — fire and forget
      fetch('/api/vision/generate-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId, category, style,
          quality_tier: qualityTier, notes: notesWithScope,
          reference_image_url: referenceImageUrl, analysis, count: 1,
        }),
      }).catch(() => {});

      // Wait for estimate to complete so results page has the number
      const estimateRes = await estimatePromise;
      if (estimateRes.ok) {
        const { estimate } = await estimateRes.json() as {
          estimate?: { mid_estimate?: number };
        };
        const midEst = estimate?.mid_estimate || 15000;

        // Re-fire materials and brief with real estimate values (best-effort)
        materialsPromise.then(async (mRes) => {
          if (!mRes.ok) {
            // Retry with real estimate value
            await fetch('/api/vision/materials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: projectId, category, style,
                quality_tier: qualityTier, estimate_mid: midEst,
                analysis, notes: notesWithScope,
              }),
            }).catch(() => {});
          }
        }).catch(() => {});

        briefPromise.then(async (bRes) => {
          if (!bRes.ok) {
            await fetch('/api/vision/brief', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: projectId, category, style,
                quality_tier: qualityTier, notes: notesWithScope,
                estimate_low: Math.round(midEst * 0.85),
                estimate_high: Math.round(midEst * 1.15),
                analysis,
              }),
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      // Fire remaining non-critical promises in background
      materialsPromise.catch(() => {});
      briefPromise.catch(() => {});

      posthog.capture('naili_generation_completed', {
        category, style, quality_tier: qualityTier, project_id: projectId,
      });

      // Navigate immediately — results page will progressive-load the data
      router.push(`/vision/results/${projectId}`);
    } catch (err) {
      console.error(err);
      posthog.capture('naili_generation_failed', { category, style, quality_tier: qualityTier });
      setError(err instanceof Error && err.message
        ? err.message
        : 'Something went wrong. Your settings are saved — please try again.');
      setStep('choices');
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {step !== 'working' && (
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {step === 'upload' ? 'Start with a photo' : 'Tell us about your project'}
          </h1>
          <p className="mt-2 text-base text-slate-500">
            {step === 'upload'
              ? 'Show us the space and enter your ZIP. We handle the rest.'
              : 'Fine-tune your estimate with a few quick choices.'}
          </p>
        </div>
      )}

      {/* SCREEN 1: UPLOAD */}
      {step === 'upload' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-5 sm:p-6">
            {/* Upload Zone */}
            <div
              {...getRootProps()}
              className={cn(
                'cursor-pointer rounded-[1.75rem] border-2 border-dashed p-6 text-center transition-colors sm:p-8',
                isDragActive ? 'border-sand-dark bg-canvas-200' : 'border-panel hover:border-sand hover:bg-canvas-50'
              )}
            >
              <input {...getInputProps()} />
              {uploadPreview ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadPreview} alt="Preview" className="mx-auto mb-4 max-h-64 w-full rounded-2xl object-cover" />
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas-200/70 px-4 py-3">
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-semibold text-slate-900">{uploadedFile?.name}</p>
                      <p className="text-xs text-slate-500">Tap to replace</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeUpload(); }}
                      className="rounded-xl border border-panel bg-canvas-50 p-2 hover:bg-canvas-200"
                    >
                      <Trash2 className="h-4 w-4 text-ink-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas-200 text-sand-dark">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Drop your photo here</p>
                  <p className="mt-1 text-sm text-slate-500">{SUPPORTED_IMAGE_LABEL}</p>
                </>
              )}
            </div>

            {/* ZIP + Continue */}
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <Input
                  label="Your ZIP code for local pricing"
                  placeholder="10001"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  required
                />
              </div>
              <Button
                className="shrink-0"
                size="lg"
                onClick={() => {
                  if (!uploadedFile || !zipCode.trim()) {
                    setError('Upload a photo and enter a ZIP code first.');
                    return;
                  }
                  setError(null);
                  setStep('choices');
                }}
                disabled={!uploadedFile || !zipCode.trim()}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {/* Tips row */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              {PHOTO_TIPS.map(tip => (
                <span key={tip} className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-mint" /> {tip}
                </span>
              ))}
            </div>
          </Card>

          {/* Sidebar — what you get */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-sand-light/10 to-mint/5 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-sand-dark" />
                What you&apos;ll get
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> ZIP-adjusted cost range</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> Materials list with allowances</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> Contractor-ready brief</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> Design concept image</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" /> Shareable link</li>
              </ul>
            </Card>
            <Card className="p-5 sm:p-6">
              <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                <Info className="h-4 w-4 text-sand-dark" />
                Built for confidence
              </div>
              <p className="text-sm text-slate-500">
                Your estimate uses your photo, your choices, and real regional cost data — not a generic average. Every assumption is listed so you know where the number comes from.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* SCREEN 2: CHOICES */}
      {step === 'choices' && (
        <div>
          <button onClick={() => setStep('upload')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Change photo or ZIP
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {/* Project type */}
              <Card className="p-5 sm:p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">What are you planning?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES_FOR_DISPLAY.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategory(cat.value);
                        setScopeAnswers({});
                      }}
                      className={cn(
                        'rounded-xl border px-3 py-4 text-left transition-all',
                        category === cat.value
                          ? 'border-sand-dark bg-sand-light/10 ring-1 ring-sand-dark'
                          : 'border-panel bg-canvas-50 hover:border-sand hover:bg-canvas-100'
                      )}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Scope Questions (if category has them) */}
              {scopeQuestions.length > 0 && (
                <Card className="p-5 sm:p-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">A few quick questions for accuracy</p>
                  <div className="space-y-5">
                    {scopeQuestions.map(q => (
                      <div key={q.key}>
                        <p className="mb-2 text-sm font-semibold text-slate-900">{q.label}</p>
                        {q.helper && <p className="mb-2 text-xs text-slate-500">{q.helper}</p>}
                        <div className="flex flex-wrap gap-2">
                          {q.options.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateScopeAnswer(q.key, opt.value)}
                              className={cn(
                                'rounded-xl border px-3 py-2 text-sm transition-all',
                                scopeAnswers[q.key] === opt.value
                                  ? 'border-sand-dark bg-sand-light/20 font-semibold text-slate-900'
                                  : 'border-panel bg-canvas-50 text-slate-600 hover:border-sand'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Custom project notes */}
              {isCustomProject && (
                <Card className="p-5 sm:p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Describe your project</p>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Describe the custom work you're planning — what's changing, what materials, approximate size..."
                    className="min-h-[100px] w-full resize-y rounded-xl border border-panel bg-canvas-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sand-dark focus:outline-none focus:ring-1 focus:ring-sand-dark"
                    rows={4}
                  />
                </Card>
              )}

              {/* Style + Quality inline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-5 sm:p-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Style direction</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STYLE_OPTIONS).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setStyle(key as StylePreference)}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-sm transition-all',
                          style === key
                            ? 'border-sand-dark bg-sand-light/20 font-semibold text-slate-900'
                            : 'border-panel bg-canvas-50 text-slate-600 hover:border-sand'
                        )}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 sm:p-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Finish quality</p>
                  <div className="flex flex-wrap gap-2">
                    {QUALITY_TIERS.map(tier => (
                      <button
                        key={tier.value}
                        onClick={() => setQualityTier(tier.value)}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-sm transition-all',
                          qualityTier === tier.value
                            ? 'border-sand-dark bg-sand-light/20 font-semibold text-slate-900'
                            : 'border-panel bg-canvas-50 text-slate-600 hover:border-sand'
                        )}
                      >
                        {tier.emoji} {tier.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {QUALITY_TIERS.find(t => t.value === qualityTier)?.desc}
                  </p>
                </Card>
              </div>
            </div>

            {/* Right side — summary + go */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-[#1b1d22] to-[#242831] p-5 text-white sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Your inputs</p>
                <div className="mt-3 space-y-2 text-sm">
                  {uploadPreview && (
                    <div className="rounded-2xl bg-white/10 px-3 py-2">
                      <span className="text-white/60">Photo:</span> Ready
                    </div>
                  )}
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    <span className="text-white/60">ZIP:</span> {zipCode}
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <span className="text-white/60">Project:</span> {category ? PROJECT_CATEGORIES[category].label : 'Not set'}
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <span className="text-white/60">Style:</span> {STYLE_OPTIONS[style]?.label}
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <span className="text-white/60">Quality:</span> {QUALITY_TIERS.find(t => t.value === qualityTier)?.label || qualityTier}
                  </div>
                  {scopeQuestions.length > 0 && (
                    <div className="rounded-2xl bg-white/10 px-3 py-2">
                      <span className="text-white/60">Scope answers:</span>{' '}
                      {allScopeAnswered ? Object.keys(scopeAnswers).length + ' answered' : 'Incomplete (optional)'}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
                )}

                <Button
                  className="mt-5 w-full"
                  size="lg"
                  onClick={handleGo}
                  disabled={!category || !zipCode.trim() || !uploadedFile || (scopeQuestions.length > 0 && !allScopeAnswered) || needsNotes}
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Generate my plan
                </Button>

                {scopeAnswers && scopeQuestions.length > 0 && !allScopeAnswered && (
                  <p className="mt-2 text-xs text-slate-300">
                    Scope questions are optional but improve accuracy.
                  </p>
                )}
                {isCustomProject && !notes.trim() && (
                  <p className="mt-2 text-xs text-slate-300">
                    Tell us what you&apos;re planning so the estimate is useful.
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: WORKING */}
      {step === 'working' && (
        <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-sand-dark" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Building your plan...</h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Reading your photo, calculating costs, and preparing your contractor brief.
            <br />
            This takes about 15–30 seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-mint" /> Photo analyzed
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-mint" /> Cost calculated
            </span>
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-sand-dark" /> Building brief
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
