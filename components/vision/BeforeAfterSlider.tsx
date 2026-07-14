'use client';

import Image from 'next/image';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeftRight, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  priority?: boolean;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  priority = false,
}: Props) {
  const [position, setPosition] = useState(50);
  const [isFullReveal, setIsFullReveal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef(0);
  const dragStartX = useRef(0);

  const safePosition = isFullReveal ? 100 : Math.min(95, Math.max(5, position));

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartPos.current = safePosition;
    dragStartX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [safePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const delta = ((e.clientX - dragStartX.current) / rect.width) * 100;
    setPosition(Math.max(5, Math.min(95, dragStartPos.current + delta)));
    // Exit full reveal on drag
    if (isFullReveal) setIsFullReveal(false);
  }, [isFullReveal]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    if (isFullReveal) {
      setIsFullReveal(false);
      setPosition(clickX < 50 ? 30 : 70);
    } else if (clickX < 20) {
      setPosition(20);
    } else if (clickX > 80) {
      setPosition(80);
    } else {
      // Snap to click position
      setPosition(clickX);
    }
  }, [isFullReveal]);

  const toggleReveal = useCallback(() => {
    setIsFullReveal((v) => !v);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPosition((p) => Math.max(5, p - 5));
      if (e.key === 'ArrowRight') setPosition((p) => Math.min(95, p + 5));
    };
    const el = containerRef.current;
    el?.addEventListener('keydown', handleKey);
    return () => el?.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-hairline bg-canvas-50 shadow-lift">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] bg-canvas-200/70 cursor-col-resize select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleContainerClick}
        role="slider"
        tabIndex={0}
        aria-label="Compare before and after images"
        aria-valuemin={5}
        aria-valuemax={95}
        aria-valuenow={safePosition}
      >
        {/* Before image (full width — always visible on the right) */}
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority}
          draggable={false}
        />

        {/* After image (clipped to the left by slider position) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${safePosition}%` }}
        >
          <div
            className="relative h-full"
            style={{ width: `${100 / (safePosition / 100)}%`, maxWidth: 'none' }}
          >
            <Image
              src={afterImage}
              alt={afterLabel}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={priority}
              draggable={false}
            />
          </div>
        </div>

        {/* Slider divider — grabs events directly */}
        <div
          className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 cursor-col-resize"
          style={{ left: `${safePosition}%` }}
          onPointerDown={(e) => {
            // Block the event from reaching the parent onPointerDown so
            // the drag starts from the divider's position, not a jump
            e.stopPropagation();
            isDragging.current = true;
            dragStartPos.current = safePosition;
            dragStartX.current = e.clientX;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
        >
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(23,24,28,0.06)]">
            <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-ink-600 shadow-[0_2px_12px_rgba(0,0,0,0.2)] backdrop-blur transition-transform duration-150 hover:scale-110 active:scale-95">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Labels */}
        {!isFullReveal && (
          <>
            <div
              className="absolute top-4 pointer-events-none z-20 transition-all duration-75"
              style={{ left: `clamp(8px, calc(${Math.max(safePosition - 10, 20)}% - 30px), 40%)` }}
            >
              <span className="inline-block rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur shadow-sm">
                {afterLabel}
              </span>
            </div>
            <div
              className="absolute top-4 pointer-events-none z-20 transition-all duration-75"
              style={{ right: `clamp(8px, calc(${Math.max(100 - safePosition - 10, 20)}% - 30px), 40%)` }}
            >
              <span className="inline-block rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur shadow-sm">
                {beforeLabel}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-hairline bg-canvas-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={95}
            value={isFullReveal ? 95 : position}
            onChange={(event) => {
              setPosition(Number(event.target.value));
              setIsFullReveal(false);
            }}
            className="flex-1 accent-[var(--sand)]"
            aria-label="Compare before and after images"
          />
          <button
            onClick={toggleReveal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-canvas-50 px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-soft transition-all hover:bg-canvas-100 hover:shadow-md"
            title={isFullReveal ? 'Show split view' : 'Show full after image'}
          >
            {isFullReveal ? (
              <><Minimize2 className="h-3.5 w-3.5" /> Split</>
            ) : (
              <><Maximize2 className="h-3.5 w-3.5" /> Reveal full</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
