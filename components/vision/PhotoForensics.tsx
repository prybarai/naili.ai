'use client';

import { CheckCircle2, HelpCircle, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface DetectedFeature {
  label: string;
  value: string;
  confidence: number; // 0-100
  category?: 'finish' | 'condition' | 'structure' | 'material';
}

interface Props {
  uploadedImageUrl?: string | null;
  conceptImageUrl?: string | null;
  features: DetectedFeature[];
  projectCategory?: string;
}

const CATEGORY_ORDER: Record<string, number> = {
  structure: 0,
  finish: 1,
  material: 2,
  condition: 3,
};

function confidenceColor(confidence: number) {
  if (confidence >= 85) return 'green';
  if (confidence >= 65) return 'amber';
  return 'gray';
}

function confidenceBar(confidence: number) {
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-canvas-200 sm:w-24">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700',
          confidence >= 85
            ? 'bg-mint'
            : confidence >= 65
              ? 'bg-sand-dark'
              : 'bg-ink-500/40'
        )}
        style={{ width: `${confidence}%` }}
      />
    </div>
  );
}

export default function PhotoForensics({
  uploadedImageUrl,
  conceptImageUrl,
  features,
  projectCategory,
}: Props) {
  const sortedFeatures = [...features].sort(
    (a, b) =>
      (CATEGORY_ORDER[a.category ?? 'finish'] ?? 99) -
      (CATEGORY_ORDER[b.category ?? 'finish'] ?? 99)
  );

  return (
    <div className="space-y-6">
      {/* Side-by-side images */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-[1.5rem] border border-hairline bg-canvas-50 shadow-soft">
          <div className="relative aspect-[4/3] bg-canvas-200">
            {uploadedImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={uploadedImageUrl}
                alt="Your space"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-400">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="border-t border-hairline px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            Your photo
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-hairline bg-canvas-50 shadow-soft">
          <div className="relative aspect-[4/3] bg-graphite">
            {conceptImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conceptImageUrl}
                alt="Design concept"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-400">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="border-t border-hairline px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
            Design concept
          </div>
        </div>
      </div>

      {/* Detected features */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-500">
            Detected features
          </h3>
          <Badge variant="blue">
            {features.length} features detected
          </Badge>
        </div>

        <div className="space-y-2">
          {sortedFeatures.map((feature, index) => (
            <div
              key={`${feature.label}-${index}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-canvas-50 px-4 py-3 shadow-soft transition-all hover:bg-canvas-200/50"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {feature.confidence >= 85 ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-mint" />
                ) : (
                  <HelpCircle className="h-4 w-4 flex-shrink-0 text-sand-dark" />
                )}
                <div className="min-w-0">
                  <span className="text-sm font-medium text-ink">
                    {feature.label}
                  </span>
                  <span className="ml-1.5 text-sm text-ink-500">
                    {feature.value}
                  </span>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {confidenceBar(feature.confidence)}
                <Badge
                  variant={confidenceColor(feature.confidence)}
                  className="min-w-[48px] text-center"
                >
                  {feature.confidence}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {projectCategory && (
        <div className="rounded-2xl bg-canvas-200/70 px-4 py-3 text-xs text-ink-500">
          Detected project type: <span className="font-semibold text-ink">{projectCategory}</span>
        </div>
      )}
    </div>
  );
}
