import type { Metadata } from "next";
import Link from "next/link";
import { COST_GUIDES_ALL } from "@/lib/costGuides";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Renovation Cost Guides — Naili",
  description: "Practical, data-backed guides to help you plan 15+ renovation projects including kitchen, bathroom, roofing, flooring, HVAC, landscaping, and more.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: { url: absoluteUrl("/blog") },
};

const categoryGroups = [
  { label: 'Interior Remodeling', slugs: ['kitchen-remodel-cost', 'bathroom-remodel-cost', 'interior-painting-cost'] },
  { label: 'Flooring & Finishes', slugs: ['flooring-cost'] },
  { label: 'Exterior & Structure', slugs: ['roof-replacement-cost', 'siding-installation-cost', 'window-replacement-cost', 'deck-build-cost'] },
  { label: 'Mechanical & Electrical', slugs: ['hvac-replacement-cost', 'electrical-wiring-cost', 'plumbing-repair-cost'] },
  { label: 'Additions & Outdoor', slugs: ['home-addition-cost', 'basement-finishing-cost', 'landscaping-budget', 'fence-installation-cost'] },
];

export default function BlogIndex() {
  // Only show guides that exist in the data
  const guideMap = new Map(COST_GUIDES_ALL.map(g => [g.slug, g]));

  return (
    <>
      <div className="relative min-h-screen overflow-x-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <p className="nl-eyebrow text-center">Renovation Guides</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-ink mb-2">Renovation Cost Guides</h1>
          <p className="text-center text-ink-500 max-w-lg mx-auto mb-6">
            Practical, data-backed breakdowns of what common home projects really cost — and how to compare contractor quotes with confidence.
          </p>

          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <Link href="/" className="nl-pill inline-flex items-center gap-2">
              Get a real estimate for your home
            </Link>
            <Link href="/calculators" className="nl-pill nl-pill--secondary inline-flex items-center gap-2">
              Try our calculators
            </Link>
            <Link href="/cities" className="nl-pill nl-pill--secondary inline-flex items-center gap-2">
              City cost guides
            </Link>
          </div>

          {categoryGroups.map((group) => {
            const groupGuides = group.slugs.map(s => guideMap.get(s)).filter(Boolean);
            if (groupGuides.length === 0) return null;
            return (
              <div key={group.label} className="mb-10">
                <h2 className="text-xl font-bold text-ink mb-4">{group.label}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupGuides.map((guide) => (
                    <Link key={guide!.slug} href={`/blog/${guide!.slug}`} className="nl-card group block">
                      <div className="flex flex-col h-full">
                        <div className="mb-3 flex items-center gap-2 text-xs text-ink-400">
                          <span className="font-mono uppercase tracking-wider">{guide!.publishedAt}</span>
                          <span className="w-px h-3 bg-ink/10" />
                          <span>{guide!.ranges.length} ranges</span>
                        </div>
                        <h3 className="text-base font-bold text-ink mb-2 group-hover:text-sand-dark transition-colors">
                          {guide!.title}
                        </h3>
                        <p className="text-xs text-ink-500 leading-relaxed flex-1">
                          {guide!.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink group-hover:text-sand-dark transition-colors">
                          Read the guide
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Count badge */}
          <p className="text-center text-xs text-ink-400 mb-10">{COST_GUIDES_ALL.length} guides published · Updated regularly</p>

          <div className="mt-8 text-center">
            <Link href="/" className="nl-pill nl-pill--secondary mx-auto inline-flex">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
