'use client';

import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Hammer,
  HardHat,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { formatCurrencyRange } from '@/lib/utils';
import type { MaterialList, MaterialLineItem } from '@/types';

interface Props {
  materials: MaterialList;
}

/* ── Humanize legacy material names ── */

function humanizeItemName(item: MaterialLineItem): string {
  const name = item.item || '';
  // Clean up internal style tokens from item names
  let cleaned = name
    .replace(/\bwarm_natural\b/gi, '')
    .replace(/\bcool_modern\b/gi, '')
    .replace(/\bclassic_traditional\b/gi, '')
    .replace(/\bminimalist_clean\b/gi, '')
    .replace(/\bbold_dramatic\b/gi, '')
    .replace(/\bcoastal_relaxed\b/gi, '')
    .replace(/\brusstic_farmhouse\b/gi, '')
    .replace(/\bmid_century\b/gi, '')
    .trim();

  // Map generic "allowance" names to friendly labels
  const lc = cleaned.toLowerCase();
  if (/primary materials? allowance/i.test(lc)) return 'Primary Materials — Fixtures, Tile & Surfaces';
  if (/finish.*(material|facing).*allowance/i.test(lc) || /finish-facing/i.test(lc)) return 'Finish Materials — Hardware, Mirrors & Accessories';
  if (/bathroom labor allowance/i.test(lc)) return 'Professional Labor — Plumbing, Tile & Install';
  if (/kitchen labor allowance/i.test(lc)) return 'Professional Labor — Plumbing, Electrical & Install';
  if (/labor allowance/i.test(lc)) return 'Professional Labor';
  if (/protection.*prep.*demo/i.test(lc)) return 'Prep & Demo — Protection, Removal & Haul-Away';
  if (/miscellaneous.*allowance.*closeout/i.test(lc)) return 'Permits, Inspections & Closeout';
  if (/miscellaneous/i.test(lc) && /allowance/i.test(lc)) return 'Permits & Miscellaneous';
  if (/demo(lition)? allowance/i.test(lc)) return 'Demolition & Removal';
  if (/permit/i.test(lc) && /allowance/i.test(lc)) return 'Permits & Inspections';
  if (/contingency/i.test(lc)) return 'Contingency Reserve';

  // If it still has "allowance" in it, clean it up
  if (/allowance/i.test(cleaned)) {
    cleaned = cleaned.replace(/\s*allowance\s*/gi, ' ').trim();
    // Title case
    cleaned = cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
    return cleaned || name;
  }

  return cleaned || name;
}

function humanizeUnit(item: MaterialLineItem): string {
  const unit = item.unit || '';
  const lc = (item.item || '').toLowerCase();
  // Replace "lot" with more meaningful units based on category
  if (unit === 'lot' || unit === '1 lot') {
    if (/labor/i.test(lc)) return 'project';
    if (/permit/i.test(lc) || /misc/i.test(lc) || /closeout/i.test(lc)) return 'project';
    if (/demo/i.test(lc) || /prep/i.test(lc) || /protection/i.test(lc)) return 'project';
    return 'package';
  }
  return unit;
}

function humanizeInstallNote(item: MaterialLineItem): string {
  const note = item.install_note || item.sourcing_notes || '';
  if (!note) {
    // Generate a helpful note based on the item type
    const lc = (item.item || '').toLowerCase();
    if (/labor/i.test(lc)) return 'Includes skilled trade labor for installation. Get at least 2-3 contractor quotes to compare.';
    if (/demo/i.test(lc) || /prep/i.test(lc)) return 'Covers protection of adjacent areas, careful demolition, and debris removal.';
    if (/permit/i.test(lc) || /misc/i.test(lc)) return 'Covers building permits, inspections, and project closeout. Requirements vary by municipality.';
    if (/primary material/i.test(lc)) return 'Core materials like tile, fixtures, and surfaces. Final selections should be made in person at a showroom.';
    if (/finish/i.test(lc)) return 'Finishing touches like hardware, mirrors, and accessories. These are easy to DIY.';
    return 'Confirm exact specifications and quantities with your contractor before ordering.';
  }
  // Clean up the generic "Confirm exact trade scope..." note
  if (/confirm exact trade scope/i.test(note)) {
    const lc = (item.item || '').toLowerCase();
    if (/labor/i.test(lc)) return 'Includes skilled trade labor. Get 2-3 quotes from licensed contractors.';
    if (/demo/i.test(lc) || /prep/i.test(lc)) return 'Covers protection, demolition, and haul-away. Scope may change once walls are opened.';
    if (/permit/i.test(lc) || /misc/i.test(lc)) return 'Permit requirements vary by city. Check with your local building department.';
    if (/primary material/i.test(lc)) return 'Visit a showroom to finalize tile, fixture, and surface selections before ordering.';
    if (/finish/i.test(lc)) return 'Hardware and accessories are easy to swap — pick what you love.';
    return 'Confirm specifications and quantities with your contractor before ordering.';
  }
  return note;
}

/* ── Retailer color coding ── */

function retailerColor(name?: string) {
  if (!name) return 'bg-canvas-200 text-ink-600';
  const n = name.toLowerCase();
  if (n.includes('home depot')) return 'bg-[#F96302]/10 text-[#F96302]';
  if (n.includes('lowe')) return 'bg-[#004990]/10 text-[#004990]';
  if (n.includes('amazon')) return 'bg-[#FF9900]/10 text-[#232F3E]';
  if (n.includes('build')) return 'bg-[#00A651]/10 text-[#00A651]';
  return 'bg-canvas-200 text-ink-600';
}

/* ── Category icon based on name ── */

function categoryIcon(category: string) {
  const lc = category.toLowerCase();
  if (/labor/i.test(lc)) return <HardHat className="h-5 w-5 text-sand-dark" />;
  if (/permit|misc/i.test(lc)) return <Tag className="h-5 w-5 text-sand-dark" />;
  return <ShoppingCart className="h-5 w-5 text-sand-dark" />;
}

/* ── Main Component ── */

export default function MaterialsAccordion({ materials }: Props) {
  const grouped = useMemo(
    () =>
      materials.line_items.reduce<Record<string, MaterialLineItem[]>>((acc, item) => {
        const key = item.category || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {}),
    [materials.line_items]
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.keys(grouped).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggle = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalLow = materials.line_items.reduce((s, i) => s + i.estimated_cost_low, 0);
  const totalHigh = materials.line_items.reduce((s, i) => s + i.estimated_cost_high, 0);

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-canvas-50 px-5 py-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand/15">
            <ShoppingCart className="h-5 w-5 text-sand-dark" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">{materials.line_items.length} items across {Object.keys(grouped).length} categories</div>
            <div className="text-xs text-ink-500">Estimated materials total: {formatCurrencyRange(totalLow, totalHigh)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1 text-xs font-semibold text-ink-600">
            <Hammer className="h-3.5 w-3.5" /> DIY-ready items included
          </span>
        </div>
      </div>

      {/* Category groups */}
      {Object.entries(grouped).map(([category, items]) => {
        const groupLow = items.reduce((sum, item) => sum + item.estimated_cost_low, 0);
        const groupHigh = items.reduce((sum, item) => sum + item.estimated_cost_high, 0);

        return (
          <div
            key={category}
            className="overflow-hidden rounded-[1.5rem] border border-hairline bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
          >
            <button
              onClick={() => toggle(category)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-canvas-50 sm:px-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand/10">
                  {categoryIcon(category)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-ink">{category}</div>
                  <div className="mt-1 text-sm text-ink-500">
                    {items.length} item{items.length !== 1 ? 's' : ''} &middot;{' '}
                    {formatCurrencyRange(groupLow, groupHigh)}
                  </div>
                </div>
              </div>
              {openSections[category] ? (
                <ChevronUp className="h-5 w-5 text-ink-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-ink-400" />
              )}
            </button>

            {openSections[category] && (
              <div className="grid gap-4 border-t border-hairline bg-canvas-50/70 p-5 sm:p-6 lg:grid-cols-2">
                {items.map((item, index) => {
                  const friendlyName = humanizeItemName(item);
                  const friendlyUnit = humanizeUnit(item);
                  const friendlyNote = humanizeInstallNote(item);

                  return (
                    <div
                      key={`${item.item}-${index}`}
                      className="group rounded-[1.25rem] border border-hairline bg-white p-5 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-base font-semibold text-ink leading-snug">{friendlyName}</div>
                          {item.brand && item.brand !== 'Various' && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm font-medium text-sand-dark">{item.brand}</span>
                              {item.color_finish && item.color_finish !== 'N/A' && (
                                <span className="text-xs text-ink-500">&middot; {item.color_finish}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 rounded-xl bg-[linear-gradient(135deg,rgba(216,185,138,0.12),rgba(184,216,200,0.12))] px-3 py-1.5 text-right">
                          {item.unit_price ? (
                            <>
                              <div className="text-sm font-bold text-ink">${item.unit_price.toLocaleString()}</div>
                              <div className="text-[10px] text-ink-500">per {item.unit === 'sq ft' ? 'sq ft' : 'unit'}</div>
                            </>
                          ) : (
                            <div className="text-sm font-bold text-ink">
                              {formatCurrencyRange(item.estimated_cost_low, item.estimated_cost_high)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity + total */}
                      <div className="mt-3 flex items-center gap-3 text-sm text-ink-600">
                        <span>
                          {item.quantity} {friendlyUnit}
                        </span>
                        <span className="text-ink-400">&middot;</span>
                        <span className="font-medium text-ink">
                          Total: {formatCurrencyRange(item.estimated_cost_low, item.estimated_cost_high)}
                        </span>
                      </div>

                      {/* Install / sourcing note */}
                      {friendlyNote && (
                        <p className="mt-3 rounded-xl bg-canvas-50 px-3 py-2 text-sm leading-relaxed text-ink-600">
                          {friendlyNote}
                        </p>
                      )}

                      {/* Action row */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.is_diy_friendly !== undefined && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              item.is_diy_friendly
                                ? 'bg-mint/15 text-ink-600'
                                : 'bg-sand/15 text-ink-600'
                            }`}
                          >
                            {item.is_diy_friendly ? (
                              <Hammer className="h-3.5 w-3.5" />
                            ) : (
                              <HardHat className="h-3.5 w-3.5" />
                            )}
                            {item.is_diy_friendly ? 'DIY friendly' : 'Hire a pro'}
                          </span>
                        )}

                        {item.retailer && (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${retailerColor(item.retailer)}`}>
                            <Tag className="h-3 w-3" />
                            {item.retailer}
                          </span>
                        )}

                        {item.retailer_url && (
                          <a
                            href={item.retailer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-ink px-4 py-1.5 text-xs font-semibold text-canvas-50 transition-all hover:opacity-90"
                          >
                            Shop now <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {materials.sourcing_notes && (
        <div className="rounded-[1.5rem] border border-hairline bg-white p-5 text-sm text-ink-600 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <span className="font-semibold text-ink">Shopping note:</span> {materials.sourcing_notes}
        </div>
      )}
    </div>
  );
}
