'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';

interface Props {
  confidence: number; // 0-1
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
  className?: string;
}

function confidenceLabel(score: number) {
  if (score >= 0.85) return { label: 'High Confidence', color: 'text-mint', barColor: 'bg-mint' };
  if (score >= 0.65) return { label: 'Good Confidence', color: 'text-emerald-500', barColor: 'bg-emerald-500' };
  if (score >= 0.45) return { label: 'Medium Confidence', color: 'text-sand-dark', barColor: 'bg-sand-dark' };
  return { label: 'Broad Estimate', color: 'text-ink-500', barColor: 'bg-ink-500/40' };
}

function rangeTightness(low: number, high: number): number {
  if (low === high) return 1;
  return 1 - (high - low) / (high + low) / 2;
}

export default function ForensicGauge({
  confidence,
  lowEstimate,
  midEstimate,
  highEstimate,
  className,
}: Props) {
  const label = confidenceLabel(confidence);
  const tightness = rangeTightness(lowEstimate, highEstimate);
  const gaugePercent = Math.min(100, Math.max(10, Math.round(confidence * 100)));

  return (
    <div className={cn('space-y-4', className)}>
      {/* Thermometer gauge */}
      <div className="flex items-center gap-4">
        <div className="relative flex h-32 w-8 flex-col items-center justify-end rounded-full bg-canvas-200 shadow-inner">
          {/* Fill */}
          <motion.div
            className={cn(
              'absolute bottom-0 w-full rounded-full transition-colors',
              label.barColor
            )}
            initial={{ height: '0%' }}
            animate={{ height: `${gaugePercent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: confidence >= 0.65 ? undefined : undefined }}
            />
          </motion.div>

          {/* Tick marks */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
            {[100, 75, 50, 25, 0].map((tick) => {
              const isActive = gaugePercent >= tick;
              return (
                <div key={tick} className="flex items-center gap-1">
                  <div
                    className={cn(
                      'h-px w-full transition-colors',
                      isActive ? 'bg-white/40' : 'bg-ink-500/15'
                    )}
                  />
                </div>
              );
            })}
          </div>

          {/* Icon */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <Thermometer className={cn(
              'h-5 w-5',
              confidence >= 0.65 ? 'text-mint' : 'text-sand-dark'
            )} />
          </div>
        </div>

        {/* Labels */}
        <div className="space-y-1">
          <p className={cn('text-lg font-bold', label.color)}>
            {label.label}
          </p>
          <p className="text-xs text-ink-500">
            Estimate range:{' '}
            {tightness >= 0.6
              ? 'Tight'
              : tightness >= 0.4
                ? 'Moderate'
                : 'Broad'}
          </p>
          <p className="text-xs text-ink-500">
            Range spread:{' '}
            {Math.round(((highEstimate - lowEstimate) / midEstimate) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
