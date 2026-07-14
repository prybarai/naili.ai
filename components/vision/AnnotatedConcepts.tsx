'use client';

import { useState, useCallback } from 'react';
import { ShoppingCart, MapPin, X } from 'lucide-react';
import type { ImageAnnotation } from '@/types';

interface Props {
  imageUrl: string;
  annotations: ImageAnnotation[];
  onAnnotationClick?: (annotation: ImageAnnotation) => void;
}

export default function AnnotatedConcepts({ imageUrl, annotations, onAnnotationClick }: Props) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handlePinClick = useCallback(
    (idx: number, annotation: ImageAnnotation) => {
      setActiveAnnotation((prev) => (prev === idx ? null : idx));
      onAnnotationClick?.(annotation);
    },
    [onAnnotationClick]
  );

  const sortedAnnotations = [...annotations]
    .map((a, i) => ({ ...a, originalIndex: i }))
    .sort((a, b) => {
      // Order: top-left to bottom-right
      const scoreA = a.y * 100 + a.x;
      const scoreB = b.y * 100 + b.x;
      return scoreA - scoreB;
    });

  return (
    <div className="relative inline-block w-full select-none">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-xl bg-canvas-200/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Renovation concept with material annotations"
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay grid dots when image is loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand border-t-transparent" />
          </div>
        )}

        {/* Annotation pins */}
        {imageLoaded &&
          sortedAnnotations.map((annotation) => {
            const isActive = activeAnnotation === annotation.originalIndex;
            return (
              <div key={annotation.originalIndex}>
                {/* Pin marker */}
                <button
                  type="button"
                  className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                  onClick={() => handlePinClick(annotation.originalIndex, annotation)}
                  onMouseEnter={() => setHoveredIndex(annotation.originalIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-label={`View ${annotation.materialName}`}
                >
                  {/* Pulse ring */}
                  <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30 opacity-75" />

                  {/* Pin circle */}
                  <span
                    className={cn(
                      'relative flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow-lg ring-2 ring-white transition-all duration-200',
                      isActive
                        ? 'scale-110 bg-ink text-white ring-ink/30'
                        : 'bg-[var(--sand)] text-ink ring-white hover:scale-110 hover:bg-[var(--sand-light)]'
                    )}
                  >
                    {annotation.originalIndex + 1}
                  </span>
                </button>

                {/* Hover tooltip (name only) */}
                {!isActive && hoveredIndex === annotation.originalIndex && (
                  <div
                    className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[calc(100%+8px)]"
                    style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                  >
                    <div className="whitespace-nowrap rounded-md bg-black/80 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
                      {annotation.materialName}
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/80" />
                    </div>
                  </div>
                )}

                {/* Tooltip */}
                {isActive && (
                  <div
                    className="absolute z-20 w-56 -translate-x-1/2 translate-y-3 animate-pop-in"
                    style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                  >
                    <div className="rounded-xl border border-hairline bg-white p-3 shadow-lift backdrop-blur-sm">
                      {/* Header */}
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                            {annotation.category}
                          </p>
                          <p className="text-sm font-bold text-ink">
                            {annotation.materialName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveAnnotation(null)}
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-canvas-100 hover:text-ink"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price & Quantity */}
                      <div className="mb-2 space-y-1 text-sm">
                        <div className="flex items-center gap-1.5 text-ink-600">
                          <span className="font-bold text-ink">{annotation.price}</span>
                          {annotation.quantity && (
                            <>
                              <span className="text-ink-300">·</span>
                              <span className="text-ink-500">{annotation.quantity}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Shopping link */}
                      {annotation.shopUrl && (
                        <a
                          href={annotation.shopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Shop now
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Annotation legend — numbered list matching pins */}
      {annotations.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
            <MapPin className="h-3 w-3 text-[var(--sand)]" />
            Materials
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {sortedAnnotations.map((annotation) => (
              <button
                key={annotation.originalIndex}
                type="button"
                onClick={() => handlePinClick(annotation.originalIndex, annotation)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-all duration-150',
                  activeAnnotation === annotation.originalIndex
                    ? 'bg-ink/5 text-ink font-medium'
                    : 'text-ink-500 hover:bg-canvas-100 hover:text-ink'
                )}
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-[10px] font-bold text-ink ring-1 ring-hairline">
                  {annotation.originalIndex + 1}
                </span>
                <span className="truncate">{annotation.materialName}</span>
                <span className="ml-auto flex-shrink-0 text-ink-400">{annotation.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tailwind-safe `cn` helper to avoid importing cn from a path we're not sure about.
 */
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
