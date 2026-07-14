'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calculator, Loader2, Minus, Plus, RefreshCw } from 'lucide-react';
import { cn, formatCurrency, formatCurrencyRange } from '@/lib/utils';
import posthog from 'posthog-js';
import type { Estimate, ProjectCategory, QualityTier, StylePreference } from '@/types';

interface Props {
  initialEstimate: Estimate;
  initialTier: QualityTier;
  initialStyle: StylePreference;
  projectId: string;
  category: ProjectCategory;
  zipCode: string;
  notes: string;
  onEstimateUpdate?: (estimate: Estimate) => void;
}

type ScopeOption = {
  id: string;
  label: string;
  checked: boolean;
};

const CATEGORY_SCOPE_OPTIONS: Record<string, ScopeOption[]> = {
  kitchen: [
    { id: 'full_remodel', label: 'Full remodel', checked: true },
    { id: 'cabinets_only', label: 'Cabinets only', checked: false },
    { id: 'countertops_only', label: 'Countertops only', checked: false },
    { id: 'appliances_only', label: 'Appliances only', checked: false },
  ],
  bathroom: [
    { id: 'full_gut', label: 'Full gut', checked: true },
    { id: 'cosmetic_refresh', label: 'Cosmetic refresh', checked: false },
    { id: 'fixture_swap', label: 'Fixture swap only', checked: false },
  ],
  interior_paint: [
    { id: 'walls_only', label: 'Walls only', checked: true },
    { id: 'walls_ceiling', label: 'Walls + ceiling', checked: false },
    { id: 'walls_ceiling_trim', label: 'Walls + ceiling + trim', checked: false },
  ],
  exterior_paint: [
    { id: 'full_exterior', label: 'Full exterior', checked: true },
    { id: 'accent_only', label: 'Accent areas only', checked: false },
    { id: 'trim_only', label: 'Trim only', checked: false },
  ],
  flooring: [
    { id: 'standard_install', label: 'Standard install', checked: true },
    { id: 'premium_install', label: 'Premium install', checked: false },
    { id: 'subfloor_prep', label: 'Subfloor prep needed', checked: false },
  ],
  roofing: [
    { id: 'standard_replace', label: 'Standard replacement', checked: true },
    { id: 'premium_materials', label: 'Premium materials', checked: false },
    { id: 'tear_off', label: 'Tear-off & replace', checked: true },
  ],
  deck_patio: [
    { id: 'standard_deck', label: 'Standard deck build', checked: true },
    { id: 'premium_materials', label: 'Premium materials', checked: false },
    { id: 'with_railing', label: 'With railing', checked: true },
  ],
  landscaping: [
    { id: 'lawn_beds', label: 'Lawn & beds', checked: true },
    { id: 'full_yard', label: 'Full yard redesign', checked: false },
    { id: 'hardscape', label: 'Hardscape included', checked: false },
  ],
};

const GENERAL_SCOPE_OPTIONS: ScopeOption[] = [
  { id: 'permit_included', label: 'Permit included', checked: true },
  { id: 'demo_included', label: 'Demo included', checked: false },
  { id: 'design_consultation', label: 'Design consultation', checked: false },
];

const TIER_LABELS: Record<QualityTier, { label: string; emoji: string; multiplier: number }> = {
  budget: { label: 'Budget', emoji: '\u{1F4B0}', multiplier: 0.9 },
  mid: { label: 'Mid-Range', emoji: '\u{2696}\uFE0F', multiplier: 1.0 },
  premium: { label: 'Premium', emoji: '\u{1F451}', multiplier: 1.18 },
};

const TIER_ORDER: QualityTier[] = ['budget', 'mid', 'premium'];

export default function CostPlayground({
  initialEstimate,
  initialTier,
  initialStyle: _initialStyle,
  projectId,
  category,
  zipCode: _zipCode,
  notes: _notes,
  onEstimateUpdate,
}: Props) {
  const [tier, setTier] = useState(initialTier);
  const [customNotes, setCustomNotes] = useState('');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState(initialEstimate);
  const [localTier, setLocalTier] = useState(initialTier);
  const [hasChanges, setHasChanges] = useState(false);

  // Scope toggles
  const scopeOptions = useMemo(() => {
    const cats = CATEGORY_SCOPE_OPTIONS[category] || CATEGORY_SCOPE_OPTIONS.kitchen;
    return cats.map((opt) => ({ ...opt }));
  }, [category]);

  const [scopeToggles, setScopeToggles] = useState<Record<string, boolean>>(() => {
    const toggles: Record<string, boolean> = {};
    for (const opt of scopeOptions) {
      toggles[opt.id] = opt.checked;
    }
    for (const opt of GENERAL_SCOPE_OPTIONS) {
      toggles[opt.id] = opt.checked;
    }
    return toggles;
  });

  const tierIndex = TIER_ORDER.indexOf(localTier);

  const effectiveMultiplier = useMemo(() => {
    const baseMultiplier = TIER_LABELS[localTier].multiplier;
    const scopeMultiplier = 1 + (Object.values(scopeToggles).filter(Boolean).length - 1) * 0.05;
    return Number((baseMultiplier * scopeMultiplier).toFixed(2));
  }, [localTier, scopeToggles]);

  const projectedEstimate = useMemo(() => {
    const base = currentEstimate.mid_estimate / TIER_LABELS[initialTier].multiplier;
    const newMid = Math.round(base * effectiveMultiplier);
    const low = Math.round(newMid * 0.85);
    const high = Math.round(newMid * 1.15);
    return { low, mid: newMid, high };
  }, [currentEstimate.mid_estimate, initialTier, effectiveMultiplier]);

  const priceDiff = projectedEstimate.mid - currentEstimate.mid_estimate;
  const priceChangePct = currentEstimate.mid_estimate > 0
    ? ((priceDiff / currentEstimate.mid_estimate) * 100).toFixed(1)
    : '0';

  // Track changes
  useEffect(() => {
    const tierChanged = localTier !== initialTier;
    const notesChanged = customNotes.trim().length > 0;
    setHasChanges(tierChanged || notesChanged);
  }, [localTier, initialTier, customNotes]);

  const handleRecalculate = useCallback(async () => {
    setIsRecalculating(true);
    try {
      const scopeSelections = Object.entries(scopeToggles)
        .filter(([, checked]) => checked)
        .map(([id]) => id)
        .join(',');

      const res = await fetch('/api/vision/update-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          quality_tier: localTier,
          style: _initialStyle,
          category,
          notes: customNotes || undefined,
          scope_selections: scopeSelections || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to update estimate');

      const data = await res.json();
      setCurrentEstimate(data.estimate);
      setTier(localTier);
      onEstimateUpdate?.(data.estimate);
      setHasChanges(false);
      setCustomNotes('');

      posthog.capture('naili_cost_playground_updated', {
        project_id: projectId,
        new_tier: localTier,
        new_mid: projectedEstimate.mid,
      });
    } catch (err) {
      console.error('[CostPlayground] update error:', err);
    } finally {
      setIsRecalculating(false);
    }
  }, [projectId, localTier, customNotes, onEstimateUpdate, projectedEstimate.mid]);

  return (
    <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-50">
          <Calculator className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Adjust Your Scope</h2>
          <p className="text-sm text-ink-400">Tweak options to see how pricing changes</p>
        </div>
      </div>

      {/* Quality Tier Slider */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Quality Level</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1 text-sm font-bold text-ink">
            {TIER_LABELS[localTier].emoji} {TIER_LABELS[localTier].label}
          </span>
        </div>
        <div className="relative flex h-10 items-center">
          <button
            type="button"
            onClick={() => {
              const idx = Math.max(0, tierIndex - 1);
              setLocalTier(TIER_ORDER[idx]);
            }}
            disabled={tierIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-white text-ink-500 transition-colors hover:bg-canvas-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="mx-3 flex flex-1 items-center">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-canvas-200">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-sand-dark via-amber-500 to-amber-600 transition-all duration-500 ease-out"
                style={{ width: `${((tierIndex) / (TIER_ORDER.length - 1)) * 100}%` }}
              />
            </div>
            <div className="ml-3 flex gap-1 text-[10px] font-medium text-ink-400">
              {TIER_ORDER.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLocalTier(t)}
                  className={cn(
                    'rounded-md px-2 py-1 transition-colors',
                    i === tierIndex ? 'bg-amber-100 text-amber-800 font-bold' : 'hover:bg-canvas-50'
                  )}
                >
                  {TIER_LABELS[t].label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const idx = Math.min(TIER_ORDER.length - 1, tierIndex + 1);
              setLocalTier(TIER_ORDER[idx]);
            }}
            disabled={tierIndex === TIER_ORDER.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-white text-ink-500 transition-colors hover:bg-canvas-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scope Toggles */}
      <div className="mb-6">
        <span className="mb-3 block text-sm font-semibold text-ink">Scope Items</span>
        <div className="flex flex-wrap gap-2">
          {scopeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setScopeToggles((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }))}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                scopeToggles[opt.id]
                  ? 'border-ink bg-ink text-white shadow-soft'
                  : 'border-hairline bg-canvas-50 text-ink-500 hover:bg-canvas-100'
              )}
            >
              {scopeToggles[opt.id] ? '\u2713 ' : ''}{opt.label}
            </button>
          ))}
          {GENERAL_SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setScopeToggles((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }))}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
                scopeToggles[opt.id]
                  ? 'border-ink bg-ink text-white shadow-soft'
                  : 'border-hairline bg-canvas-50 text-ink-500 hover:bg-canvas-100'
              )}
            >
              {scopeToggles[opt.id] ? '\u2713 ' : ''}{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label htmlFor="cost-notes" className="mb-1.5 block text-sm font-semibold text-ink">
          Additional Context
        </label>
        <textarea
          id="cost-notes"
          rows={2}
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Any special considerations? (e.g., vaulted ceilings, custom sizes, material preferences)"
          className="w-full rounded-xl border border-hairline bg-canvas-50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10 resize-none"
        />
      </div>

      {/* Price Impact */}
      <div className="mb-6 rounded-xl border border-hairline bg-canvas-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">Projected estimate</span>
          <span className="text-xl font-extrabold text-ink">
            {formatCurrencyRange(projectedEstimate.low, projectedEstimate.high)}
          </span>
        </div>
        {priceDiff !== 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
              priceDiff > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            )}>
              {priceDiff > 0 ? '\u2191' : '\u2193'} {formatCurrency(Math.abs(priceDiff))} ({priceChangePct}%)
            </span>
            <span className="text-[10px] text-ink-400">
              vs. current estimate of {formatCurrency(currentEstimate.mid_estimate)}
            </span>
          </div>
        )}
      </div>

      {/* Recalculate Button */}
      <button
        type="button"
        onClick={handleRecalculate}
        disabled={!hasChanges || isRecalculating}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-white shadow-soft transition-all duration-200 hover:opacity-90 hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRecalculating ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Recalculating...</>
        ) : (
          <><RefreshCw className="h-4 w-4" /> Save Changes</>
        )}
      </button>
    </div>
  );
}
