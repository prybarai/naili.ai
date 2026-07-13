'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PROJECT_CATEGORIES, type ProjectCategory, type QualityTier } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORIES = Object.entries(PROJECT_CATEGORIES).map(([key, val]) => ({
  value: key as ProjectCategory,
  ...val,
}));

const QUALITY_TIERS: { value: QualityTier; label: string; multiplier: number }[] = [
  { value: 'budget', label: 'Budget', multiplier: 0.7 },
  { value: 'mid', label: 'Mid-range', multiplier: 1.0 },
  { value: 'premium', label: 'Premium', multiplier: 1.5 },
];

/* Base sqft estimates per category (rough) */
const BASE_COST_PER_SQFT: Record<string, { low: number; mid: number; high: number }> = {
  interior_paint: { low: 1.5, mid: 3.5, high: 6 },
  exterior_paint: { low: 2, mid: 4, high: 7 },
  kitchen: { low: 75, mid: 150, high: 250 },
  bathroom: { low: 60, mid: 120, high: 200 },
  basement: { low: 25, mid: 55, high: 100 },
  flooring: { low: 5, mid: 12, high: 22 },
  roofing: { low: 4, mid: 8, high: 15 },
  deck_patio: { low: 20, mid: 45, high: 80 },
  landscaping: { low: 3, mid: 10, high: 25 },
};

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<'cost' | 'roi' | 'materials'>('cost');
  const [category, setCategory] = useState<ProjectCategory>('interior_paint');
  const [sqft, setSqft] = useState('200');
  const [quality, setQuality] = useState<QualityTier>('mid');
  const [zipHint, setZipHint] = useState('');
  const [showRoiForm, setShowRoiForm] = useState(false);

  /* ── Cost Calculator Logic ── */
  const baseCosts = BASE_COST_PER_SQFT[category] || { low: 10, mid: 30, high: 60 };
  const area = parseFloat(sqft) || 0;
  const qualityMult = QUALITY_TIERS.find((t) => t.value === quality)?.multiplier || 1;
  const zipAdjust = zipHint.length === 5 ? 1.1 : 1.0; /* rough urban premium */

  const estimateLow = Math.round(area * baseCosts.low * qualityMult * zipAdjust);
  const estimateMid = Math.round(area * baseCosts.mid * qualityMult * zipAdjust);
  const estimateHigh = Math.round(area * baseCosts.high * qualityMult * zipAdjust);

  /* ── ROI Calculator ── */
  const ROI_TABLE: Record<string, { recoup: string; description: string }> = {
    kitchen: { recoup: '60-80%', description: 'Mid-range kitchen remodels typically recoup about 60–80% of cost at resale.' },
    bathroom: { recoup: '55-70%', description: 'Bathroom remodels generally see 55–70% return, higher for primary bathrooms.' },
    roofing: { recoup: '60-75%', description: 'New roofs are strong sellers, recouping 60–75% at resale.' },
    deck_patio: { recoup: '65-75%', description: 'Decks and patios offer good ROI, often 65–75% recouped.' },
    interior_paint: { recoup: '50-70%', description: 'Fresh paint is low-cost but adds appeal — recoup varies by condition.' },
    flooring: { recoup: '50-70%', description: 'New hardwood or quality LVP tends to outperform carpet in ROI.' },
    basement: { recoup: '50-70%', description: 'Finished basements add usable space but ROI depends on local market.' },
  };

  return (
    <>
      <div className="relative min-h-screen overflow-x-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(216,185,138,0.08),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">

          <p className="nl-eyebrow text-center">Free Tools</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-ink mb-2">Renovation Calculators</h1>
          <p className="text-center text-ink-500 max-w-lg mx-auto mb-8">
            Quick planning tools to ballpark costs, estimate ROI, and figure out materials for your home project.
          </p>

          {/* Tab selector */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: 'cost' as const, label: '💵 Cost Estimator' },
              { id: 'roi' as const, label: '📈 ROI Calculator' },
              { id: 'materials' as const, label: '📦 Material Estimator' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-ink text-canvas-50 shadow-md ring-1 ring-sand-dark/30'
                  : 'bg-white/70 text-ink-500 hover:bg-white border border-panel'
              )}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ═══════════ COST ESTIMATOR ═══════════ */}
          {activeTab === 'cost' && (
            <div className="nl-card--elevated p-6 sm:p-8">
              <h2 className="text-xl font-bold text-ink mb-6">Quick Cost Estimator</h2>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <p className="mono-label mb-2">Project Type</p>
                  <select value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full rounded-xl border border-panel bg-canvas-50 px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-sand">
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="mono-label mb-2">Area (sq ft)</p>
                  <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-panel bg-canvas-50 px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-sand"
                    placeholder="200" min="1" />
                </div>
                <div>
                  <p className="mono-label mb-2">Quality Level</p>
                  <div className="flex gap-2">
                    {QUALITY_TIERS.map((tier) => (
                      <button key={tier.value} onClick={() => setQuality(tier.value)} className={cn(
                        'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium text-center transition-all',
                        quality === tier.value
                          ? 'bg-sand-light/20 border-sand-dark text-ink'
                          : 'bg-white/40 border-panel text-ink-500 hover:border-sand'
                      )}>{tier.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mono-label mb-2">ZIP (optional, for local adjustment)</p>
                  <input type="text" value={zipHint} onChange={(e) => setZipHint(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="w-full rounded-xl border border-panel bg-canvas-50 px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-sand"
                    placeholder="10001" maxLength={5} />
                </div>
              </div>

              {area > 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-sand/5 to-amber-50/50 border border-sand/20 p-6">
                  <p className="mono-label mb-3">Estimated Range</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-ink-500 mb-1">Low</p>
                      <p className="text-2xl font-bold text-ink">${estimateLow.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-500 mb-1">Typical</p>
                      <p className="text-3xl font-bold nl-gradient-text">${estimateMid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-500 mb-1">High</p>
                      <p className="text-2xl font-bold text-ink">${estimateHigh.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-ink-400 mt-4 text-center">
                    This is a quick ballpark estimate. Get a detailed, photo-based estimate with Naili.
                  </p>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link href="/" className="nl-pill nl-pill--primary mx-auto inline-flex">
                  Get My Full Estimate →
                </Link>
              </div>
            </div>
          )}

          {/* ═══════════ ROI CALCULATOR ═══════════ */}
          {activeTab === 'roi' && (
            <div className="nl-card--elevated p-6 sm:p-8">
              <h2 className="text-xl font-bold text-ink mb-2">Return on Investment Guide</h2>
              <p className="text-sm text-ink-500 mb-6">
                Typical resale value recoup rates for common home improvement projects.
              </p>

              <div className="space-y-3 mb-6">
                {Object.entries(ROI_TABLE).map(([key, roi]) => {
                  const catInfo = CATEGORIES.find((c) => c.value === key);
                  return (
                    <div key={key} className="flex items-start gap-3 nl-card">
                      <span className="text-lg">{catInfo?.emoji || '🏠'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="font-semibold text-ink text-sm">{catInfo?.label || key}</span>
                          <span className="text-sm font-bold text-mint">{roi.recoup}</span>
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5">{roi.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-ink-400">
                ROI varies by region, property value, and project quality. These are national benchmarks from industry remodeling cost surveys.
              </p>

              <div className="mt-6 text-center">
                <Link href="/" className="nl-pill nl-pill--secondary mx-auto inline-flex">
                  Start a project to see local ROI →
                </Link>
              </div>
            </div>
          )}

          {/* ═══════════ MATERIAL ESTIMATOR ═══════════ */}
          {activeTab === 'materials' && (
            <div className="nl-card--elevated p-6 sm:p-8">
              <h2 className="text-xl font-bold text-ink mb-4">Material Quantity Estimator</h2>

              <div className="space-y-6">
                {/* Paint */}
                <div className="nl-card">
                  <h3 className="font-bold text-ink text-sm mb-2">🎨 Interior Paint</h3>
                  <p className="text-sm text-ink-500 mb-3">
                    One gallon of paint typically covers ~350-400 sq ft (one coat). For trim, add ~1 quart per room.
                  </p>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Room sq ft" className="w-28 rounded-lg border border-panel bg-canvas-50 px-3 py-1.5 text-sm text-ink outline-none focus:border-sand" />
                    <span className="text-xs text-ink-400">≈ needs ~</span>
                    <span className="text-sm font-bold text-ink">0 gallons</span>
                    <span className="text-xs text-ink-500">(2 coats)</span>
                  </div>
                </div>

                {/* Flooring */}
                <div className="nl-card">
                  <h3 className="font-bold text-ink text-sm mb-2">🪵 Flooring</h3>
                  <p className="text-sm text-ink-500 mb-3">
                    Order ~10% extra for waste and cuts. For patterns (herringbone, diagonal), add ~15%.
                  </p>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Room sq ft" className="w-28 rounded-lg border border-panel bg-canvas-50 px-3 py-1.5 text-sm text-ink outline-none focus:border-sand" />
                    <span className="text-xs text-ink-400">+10% waste ≈</span>
                    <span className="text-sm font-bold text-ink">0 sq ft</span>
                  </div>
                </div>

                {/* Tile */}
                <div className="nl-card">
                  <h3 className="font-bold text-ink text-sm mb-2">🧱 Tile</h3>
                  <p className="text-sm text-ink-500 mb-3">
                    Tile is sold by sq ft. Standard boxes cover 10-12 sq ft. Add 10-15% for cuts and breakage.
                  </p>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Tile area sq ft" className="w-28 rounded-lg border border-panel bg-canvas-50 px-3 py-1.5 text-sm text-ink outline-none focus:border-sand" />
                    <span className="text-xs text-ink-400">+15% waste ≈</span>
                    <span className="text-sm font-bold text-ink">0 sq ft</span>
                  </div>
                </div>

                <p className="text-xs text-ink-400 text-center">
                  Get a full material list with quantities, specs, and estimated costs for your specific project.
                </p>

                <div className="text-center">
                  <Link href="/" className="nl-pill nl-pill--primary mx-auto inline-flex">
                    Get Your Material List →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="nl-newsletter mt-10">
            <p className="nl-eyebrow">Better Together</p>
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">
              Get the full picture with a Naili estimate
            </h2>
            <p className="text-sm text-ink-500 max-w-md mx-auto mb-4">
              Upload a photo, enter your ZIP, and Naili generates a complete estimate with material list, project brief, and design concepts.
            </p>
            <Link href="/" className="nl-pill nl-pill--primary mx-auto inline-flex">
              Start Your Estimate
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-ink-500 hover:text-ink transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
