'use client';

import { useRef, useState } from 'react';
import { Film, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  videoUrl?: string;
  thumbnailUrl?: string;
  isGenerating?: boolean;
}

export default function VideoFlythrough({ videoUrl, thumbnailUrl, isGenerating }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setHasInteracted(true);
      setHasEnded(false);
    }
  };

  // Generating state
  if (isGenerating) {
    return (
      <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <Film className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">Video Flythrough</h2>
            <p className="text-sm text-ink-400">AI-generated walkthrough</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 via-fuchsia-50 to-indigo-100">
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
            {/* Pulsing gradient placeholder */}
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-violet-200 opacity-60" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft">
                <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-ink">Generating flythrough...</p>
              <p className="mt-1 text-sm text-ink-400">Creating a cinematic walkthrough of your renovated space</p>
            </div>
          </div>
          {/* Animated gradient bar at bottom */}
          <div className="h-1 w-full overflow-hidden bg-violet-100">
            <div className="h-full w-1/3 animate-[shimmer_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  // Ready state with video
  if (videoUrl) {
    return (
      <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
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
          {/* Play overlay */}
          {(!hasInteracted || hasEnded) && (
            <div
              onClick={handlePlay}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 transition-opacity hover:bg-black/50"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-transform hover:scale-105">
                <Play className="ml-0.5 h-7 w-7 text-ink" />
              </div>
            </div>
          )}
          {/* Bottom gradient overlay */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>
    );
  }

  // Unavailable / placeholder state
  return (
    <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50">
          <Film className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Video Flythrough</h2>
          <p className="text-sm text-ink-400">AI-generated walkthrough</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-br from-gray-50 to-violet-50 px-6 py-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Film className="h-6 w-6 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="font-bold text-ink">Flythrough coming soon</p>
          <p className="mt-1 max-w-sm text-sm text-ink-400">
            AI-powered video walkthroughs are on the way. You&apos;ll be able to see a cinematic tour of your renovated space.
          </p>
        </div>
      </div>
    </div>
  );
}
