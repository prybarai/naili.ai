'use client';

import { ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface Props {
  zipCode: string;
  regionMultiplier: number;
  nationalAvgMid: number;
  localMid: number;
  className?: string;
}

export default function MarketContext({
  zipCode,
  regionMultiplier,
  nationalAvgMid,
  localMid,
  className,
}: Props) {
  const percentDiff = Math.round(Math.abs(regionMultiplier - 1) * 100);
  const isAboveAvg = regionMultiplier > 1;
  const isBelowAvg = regionMultiplier < 1;
  const isFlat = regionMultiplier === 1;

  const marketDataPoints = [
    {
      label: 'National average',
      value: formatCurrency(nationalAvgMid),
      isLocal: false,
    },
    {
      label: `ZIP ${zipCode}`,
      value: formatCurrency(localMid),
      isLocal: true,
    },
  ];

  return (
    <div className={cn('space-y-5', className)}>
      {/* Comparison header */}
      <div className="rounded-[1.5rem] border border-hairline bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sand-dark" />
          <span className="text-sm font-semibold text-ink">
            Local market context
          </span>
        </div>

        {/* Comparison bars */}
        <div className="space-y-4">
          {marketDataPoints.map((point) => (
            <div key={point.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={cn(
                    'font-medium',
                    point.isLocal ? 'text-ink' : 'text-ink-500'
                  )}
                >
                  {point.label}
                </span>
                <span
                  className={cn(
                    'font-bold',
                    point.isLocal ? 'text-ink' : 'text-ink-500'
                  )}
                >
                  {point.value}
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-canvas-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    point.isLocal
                      ? isAboveAvg
                        ? 'bg-gradient-to-r from-sand-dark to-amber-500'
                        : isBelowAvg
                          ? 'bg-gradient-to-r from-mint to-emerald-500'
                          : 'bg-sand-dark'
                      : 'bg-ink-500/20'
                  )}
                  style={{
                    width: `${
                      point.isLocal
                        ? Math.min(100, Math.round((localMid / nationalAvgMid) * 50 + 25))
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Difference callout */}
        <div className="mt-4 rounded-2xl bg-canvas-50 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                isAboveAvg
                  ? 'bg-amber-50'
                  : isBelowAvg
                    ? 'bg-mint/20'
                    : 'bg-canvas-200'
              )}
            >
              {isAboveAvg ? (
                <ArrowUp className="h-5 w-5 text-amber-600" />
              ) : isBelowAvg ? (
                <ArrowDown className="h-5 w-5 text-emerald-600" />
              ) : (
                <Minus className="h-5 w-5 text-ink-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                {isFlat
                  ? 'Your area is at the national average'
                  : `Homes in your area spend ${percentDiff}% ${isAboveAvg ? 'more' : 'less'}`}
              </p>
              <p className="text-xs text-ink-500">
                Based on regional construction cost data and your ZIP code
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data source badge */}
      <div className="flex items-center gap-2 text-xs text-ink-400">
        <Badge variant="blue">Regional data</Badge>
        <span>Adjustment factor: {regionMultiplier.toFixed(2)}x</span>
      </div>
    </div>
  );
}
