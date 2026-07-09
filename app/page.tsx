'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { CheckCircle2, Loader2, Sparkles, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remaining = MAX_FILES - files.length;
    const toAdd = acceptedFiles.slice(0, remaining);
    if (toAdd.length === 0) return;
    setFiles((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);
    setError(null);
    posthog.capture('naili_home_photos_dropped', { count: toAdd.length });
  }, [files.length]);

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

  const canSubmit = files.length > 0 && zipCode.trim().length === 5;

  const handleGo = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      // Convert files to data URLs and store in sessionStorage so vision/start can pick them up
      const fileDataUrls = await Promise.all(files.map(readFileAsDataURL));
      const fileNames = files.map(f => f.name);
      const fileTypes = files.map(f => f.type);
      sessionStorage.setItem('naili_photos_data', JSON.stringify(fileDataUrls));
      sessionStorage.setItem('naili_photos_names', JSON.stringify(fileNames));
      sessionStorage.setItem('naili_photos_types', JSON.stringify(fileTypes));
      posthog.capture('naili_home_submitted', { photo_count: files.length, zip: zipCode.trim() });
      router.push(`/vision/start?zip=${encodeURIComponent(zipCode.trim())}`);
    } catch {
      setError('Could not process photos. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,185,138,0.12),transparent_55%)]" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            naili
          </h1>
          <p className="mt-2 text-base text-ink-500">
            Upload photos of your space. Get a forensic estimate in seconds.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer rounded-[1.75rem] border-2 border-dashed p-8 text-center transition-colors',
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
                    Drop more photos or click to replace
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

          {/* ZIP + Go */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label="Your ZIP code for local pricing"
                placeholder="10001"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>
            <Button
              size="lg"
              onClick={handleGo}
              disabled={!canSubmit || loading}
              className="shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get my estimate
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Tips row */}
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

        {/* Trust line */}
        <p className="mt-6 text-center text-xs text-ink-400">
          Your photos are used only to generate your estimate and design concepts.
          <br />
          No generic averages. Every number comes from your photo + local market data.
        </p>
      </div>
    </main>
  );
}
