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
  Sparkles,
  Loader2,
  Camera,
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

    try {
      const projectResponse = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip_code: zipCode }),
      });
      if (!projectResponse.ok) throw new Error('Failed to create project');

      const projectData = await projectResponse.json();
      const projectId = projectData.id;

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('project_id', projectId);

      const uploadResponse = await fetch('/api/projects/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error('Upload failed');

      router.push(`/vision/start?from=${projectId}&zip=${encodeURIComponent(zipCode)}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsUploading(false);
    }
  };

  const isReady = zipCode.length === 5 && uploadedFile !== null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-[2rem] border border-hairline bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sand/10 to-mint/10 px-6 py-5 text-center sm:px-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink-600 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-sand-dark" /> Free AI analysis
          </div>
          <h2 className="font-display text-xl tracking-tight text-ink sm:text-2xl">
            Upload a photo of your space
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isUploading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand/15">
                <Loader2 className="h-7 w-7 animate-spin text-sand-dark" />
              </div>
              <h3 className="text-lg font-semibold text-ink">Creating your project...</h3>
              <p className="mt-1 text-sm text-ink-500">This will just take a moment</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Photo upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !uploadPreview && fileInputRef.current?.click()}
                className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                  uploadPreview
                    ? 'border-mint bg-mint/5'
                    : isDragging
                    ? 'border-sand bg-sand/10'
                    : 'border-canvas-300 hover:border-sand/40 hover:bg-sand/5'
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-mint" /> Photo ready
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClear(); }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur-sm transition hover:bg-white"
                    >
                      <Camera className="h-3.5 w-3.5" /> Change
                    </button>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-canvas-200">
                      <Upload className="h-6 w-6 text-ink-500" />
                    </div>
                    <p className="font-semibold text-ink">Drop a photo here or click to browse</p>
                    <p className="mt-1 text-sm text-ink-500">JPG, PNG, or WEBP &middot; Max 10MB</p>
                  </div>
                )}
              </div>

              {/* ZIP code */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-canvas-200">
                  <MapPin className="h-4 w-4 text-ink-500" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                    placeholder="Enter your ZIP code for local pricing"
                    className="w-full rounded-xl border border-hairline bg-canvas-50 px-4 py-3 text-ink placeholder:text-ink-400 outline-none transition focus:border-sand focus:ring-2 focus:ring-sand/20"
                    maxLength={5}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isReady}
                className="btn-primary w-full justify-center !py-4 text-base disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isReady ? (
                  <>
                    Start AI analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : !uploadedFile ? (
                  'Upload a photo to get started'
                ) : (
                  'Enter your ZIP code'
                )}
              </button>

              <p className="text-center text-[11px] text-ink-400">
                Free to use &middot; No account needed &middot; Your photo is used only for analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
