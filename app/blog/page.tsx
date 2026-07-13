import type { Metadata } from "next";
import Link from "next/link";
import { COST_GUIDES } from "@/lib/costGuides";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Renovation Cost Guides — Naili",
  description: "Practical, data-backed guides to help you plan your kitchen, bathroom, deck, roof, and interior painting projects with realistic budgets.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: { url: absoluteUrl("/blog") },
};

export default function BlogIndex() {
  return (
    <>
      <div className="relative min-h-screen overflow-x-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <p className="nl-eyebrow text-center">Renovation Guides</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-ink mb-2">Renovation Cost Guides</h1>
          <p className="text-center text-ink-500 max-w-lg mx-auto mb-12">
            Practical, data-backed breakdowns of what common home projects really cost — and how to compare contractor quotes with confidence.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {COST_GUIDES.map((guide) => (
              <Link key={guide.slug} href={`/blog/${guide.slug}`} className="nl-card group block">
                <div className="flex flex-col h-full">
                  <div className="mb-3 flex items-center gap-2 text-xs text-ink-400">
                    <span className="font-mono uppercase tracking-wider">{guide.publishedAt}</span>
                    <span className="w-px h-3 bg-ink/10" />
                    <span>{guide.ranges.length} budget ranges</span>
                  </div>
                  <h2 className="text-lg font-bold text-ink mb-2 group-hover:text-sand-dark transition-colors">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-ink-500 leading-relaxed flex-1">
                    {guide.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-sand-dark transition-colors">
                    Read the guide
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="nl-newsletter mt-12">
            <p className="nl-eyebrow">Coming Soon</p>
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">More guides in progress</h2>
            <p className="text-sm text-ink-500 max-w-md mx-auto mb-4">
              We&apos;re building guides on flooring costs, landscaping budgets, basement finishing, HVAC replacement, window installation, and more.
            </p>
            <p className="text-sm text-ink-400">Get notified when new guides drop — enter your email above to stay in the loop.</p>
          </div>

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
