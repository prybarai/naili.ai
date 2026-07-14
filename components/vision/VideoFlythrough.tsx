'use client';

import { useRef, useState, useEffect } from 'react';
import { Film, Play } from 'lucide-react';

interface Props {
  videoUrl?: string;
  thumbnailUrl?: string;
  isGenerating?: boolean;
  /** Fallback image for CSS Ken Burns flythrough when no real video is available */
  conceptImageUrl?: string;
}

export default function VideoFlythrough({
  videoUrl,
  thumbnailUrl,
  isGenerating,
  conceptImageUrl,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when conceptImageUrl changes
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [conceptImageUrl]);

  const handlePlayAnimation = () => {
    if (!conceptImageUrl) return;
    setHasInteracted(true);
    setAnimationFinished(false);
    setIsPlayingAnimation(true);

    // Animation runs for ~8s (matches CSS duration)
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    animationTimerRef.current = setTimeout(() => {
      setIsPlayingAnimation(false);
      setAnimationFinished(true);
    }, 8000);
  };

  const handleReplay = () => {
    setHasInteracted(false);
    setAnimationFinished(false);
    setIsPlayingAnimation(false);
    // Small delay to reset the CSS animation
    requestAnimationFrame(() => {
      handlePlayAnimation();
    });
  };

  // Generating state (transitioning to real video)
  if (isGenerating && !videoUrl) {
    return (
      <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <Film className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">Video Flythrough</h2>
            <p className="text-sm text-ink-400">Cinematic walkthrough of your space</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 via-fuchsia-50 to-indigo-100">
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-canvas-50 shadow-soft">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
            <div className="text-center">
              <p className="font-bold text-ink">Generating flythrough...</p>
              <p className="mt-1 text-sm text-ink-400">Creating a cinematic walkthrough of your renovated space</p>
            </div>
          </div>
          <div className="h-1 w-full overflow-hidden bg-violet-100">
            <div className="h-full w-1/3 animate-[shimmer_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  // Ready state with real video
  if (videoUrl) {
    return (
      <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <Film className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">Video Flythrough</h2>
            <p className="text-sm text-ink-400">AI-generated walkthrough of your space</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl || undefined}
            muted
            playsInline
            className="aspect-video w-full object-cover"
            onEnded={() => setHasEnded(true)}
          />
          {(!hasInteracted || hasEnded) && (
            <div
              onClick={() => { videoRef.current?.play(); setHasInteracted(true); setHasEnded(false); }}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 transition-opacity hover:bg-black/50"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-transform hover:scale-105">
                <Play className="ml-0.5 h-7 w-7 text-ink" />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>
    );
  }

  // CSS Ken Burns flythrough — always available, no API needed
  // Slow cinematic zoom + pan on the concept image, looks like a real camera move
  return (
    <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50">
          <Film className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Flythrough Preview</h2>
          <p className="text-sm text-ink-400">
            {conceptImageUrl
              ? 'Cinematic walkthrough — tap to preview'
              : 'Upload a photo and get an estimate to unlock'}
          </p>
        </div>
      </div>

      {conceptImageUrl ? (
        <div
          onClick={isPlayingAnimation || animationFinished ? undefined : handlePlayAnimation}
          className="group relative cursor-pointer overflow-hidden rounded-xl bg-black"
        >
          {/* Ken Burns animation */}
          <div
            className={`aspect-video w-full ${isPlayingAnimation ? 'animate-ken-burns' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={conceptImageUrl}
              alt="Renovated space preview"
              className={`h-full w-full ${
                isPlayingAnimation
                  ? 'animate-ken-burns-scale'
                  : 'object-cover'
              }`}
              loading="lazy"
            />
          </div>

          {/* Play/replay overlay */}
          {!isPlayingAnimation && (
            <div
              onClick={isPlayingAnimation ? undefined : animationFinished ? handleReplay : handlePlayAnimation}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-opacity hover:bg-black/45"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-transform hover:scale-105">
                <Play className="ml-0.5 h-7 w-7 text-ink" />
              </div>
            </div>
          )}

          {/* Bottom gradient for text */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Label during animation */}
          {isPlayingAnimation && (
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-medium text-white/80 drop-shadow-sm">
                Cinematic walkthrough · 8s
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-br from-canvas-50 to-violet-50 px-6 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-100">
            <Film className="h-6 w-6 text-ink-400" />
          </div>
          <div className="text-center">
            <p className="font-bold text-ink">Preview coming soon</p>
            <p className="mt-1 max-w-sm text-sm text-ink-400">
              Complete your estimate to see a cinematic walkthrough of your renovated space.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
