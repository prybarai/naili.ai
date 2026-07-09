'use client';

import { useMemo, useState } from 'react';
import { Briefcase, FileText, HardHat, ShoppingCart, TrendingUp } from 'lucide-react';
import { cn, formatCurrency, formatCurrencyRange } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { QualityTier } from '@/types';

interface BreakdownItem {
  label: string;
  low: number;
  mid: number;
  high: number;
  percentage: number;
  note: string;
  icon: React.ReactNode;
}

interface Props {
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
  laborMid: number;
  materialsMid: number;
  permitsMid: number;
  regionMultiplier?: number | null;
  className?: string;
}

const QUALITY_TIER_MULTIPLIERS: Record<QualityTier, number> = {
  budget: 0.75,
  mid: 1.0,
  premium: 1.45,
};

const TIER_LABELS: Record<QualityTier, string> = {
  budget: 'Budget — Practical finishes, standard materials',
  mid: 'Mid-range — Quality finishes, balanced value',
  premium: 'Premium — High-end materials, custom detailing',
};

export default function EstimateBreakdown({
  lowEstimate,
  midEstimate,
  highEstimate,
  laborMid,
  materialsMid,
  permitsMid,
  regionMultiplier,
  className,
}: Props) {
  const [qualityTier, setQualityTier] = useState<QualityTier>('mid');
  const multiplier = QUALITY_TIER_MULTIPLIERS[qualityTier];

  const tierAdjustedLow = Math.round(lowEstimate * multiplier);
  const tierAdjustedMid = Math.round(midEstimate * multiplier);
  const tierAdjustedHigh = Math.round(highEstimate * multiplier);

  const breakdownItems: BreakdownItem[] = useMemo(() => {
    const adjustedLabor = Math.round(laborMid * multiplier);
    const adjustedMaterials = Math.round(materialsMid * multiplier);
    const adjustedPermits = Math.round(permitsMid * multiplier);
    const total = adjustedLabor + adjustedMaterials + adjustedPermits;

    return [
      {
        label: 'Labor',
        low: Math.round(lowEstimate * (laborMid / midEstimate) * multiplier),
        mid: adjustedLabor,
        high: Math.round(highEstimate * (laborMid / midEstimate) * multiplier),
        percentage: Math.round((adjustedLabor / total) * 100),
        note: 'Based on avg local rates',
        icon: <HardHat className="h-5 w-5 text-sand-dark" />,
      },
      {
        label: 'Materials',
        low: Math.round(lowEstimate * (materialsMid / midEstimate) * multiplier),
        mid: adjustedMaterials,
        high: Math.round(highEstimate * (materialsMid / midEstimate) * multiplier),
        percentage: Math.round((adjustedMaterials / total) * 100),
        note: 'From local supplier pricing',
        icon: <ShoppingCart className="h-5 w-5 text-mint" />,
      },
      {
        label: 'Permits & Fees',
        low: Math.round(lowEstimate * (permitsMid / midEstimate) * multiplier),
        mid: adjustedPermits,
        high: Math.round(highEstimate * (permitsMid / midEstimate) * multiplier),
        percentage: Math.round((adjustedPermits / total) * 100),
        note: 'Based on your city requirements',
        icon: <FileText className="h-5 w-5 text-slate-smart" />,
      },
    ];
  }, [lowEstimate, midEstimate, highEstimate, laborMid, materialsMid, permitsMid, multiplier]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Three-column breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {breakdownItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.5rem] border border-hairline bg-white p-5 shadow-soft transition-all hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand/10">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <Badge variant="blue" className="text-[10px]">
                  {item.percentage}% of total
                </Badge>
              </div>
            </div>
            <p className="text-2xl font-bold text-ink">
              {formatCurrency(item.mid)}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              {formatCurrencyRange(item.low, item.high)}
            </p>
            <p className="mt-2 text-xs text-ink-400">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Total estimate bar */}
      <div className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sand-dark" />
            <span className="text-sm font-semibold text-ink">
              Total estimate
            </span>
          </div>
          <Badge variant="green">
            {formatCurrencyRange(tierAdjustedLow, tierAdjustedHigh)}
          </Badge>
        </div>

        {/* Range slider visual */}
        <div className="relative h-3 overflow-hidden rounded-full bg-canvas-200">
          <div className="absolute inset-0 bg-gradient-to-r from-sand/60 via-sand-dark to-mint/60" />
          <div
            className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-[3px] border-white bg-ink shadow-lg"
            style={{
              left: `calc(${((tierAdjustedMid - tierAdjustedLow) / (tierAdjustedHigh - tierAdjustedLow)) * 100}% - 12px)`,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
          <span>{formatCurrency(tierAdjustedLow)}</span>
          <span className="font-semibold text-ink">
            {formatCurrency(tierAdjustedMid)} most likely
          </span>
          <span>{formatCurrency(tierAdjustedHigh)}</span>
        </div>

        {regionMultiplier && regionMultiplier !== 1 && (
          <p className="mt-3 text-xs text-ink-500">
            Adjusted for your region (
            {regionMultiplier > 1
              ? `${Math.round((regionMultiplier - 1) * 100)}% above`
              : `${Math.round((1 - regionMultiplier) * 100)}% below`}{' '}
            national average)
          </p>
        )}
      </div>

      {/* Quality tier selector */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-500">
          Adjust quality tier
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(QUALITY_TIER_MULTIPLIERS) as [QualityTier, number][]).map(
            ([tier, _mult]) => (
              <button
                key={tier}
                onClick={() => setQualityTier(tier)}
                className={cn(
                  'rounded-xl border px-4 py-2.5 text-left text-sm transition-all',
                  qualityTier === tier
                    ? 'border-sand-dark bg-sand-light/20 font-semibold text-ink ring-1 ring-sand-dark'
                    : 'border-panel bg-canvas-50 text-ink-600 hover:border-sand'
                )}
              >
                <span className="font-medium">{TIER_LABELS[tier].split(' —')[0]}</span>
                <span className="ml-2 text-xs text-ink-400">{formatCurrency(tierAdjustedMid)}</span>
              </button>
            )
          )}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          {TIER_LABELS[qualityTier]}
        </p>
      </div>
    </div>
  );
}
