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
                  className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110"
                  style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                  onClick={() => handlePinClick(annotation.originalIndex, annotation)}
                  aria-label={`View ${annotation.materialName}`}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-lg ring-2 ring-white transition-all duration-200',
                      isActive
                        ? 'scale-110 bg-ink text-white ring-ink/30'
                        : 'bg-[var(--sand)] text-ink ring-white hover:bg-[var(--sand-light)]'
                    )}
                  >
                    {annotation.originalIndex + 1}
                  </span>
                </button>

                {/* Tooltip */}
                {isActive && (
                  <div
                    className="absolute z-20 w-56 -translate-x-1/2 translate-y-3"
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

      {/* Annotation legend */}
      {annotations.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <MapPin className="h-3 w-3 text-[var(--sand)]" />
          <span>
            {annotations.length} material{annotations.length !== 1 ? 's' : ''} identified
            — tap a pin for details
          </span>
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
