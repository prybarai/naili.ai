'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  MapPin,
  ArrowRight,
  Loader2,
  Camera,
  ImagePlus,
  RotateCcw,
  Sparkles,
  Shield,
} from 'lucide-react';

export default function BulletproofUploadFlow() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zipCode, setZipCode] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Creating your project...');

  useEffect(() => {
    return () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    };
  }, [uploadPreview]);

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Maximum size is 10MB.');
      return;
    }
    setError(null);
    setUploadedFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleClear = () => {
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadedFile(null);
    setUploadPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!zipCode.trim() || zipCode.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code.');
      return;
    }
    if (!uploadedFile) {
      setError('Please select a photo to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setLoadingMessage('Creating your project...');

    try {
      // Step 1: Create the project
      const projectResponse = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip_code: zipCode }),
      });

      if (!projectResponse.ok) {
        const errData = await projectResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Could not create your project. Please try again.');
      }

      const projectData = await projectResponse.json();
      const projectId = projectData.project?.id || projectData.id;

      if (!projectId) {
        throw new Error('Project was created but we could not get the project ID. Please try again.');
      }

      // Step 2: Upload the image
      setLoadingMessage('Uploading your photo...');
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('project_id', projectId);

      const uploadResponse = await fetch('/api/projects/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Photo upload failed. Please try again.');
      }

      const uploadData = await uploadResponse.json();

      // STEP 3: Redirect to vision start with ZIP prefilled
      // We keep the project in case user navigates back for their photo
      router.push(`/vision/start?zip=${encodeURIComponent(zipCode)}`);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsUploading(false);
    }
  };

  const isReady = zipCode.length === 5 && uploadedFile !== null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-[2rem] border border-hairline bg-white shadow-[0_8px_40px_rgba(23,24,28,0.08),0_1px_3px_rgba(23,24,28,0.04)]">
        {/* Gradient accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-sand via-mint to-sand-light" />
        
        <div className="p-6 sm:p-8">
          {/* Title */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sand/25 to-mint/15">
              <Sparkles className="h-5 w-5 text-sand-dark" />
            </div>
            <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
              Start your project
            </h2>
            <p className="mt-2 text-sm text-ink-500">Upload a photo and enter your ZIP for a personalized renovation plan.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); handleSubmit(); }}
                className="flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
              >
                <RotateCcw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}

          {isUploading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sand/20 via-canvas-50 to-mint/20 shadow-inner">
                <Loader2 className="h-8 w-8 animate-spin text-sand-dark" />
              </div>
              <h3 className="text-lg font-semibold text-ink">{loadingMessage}</h3>
              <p className="mt-1 text-sm text-ink-500">This will just take a moment</p>
              <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-canvas-200">
                <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-transparent via-sand/60 to-transparent bg-[length:200%_100%]" />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Photo upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !uploadPreview && fileInputRef.current?.click()}
                className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ${
                  uploadPreview
                    ? 'border-[#5BA88C]/50 bg-[#5BA88C]/5'
                    : isDragging
                    ? 'border-sand bg-sand/10'
                    : 'border-canvas-300 hover:border-sand/60 hover:bg-canvas-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleInputChange}
                  className="hidden"
                />

                {uploadPreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadPreview} alt="Preview" className="aspect-[16/10] w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-[#16A34A]" /> Photo ready
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClear(); }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm transition hover:bg-white"
                    >
                      <Camera className="h-3.5 w-3.5" /> Change
                    </button>
                  </div>
                ) : (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-canvas-200 to-canvas-300">
                      <ImagePlus className="h-7 w-7 text-sand-dark" />
                    </div>
                    <p className="font-semibold text-ink">Drop a photo here or click to browse</p>
                    <p className="mt-1.5 text-sm text-ink-500">JPG, PNG, or WEBP &middot; Max 10MB</p>
                  </div>
                )}
              </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setStep("zip")}
                variant="secondary"
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isReady}
                className="group w-full rounded-full bg-gradient-to-r from-ink to-graphite-600 py-4 text-base font-semibold text-canvas-50 shadow-[0_4px_16px_rgba(23,24,28,0.2),0_1px_3px_rgba(23,24,28,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(23,24,28,0.25)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isReady ? (
                  <span className="inline-flex items-center gap-2">
                    Start AI analysis
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                ) : !uploadedFile ? (
                  'Upload a photo to get started'
                ) : (
                  'Enter your ZIP code'
                )}
              </button>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-4 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Private &amp; secure
                </span>
                <span className="h-3 w-px bg-hairline" />
                <span>Free to use</span>
                <span className="h-3 w-px bg-hairline" />
                <span>Results in minutes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
