'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  ChevronRight,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { PROJECT_CATEGORIES, STYLE_OPTIONS, type ProjectCategory, type StylePreference, type QualityTier } from '@/types';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { buildLoadingObservations, FALLBACK_VISION_ANALYSIS, type VisionAnalysis } from '@/lib/visionAnalysis';
import posthog from 'posthog-js';

type Step = 'entry' | 'category' | 'scope' | 'style' | 'quality' | 'loading';

type ScopeQuestion = {
  key: string;
  label: string;
  helper?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const SUPPORTED_IMAGE_LABEL = 'JPG, PNG, or WEBP up to 10MB';

function revokePreviewUrl(url: string | null) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

async function readApiError(response: Response, fallback: string) {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json() as { error?: string; message?: string };
      const message = data.error || data.message;
      if (message?.trim()) return message.trim();
      return fallback;
    }
    const text = (await response.text()).trim();
    return text.length > 0 ? text : fallback;
  } catch {
    return fallback;
  }
}

function getFileRejectionMessage(rejections: FileRejection[]) {
  const firstError = rejections[0]?.errors[0];
  if (!firstError) return `Please upload a supported image, ${SUPPORTED_IMAGE_LABEL}.`;
  if (firstError.code === 'file-too-large') return 'That photo is too large. Please use an image under 10MB.';
  if (firstError.code === 'file-invalid-type') return `That photo format is not supported yet. Please use ${SUPPORTED_IMAGE_LABEL}.`;
  if (firstError.code === 'too-many-files') return 'Please upload just one photo.';
  return firstError.message || `Please upload a supported image, ${SUPPORTED_IMAGE_LABEL}.`;
}

/* ── Scope questions per category ── */
const SCOPE_QUESTIONS: Partial<Record<ProjectCategory, ScopeQuestion[]>> = {
  interior_paint: [
    { key: 'room_size', label: 'Room size', options: [
      { value: 'small', label: 'Small', description: 'Bedroom or office' },
      { value: 'medium', label: 'Medium', description: 'Standard room' },
      { value: 'large', label: 'Large', description: 'Living room or open plan' },
    ]},
    { key: 'paint_scope', label: 'What are you painting?', options: [
      { value: 'walls_only', label: 'Walls only' },
      { value: 'walls_and_ceiling', label: 'Walls + ceiling' },
      { value: 'walls_ceiling_trim', label: 'Walls + ceiling + trim' },
    ]},
    { key: 'prep_level', label: 'Prep needed', options: [
      { value: 'light', label: 'Light', description: 'Minor patching' },
      { value: 'medium', label: 'Medium', description: 'Some repairs' },
      { value: 'heavy', label: 'Heavy', description: 'Significant repair' },
    ]},
    { key: 'window_coverage', label: 'Window coverage', options: [
      { value: 'normal_windows', label: 'Normal windows' },
      { value: 'many_windows', label: 'Many windows' },
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
    { key: 'demo_required', label: 'Remove existing flooring?', options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
    ]},
  ],
  bathroom: [
    { key: 'scope_level', label: 'Project scope', options: [
      { value: 'cosmetic', label: 'Cosmetic' }, { value: 'mid_refresh', label: 'Mid refresh' }, { value: 'full_remodel', label: 'Full remodel' },
    ]},
    { key: 'bathroom_size', label: 'Bathroom size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
  ],
  kitchen: [
    { key: 'scope_level', label: 'Project scope', options: [
      { value: 'cosmetic', label: 'Cosmetic' }, { value: 'mid_refresh', label: 'Mid refresh' }, { value: 'full_remodel', label: 'Full remodel' },
    ]},
    { key: 'kitchen_size', label: 'Kitchen size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
  ],
  deck_patio: [
    { key: 'deck_size', label: 'Deck or patio size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
    { key: 'material_type', label: 'Material', options: [
      { value: 'pressure_treated', label: 'Pressure treated' }, { value: 'composite', label: 'Composite' }, { value: 'cedar_redwood', label: 'Cedar / Redwood' },
    ]},
    { key: 'railing', label: 'Include railing?', options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
    ]},
  ],
  landscaping: [
    { key: 'yard_size', label: 'Area size', helper: 'Choose the part of the yard you want priced.', options: [
      { value: 'small', label: 'Small', description: 'Single bed or compact area' },
      { value: 'medium', label: 'Medium', description: 'Most front-yard projects' },
      { value: 'large', label: 'Large', description: 'Large frontage or multi-zone' },
    ]},
    { key: 'landscape_scope', label: 'What kind of landscape work?', options: [
      { value: 'refresh_beds', label: 'Planting bed refresh', description: 'Beds, shrubs, mulch, edging' },
      { value: 'lawn_and_beds', label: 'Lawn + beds', description: 'Grass plus beds and curb appeal' },
      { value: 'full_yard', label: 'Full landscape makeover', description: 'Bigger redesign across yard' },
    ]},
    { key: 'hardscape_scope', label: 'What about hardscape?', options: [
      { value: 'preserve_existing', label: 'Preserve existing', description: 'Keep current hardscape as-is' },
      { value: 'light_updates', label: 'Light updates', description: 'Minor edging or borders' },
      { value: 'new_hardscape', label: 'New hardscape', description: 'Adding paths, patio, or pavers' },
    ]},
    { key: 'irrigation_lighting', label: 'Include irrigation or lighting?', options: [
      { value: 'none', label: 'No, plants only' },
      { value: 'irrigation', label: 'Irrigation only' },
      { value: 'irrigation_and_lighting', label: 'Irrigation + lighting' },
    ]},
  ],
  roofing: [
    { key: 'roof_size', label: 'Roof size', options: [
      { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
    ]},
    { key: 'material_type', label: 'Material', options: [
      { value: 'asphalt', label: 'Asphalt' }, { value: 'architectural_shingle', label: 'Architectural shingle' }, { value: 'metal', label: 'Metal' },
    ]},
    { key: 'tear_off', label: 'Tear-off required?', options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
    ]},
  ],
};

const QUALITY_TIERS = [
  { value: 'budget' as QualityTier, label: 'Budget', emoji: '💰', desc: 'Cost-conscious materials and simpler finishes.', modifier: '0.6–0.8x average' },
  { value: 'mid' as QualityTier, label: 'Mid-range', emoji: '⭐', desc: 'Balanced durability, looks, and resale value.', modifier: 'Around average' },
  { value: 'premium' as QualityTier, label: 'Premium', emoji: '💎', desc: 'Higher-end finishes and upgraded materials.', modifier: '1.4–1.8x average' },
];

const PROGRESS_STEPS = [
  'Reading your photo and request...',
  'Building your local cost range...',
  'Drafting your materials plan...',
  'Writing your contractor brief...',
  'Finalizing your plan...',
];

const STEP_LABELS: Record<Step, string> = {
  entry: 'Photo',
  category: 'Project',
  scope: 'Scope',
  style: 'Style',
  quality: 'Finish',
  loading: 'Analyze',
};

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
              {currentIndex > i ? <CheckCircle className="h-4 w-4" /> : i + 1}
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
  const [step, setStep] = useState<Step>('entry');
  const [zipCode, setZipCode] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [scopeAnswers, setScopeAnswers] = useState<Record<string, string>>({});
  const [style, setStyle] = useState<StylePreference>('modern');
  const [qualityTier, setQualityTier] = useState<QualityTier>('mid');
  const [notes, setNotes] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [analysisHighlights, setAnalysisHighlights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [prefillStatus, setPrefillStatus] = useState<'idle' | 'loading' | 'loaded' | 'error' | 'dismissed'>('idle');
  const prefillProjectId = initialPrefill?.from?.trim() || '';
  const prefillStartedRef = useRef(false);

  // Effect 1: Apply simple prefill values — runs once
  useEffect(() => {
    const nextZip = initialPrefill?.zip?.trim();
    const nextCategory = initialPrefill?.category?.trim();
    const nextStyle = initialPrefill?.style?.trim();
    const nextQuality = initialPrefill?.quality?.trim();
    const nextNotes = initialPrefill?.notes?.trim();
    if (nextZip) setZipCode(nextZip);
    if (nextCategory && nextCategory in PROJECT_CATEGORIES) setCategory(nextCategory as ProjectCategory);
    if (nextStyle && nextStyle in STYLE_OPTIONS) setStyle(nextStyle as StylePreference);
    if (nextQuality && QUALITY_TIERS.some((tier) => tier.value === nextQuality)) setQualityTier(nextQuality as QualityTier);
    if (nextNotes) setNotes(nextNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: Fetch image from project ID — isolated to prevent race condition
  useEffect(() => {
    if (!prefillProjectId || prefillStartedRef.current) return;
    const directImage = initialPrefill?.image?.trim();
    if (directImage) return;
    prefillStartedRef.current = true;
    let cancelled = false;
    setPrefillStatus('loading');
    void fetch(`/api/projects/get?id=${encodeURIComponent(prefillProjectId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();
        const imageUrl = data.project?.image_url;
        if (!imageUrl) throw new Error('No image URL in project');
        if (cancelled) return;
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Image fetch failed with ${imgRes.status}`);
        const blob = await imgRes.blob();
        const fileType = SUPPORTED_IMAGE_TYPES.includes(blob.type) ? blob.type : 'image/jpeg';
        const extension = fileType === 'image/jpeg' ? 'jpg' : fileType.split('/')[1] || 'jpg';
        const file = new File([blob], `naili-source.${extension}`, { type: fileType });
        if (cancelled) return;
        setUploadedFile(file);
        setUploadPreview(imageUrl);
        setPrefillStatus('loaded');
        setStep('category');
      })
      .catch((err) => {
        console.error('failed to prefill from project', err);
        if (cancelled) return;
        setPrefillStatus('error');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillProjectId]);

  // Effect 3: Fetch direct image URL
  useEffect(() => {
    const nextImage = initialPrefill?.image?.trim();
    if (!nextImage || prefillStartedRef.current) return;
    prefillStartedRef.current = true;
    let cancelled = false;
    setPrefillStatus('loading');
    void fetch(nextImage)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Image fetch failed with ${response.status}`);
        const blob = await response.blob();
        const fileType = SUPPORTED_IMAGE_TYPES.includes(blob.type) ? blob.type : 'image/jpeg';
        const extension = fileType === 'image/jpeg' ? 'jpg' : fileType.split('/')[1] || 'jpg';
        const file = new File([blob], `naili-source.${extension}`, { type: fileType });
        if (cancelled) return;
        setUploadedFile(file);
        setUploadPreview(nextImage);
        setPrefillStatus('loaded');
      })
      .catch((prefillError) => {
        console.error('failed to prefill uploaded image', prefillError);
        if (cancelled) return;
        setPrefillStatus('error');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        setError(`That photo format is not supported yet. Please use ${SUPPORTED_IMAGE_LABEL}.`);
        return;
      }
      setError(null);
      revokePreviewUrl(uploadPreview);
      setUploadedFile(file);
      setUploadPreview(URL.createObjectURL(file));
      if (prefillStatus === 'error') setPrefillStatus('dismissed');
    }
  }, [uploadPreview, prefillStatus]);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    setError(getFileRejectionMessage(rejections));
  }, []);

  const removeUpload = useCallback(() => {
    revokePreviewUrl(uploadPreview);
    setUploadedFile(null);
    setUploadPreview(null);
    setError(null);
  }, [uploadPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxFiles: 1,
    maxSize: MAX_UPLOAD_BYTES,
    multiple: false,
  });

  const scopeQuestions = category ? SCOPE_QUESTIONS[category] ?? [] : [];
  const hasScopeStep = scopeQuestions.length > 0;
  const visibleSteps = ['entry', 'category', ...(hasScopeStep ? ['scope'] : []), 'style', 'quality'] as Step[];
  const currentVisibleStepIndex = visibleSteps.indexOf(step);
  const allScopeAnswered = scopeQuestions.every(question => Boolean(scopeAnswers[question.key]));

  const handleEntryNext = () => { if (!uploadedFile || !zipCode.trim()) return; setError(null); setStep('category'); };
  const handleCategoryNext = () => { if (!category) return; setError(null); setStep(hasScopeStep ? 'scope' : 'style'); };
  const handleScopeNext = () => { if (!allScopeAnswered) return; setError(null); setStep('style'); };
  const handleStyleNext = () => { if (!style) return; setError(null); setStep('quality'); };
  const handleScopeSkip = () => { setError(null); setStep('style'); };
  const updateScopeAnswer = (key: string, value: string) => { setScopeAnswers(prev => ({ ...prev, [key]: value })); };
  const isCustomProject = category === 'custom_project';

  const buildNotesWithScope = (rawNotes: string, answers: Record<string, string>) => {
    const entries = Object.entries(answers).filter(([, value]) => Boolean(value));
    if (entries.length === 0) return rawNotes.length > 0 ? rawNotes : undefined;
    const scopeLines = entries.map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${value.replace(/_/g, ' ')}`);
    const scopeBlock = `Scope answers:\n${scopeLines.join('\n')}`;
    return rawNotes.length > 0 ? `${rawNotes}\n\n${scopeBlock}` : scopeBlock;
  };

  const handleStart = async () => {
    if (!category || !style || !zipCode.trim() || !uploadedFile) {
      setError('Please upload a photo and complete the required steps.');
      return;
    }
    if (isCustomProject && !notes.trim()) {
      setError('Please describe the custom project before continuing.');
      return;
    }
    setStep('loading');
    setError(null);
    setAnalysisHighlights([]);
    const sessionId = uuidv4();
    const notesWithScope = buildNotesWithScope(notes, scopeAnswers);
    let recoveryStep: Step = 'quality';

    try {
      if (notesWithScope) {
        posthog.capture('naili_prompt_entered', { category, has_scope_answers: Object.keys(scopeAnswers).length > 0, is_custom_project: isCustomProject });
      }
      posthog.capture('naili_generation_started', { category, style, quality_tier: qualityTier, has_scope_questions: hasScopeStep, has_scope_answers: Object.keys(scopeAnswers).length > 0, is_custom_project: isCustomProject });
      setProgressStep(0);

      let projectId: string;
      let referenceImageUrl: string;

      if (prefillProjectId && prefillStatus === 'loaded') {
        projectId = prefillProjectId;
        await fetch('/api/projects/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, project_category: category, style_preference: style, quality_tier: qualityTier, notes: notesWithScope }),
        });
        const projRes = await fetch(`/api/projects/get?id=${encodeURIComponent(projectId)}`);
        if (!projRes.ok) throw new Error('Could not load your project. Please try again.');
        const projData = await projRes.json();
        referenceImageUrl = projData.project?.image_url || '';
        if (!referenceImageUrl) {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('project_id', projectId);
          const uploadRes = await fetch('/api/projects/upload-image', { method: 'POST', body: formData });
          if (!uploadRes.ok) throw new Error(await readApiError(uploadRes, `We could not upload that photo. Please use ${SUPPORTED_IMAGE_LABEL}.`));
          const uploadData = await uploadRes.json() as { url: string };
          referenceImageUrl = uploadData.url;
        }
        recoveryStep = 'entry';
      } else {
        const projectRes = await fetch('/api/projects/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location_type: PROJECT_CATEGORIES[category].type, project_category: category, zip_code: zipCode.trim(), style_preference: style, quality_tier: qualityTier, notes: notesWithScope, session_id: sessionId }),
        });
        if (!projectRes.ok) throw new Error(await readApiError(projectRes, 'We could not set up your project. Please try again.'));
        recoveryStep = 'entry';
        const { project } = await projectRes.json() as { project: { id: string } };
        projectId = project.id;
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('project_id', projectId);
        const uploadRes = await fetch('/api/projects/upload-image', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error(await readApiError(uploadRes, `We could not upload that photo. Please use ${SUPPORTED_IMAGE_LABEL}.`));
        const uploadData = await uploadRes.json() as { url: string };
        referenceImageUrl = uploadData.url;
      }

      let analysis: VisionAnalysis = FALLBACK_VISION_ANALYSIS;
      try {
        const analysisRes = await fetch('/api/vision/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: referenceImageUrl, category, zip_code: zipCode.trim(), notes: notesWithScope }),
        });
        if (analysisRes.ok) {
          const data = await analysisRes.json() as { analysis?: VisionAnalysis };
          analysis = data.analysis || FALLBACK_VISION_ANALYSIS;
          setAnalysisHighlights(buildLoadingObservations(analysis));
        }
      } catch (analysisError) {
        console.error('photo analysis failed:', analysisError);
      }

      setProgressStep(1);
      const inferredLocationType = category === 'custom_project' && analysis.suggested_location_type === 'exterior' ? 'exterior' : PROJECT_CATEGORIES[category].type;
      const estimateRes = await fetch('/api/vision/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, category, location_type: inferredLocationType, style, quality_tier: qualityTier, zip_code: zipCode.trim(), notes: notesWithScope, scope_answers: scopeAnswers, analysis }),
      });
      if (!estimateRes.ok) throw new Error(await readApiError(estimateRes, 'We could not build your estimate yet. Please try again.'));
      const { estimate } = await estimateRes.json() as { estimate?: { low_estimate?: number; mid_estimate?: number; high_estimate?: number } };

      setProgressStep(2);
      const materialsPromise = fetch('/api/vision/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, estimate_mid: estimate?.mid_estimate || 15000, analysis, notes: notesWithScope }),
      });

      setProgressStep(3);
      const briefPromise = fetch('/api/vision/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, category, style, quality_tier: qualityTier, notes: notesWithScope, estimate_low: estimate?.low_estimate || 10000, estimate_high: estimate?.high_estimate || 20000, analysis }),
      });

      const conceptPromise = fetch('/api/vision/concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, reference_image_url: referenceImageUrl, category, style, quality_tier: qualityTier, notes: notesWithScope, analysis }),
      });

      await Promise.allSettled([materialsPromise, briefPromise, conceptPromise]);
      setProgressStep(4);

      posthog.capture('naili_generation_complete', { project_id: projectId, category, style, quality_tier: qualityTier });
      router.push(`/vision/results/${projectId}`);
    } catch (err) {
      console.error('Vision flow error:', err);
      posthog.capture('naili_generation_error', { error: err instanceof Error ? err.message : 'Unknown error', category, step: recoveryStep });
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStep(recoveryStep);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 pb-8">
      {/* Step progress bar — always visible except during loading */}
      {step !== 'loading' && (
        <StepProgress steps={visibleSteps} currentIndex={currentVisibleStepIndex} />
      )}

      {/* Error banner */}
      {error && step !== 'loading' && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── STEP 1: PHOTO UPLOAD ── */}
      {step === 'entry' && (
        <div className="space-y-5">
          <StepHeader
            title="Upload a photo of your space"
            subtitle="One photo is all it takes. We'll turn it into a complete renovation plan with costs and materials."
          />

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'relative overflow-hidden rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-200',
              isDragActive
                ? 'border-stone-400 bg-stone-100'
                : uploadPreview
                ? 'border-stone-300 bg-stone-50'
                : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50'
            )}
          >
            <input {...getInputProps()} />
            {uploadPreview ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadPreview}
                  alt="Upload preview"
                  className="mx-auto max-h-56 sm:max-h-72 w-full object-cover rounded-xl mb-4"
                />
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-95 transition-all"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeUpload(); }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-95 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ) : prefillStatus === 'loading' ? (
              <div className="py-8">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-stone-400 mb-3" />
                <p className="text-sm font-medium text-stone-500">Loading your photo...</p>
              </div>
            ) : (
              <div className="py-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
                  <Camera className="h-7 w-7 text-stone-400" />
                </div>
                <p className="text-base font-semibold text-stone-700">Tap to upload a photo</p>
                <p className="text-sm text-stone-400 mt-1">or drag and drop</p>
              </div>
            )}
          </div>

          {/* ZIP code */}
          <div>
            <label htmlFor="zip-input" className="block text-sm font-medium text-stone-700 mb-1.5">
              ZIP code <span className="text-stone-400">(for local pricing)</span>
            </label>
            <input
              id="zip-input"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 78701"
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition-all"
            />
          </div>

          {prefillStatus === 'error' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Could not load the saved photo. Please upload a new one.
            </div>
          )}

          <PrimaryCTA onClick={handleEntryNext} disabled={!uploadedFile || !zipCode.trim()}>
            Continue
          </PrimaryCTA>

          {/* Tips */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: '📱', label: 'Front-on shot', desc: 'Capture the full area' },
              { icon: '☀️', label: 'Good lighting', desc: 'Natural daylight is best' },
              { icon: '🎯', label: 'One area', desc: 'Focus on one section' },
            ].map((tip) => (
              <div key={tip.label} className="text-center">
                <div className="text-xl mb-1">{tip.icon}</div>
                <div className="text-xs font-semibold text-stone-600">{tip.label}</div>
                <div className="text-[10px] text-stone-400 mt-0.5">{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: CATEGORY ── */}
      {step === 'category' && (
        <div>
          <BackButton onClick={() => setStep('entry')} />
          <StepHeader
            title="What are you planning?"
            subtitle="Choose the closest project type. Custom works great for unusual projects."
          />

          <div className="grid grid-cols-2 gap-3 mb-6">
            {(Object.entries(PROJECT_CATEGORIES) as [ProjectCategory, typeof PROJECT_CATEGORIES[ProjectCategory]][]).map(([key, cat]) => (
              <OptionCard key={key} selected={category === key} onClick={() => { setCategory(key); setScopeAnswers({}); }}>
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <div className="font-semibold text-stone-800 text-sm">{cat.label}</div>
                <div className="text-xs text-stone-500 mt-0.5 leading-relaxed line-clamp-2">{cat.description}</div>
              </OptionCard>
            ))}
          </div>

          <PrimaryCTA onClick={handleCategoryNext} disabled={!category}>
            Continue
          </PrimaryCTA>
        </div>
      )}

      {/* ── STEP 3: SCOPE (optional) ── */}
      {step === 'scope' && category && (
        <div>
          <BackButton onClick={() => setStep('category')} />
          <StepHeader
            title="A few quick details"
            subtitle="These help tighten the estimate. You can skip if you prefer."
          />

          <div className="space-y-6 mb-6">
            {scopeQuestions.map((question) => (
              <div key={question.key}>
                <h3 className="text-base font-semibold text-stone-800 mb-1">{question.label}</h3>
                {question.helper && <p className="text-xs text-stone-500 mb-2">{question.helper}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((option) => (
                    <OptionCard
                      key={option.value}
                      selected={scopeAnswers[question.key] === option.value}
                      onClick={() => updateScopeAnswer(question.key, option.value)}
                      className="!p-3"
                    >
                      <div className="font-medium text-stone-700 text-sm">{option.label}</div>
                      {option.description && <div className="text-xs text-stone-400 mt-0.5">{option.description}</div>}
                    </OptionCard>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <PrimaryCTA onClick={handleScopeNext} disabled={!allScopeAnswered}>
              Continue
            </PrimaryCTA>
            <button
              type="button"
              onClick={handleScopeSkip}
              className="w-full rounded-2xl border border-stone-200 bg-white px-6 py-3.5 text-sm font-medium text-stone-500 hover:bg-stone-50 transition-all active:scale-[0.98]"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: STYLE ── */}
      {step === 'style' && (
        <div>
          <BackButton onClick={() => setStep(hasScopeStep ? 'scope' : 'category')} />
          <StepHeader
            title="Pick a style direction"
            subtitle="This shapes the concept and brief. You can evolve it later."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {(Object.entries(STYLE_OPTIONS) as [StylePreference, typeof STYLE_OPTIONS[StylePreference]][]).map(([key, opt]) => (
              <OptionCard key={key} selected={style === key} onClick={() => setStyle(key)}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full ring-2 ring-white shadow-sm flex-shrink-0" style={{ background: opt.color }} />
                  <div>
                    <div className="font-semibold text-stone-800 text-sm">{opt.label}</div>
                    <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{opt.description}</div>
                  </div>
                </div>
              </OptionCard>
            ))}
          </div>

          <PrimaryCTA onClick={handleStyleNext} disabled={!style}>
            Continue
          </PrimaryCTA>
        </div>
      )}

      {/* ── STEP 5: QUALITY / FINISH ── */}
      {step === 'quality' && (
        <div>
          <BackButton onClick={() => setStep('style')} />
          <StepHeader
            title="Set the finish level"
            subtitle="Choose what you'd actually buy, not the dream version (unless that's the plan)."
          />

          <div className="space-y-3 mb-6">
            {QUALITY_TIERS.map((tier) => (
              <OptionCard key={tier.value} selected={qualityTier === tier.value} onClick={() => setQualityTier(tier.value)}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{tier.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-stone-800">{tier.label}</div>
                      <div className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{tier.modifier}</div>
                    </div>
                    <div className="text-sm text-stone-500 mt-0.5">{tier.desc}</div>
                  </div>
                </div>
              </OptionCard>
            ))}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              {isCustomProject ? 'Describe what you want to change' : 'Anything specific?'}{' '}
              {!isCustomProject && <span className="text-stone-400">(optional)</span>}
            </label>
            <textarea
              className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition-all"
              rows={isCustomProject ? 4 : 3}
              placeholder={isCustomProject ? 'e.g. Replace the old pergola with a covered outdoor kitchen...' : 'e.g. Need durable flooring because of a dog, want warmer tones...'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <PrimaryCTA onClick={handleStart} disabled={isCustomProject && !notes.trim()}>
            Generate my plan
          </PrimaryCTA>
          <p className="text-xs text-stone-400 text-center mt-3">Results are ready in about 60 seconds.</p>
        </div>
      )}

      {/* ── LOADING ── */}
      {step === 'loading' && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-5 py-8 sm:px-8 sm:py-12 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,185,138,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(184,216,200,0.10),transparent_30%)]" />

          <div className="relative">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Building your plan</h2>
            <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">
              Reading your photo, building estimates, drafting materials and contractor brief.
            </p>

            <div className="space-y-2.5 text-left max-w-md mx-auto">
              {PROGRESS_STEPS.map((label, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300',
                    i < progressStep
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                      : i === progressStep
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'bg-white/5 text-white/40 border border-white/5'
                  )}
                >
                  {i < progressStep ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  ) : i === progressStep ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 flex-shrink-0 rounded-full border border-white/20" />
                  )}
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {analysisHighlights.length > 0 && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-left max-w-md mx-auto">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">What naili sees</p>
                <div className="space-y-2">
                  {analysisHighlights.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-white/70">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-300/70" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
