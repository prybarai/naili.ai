'use client';

import { cn } from '@/lib/utils';
import type { IntelligenceReport as IntelligenceReportType } from '@/types';

interface Props {
  report: IntelligenceReportType | null;
}

const sections: Array<{
  key: keyof Omit<IntelligenceReportType, 'id' | 'project_id' | 'created_at'>;
  emoji: string;
  title: string;
  gradient: string;
}> = [
  { key: 'local_market_summary', emoji: '\u{1F3D8}\uFE0F', title: 'Local Market', gradient: 'from-indigo-50 to-blue-50' },
  { key: 'comparable_sales_impact', emoji: '\u{1F4C8}', title: 'Resale Impact', gradient: 'from-emerald-50 to-teal-50' },
  { key: 'contractor_density_note', emoji: '\u{1F477}', title: 'Contractor Availability', gradient: 'from-amber-50 to-yellow-50' },
  { key: 'permit_timeline_note', emoji: '\u{1F4C4}', title: 'Permits', gradient: 'from-violet-50 to-purple-50' },
  { key: 'seasonal_pricing_note', emoji: '\u{1F4C5}', title: 'Best Time', gradient: 'from-rose-50 to-pink-50' },
  { key: 'material_availability_note', emoji: '\u{1F4E6}', title: 'Material Supply', gradient: 'from-cyan-50 to-sky-50' },
];

export default function IntelligenceReport({ report }: Props) {
  if (!report) {
    return (
      <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <span className="text-lg">{'\u{1F50D}'}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">Market Intelligence</h2>
            <p className="text-sm text-ink-400">Local pricing &amp; market context</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-200 opacity-75" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <span className="text-lg">{'\u{1F50D}'}</span>
            </div>
          </div>
          <p className="text-sm font-medium text-ink-500">Loading intelligence...</p>
          <p className="text-xs text-ink-400">Analyzing local market data for your area</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-hairline bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <span className="text-lg">{'\u{1F50D}'}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Market Intelligence</h2>
          <p className="text-sm text-ink-400">Local pricing, permits &amp; seasonal context</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const text = report[section.key] as string;
          return (
            <div
              key={section.key}
              className={cn(
                'rounded-xl border border-hairline bg-gradient-to-br p-4 transition-shadow hover:shadow-soft',
                section.gradient
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">{section.emoji}</span>
                <h3 className="text-sm font-bold text-ink">{section.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-ink-600">{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
