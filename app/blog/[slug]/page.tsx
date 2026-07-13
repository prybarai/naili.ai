import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { COST_GUIDE_MAP, type CostGuide } from "@/lib/costGuides";
import { absoluteUrl } from "@/lib/site";

/* ── Static param generation ── */
export function generateStaticParams() {
  return Object.keys(COST_GUIDE_MAP).map((slug) => ({ slug }));
}

/* ── Metadata ── */
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = COST_GUIDE_MAP[params.slug];
  if (!guide) return {};
  return {
    title: `${guide.title} | Naili`,
    description: guide.description,
    alternates: { canonical: absoluteUrl(`/blog/${guide.slug}`) },
    openGraph: {
      url: absoluteUrl(`/blog/${guide.slug}`),
      title: guide.title,
      description: guide.description,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

/* ── Page Component ── */
export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = COST_GUIDE_MAP[params.slug];
  if (!guide) notFound();

  return (
    <>
      <GuideJsonLd guide={guide} />
      <div className="relative min-h-screen overflow-x-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-ink-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-ink transition-colors">Guides</Link>
            <span>/</span>
            <span className="text-ink-600 font-medium truncate max-w-[200px]">{guide.title}</span>
          </nav>

          {/* Header */}
          <p className="nl-eyebrow">Cost Guide</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4">{guide.title}</h1>
          <p className="text-base text-ink-500 leading-relaxed mb-2">{guide.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-400 mb-8">
            <span>Published {guide.publishedAt}</span>
            <span className="w-px h-3 bg-ink/10" />
            <span>Updated {guide.updatedAt}</span>
            <span className="w-px h-3 bg-ink/10" />
            <span>{guide.author.name}</span>
          </div>

          {/* Intro paragraphs */}
          {guide.intro.map((paragraph, i) => (
            <p key={i} className="text-sm sm:text-base text-ink-600 leading-relaxed mb-4">{paragraph}</p>
          ))}

          {/* Budget Ranges */}
          <div className="nl-card--elevated p-6 sm:p-8 my-8">
            <h2 className="text-xl font-bold text-ink mb-4">Planning Budget Ranges</h2>
            <div className="space-y-4">
              {guide.ranges.map((range, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-semibold text-ink">{range.label}</span>
                    <span className="text-lg font-bold nl-gradient-text">{range.range}</span>
                  </div>
                  <p className="text-sm text-ink-500">{range.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Factors */}
          {guide.budgetFactors && guide.budgetFactors.length > 0 && (
            <div className="my-8">
              <h2 className="text-xl font-bold text-ink mb-4">What Moves the Budget</h2>
              <div className="space-y-3">
                {guide.budgetFactors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-3 nl-card">
                    <span className="text-sm font-bold text-sand-dark mt-0.5">
                      {factor.impact === 'High' ? '🔴' : '🟡'}
                    </span>
                    <div>
                      <span className="font-semibold text-ink">{factor.item}</span>
                      <span className="text-xs text-ink-400 ml-2">({factor.impact} impact)</span>
                      <p className="text-sm text-ink-500 mt-0.5">{factor.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quote Checklist */}
          {guide.quoteChecklist && guide.quoteChecklist.length > 0 && (
            <div className="my-8 p-6 sm:p-8 rounded-[1.5rem] border border-sand/30 bg-gradient-to-br from-sand/5 to-amber-50/50">
              <h2 className="text-xl font-bold text-ink mb-4">✓ Quote Comparison Checklist</h2>
              <ul className="space-y-3">
                {guide.quoteChecklist.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink-600">
                    <span className="text-mint font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Naili CTA */}
          <div className="nl-card--elevated p-6 sm:p-8 my-8 text-center">
            <p className="text-lg font-bold text-ink mb-2">Get a custom estimate for your actual space</p>
            <p className="text-sm text-ink-500 mb-4 max-w-lg mx-auto">
              Upload a photo, enter your ZIP code, and Naili will build a detailed estimate, material list, and design concepts for your specific project.
            </p>
            <Link href="/" className="nl-pill nl-pill--primary mx-auto inline-flex">
              Start your estimate →
            </Link>
          </div>

          {/* Section Content */}
          {guide.sections.map((section, i) => (
            <div key={i} className="my-10">
              <h2 className="text-xl font-bold text-ink mb-4">{section.heading}</h2>
              {section.paragraphs.map((para, j) => (
                <p key={j} className="text-sm sm:text-base text-ink-600 leading-relaxed mb-4">{para}</p>
              ))}
            </div>
          ))}

          {/* FAQ Section */}
          {guide.faqs && guide.faqs.length > 0 && (
            <div className="my-10">
              <h2 className="text-xl font-bold text-ink mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {guide.faqs.map((faq, i) => (
                  <details key={i} className="nl-card group cursor-pointer [&[open]]:border-sand/30">
                    <summary className="font-semibold text-ink text-sm flex items-center justify-between [&::-webkit-details-marker]:hidden">
                      <span>{faq.question}</span>
                      <span className="text-sand-dark text-lg transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-ink-500 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {guide.sources && guide.sources.length > 0 && (
            <div className="my-10">
              <h2 className="text-sm font-bold text-ink mb-3 font-mono uppercase tracking-wider">Sources & References</h2>
              <div className="space-y-2">
                {guide.sources.map((source, i) => (
                  <p key={i} className="text-xs text-ink-400">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink transition-colors">
                      {source.label}
                    </a>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Footer nav */}
          <div className="mt-12 pt-8 border-t hairline">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <Link href="/blog" className="text-sm text-ink-500 hover:text-ink transition-colors">
                ← All guides
              </Link>
              <Link href="/" className="text-sm text-ink-500 hover:text-ink transition-colors">
                Back to Naili →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── JSON-LD Schema ── */
function GuideJsonLd({ guide }: { guide: CostGuide }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: { "@type": "Organization", name: guide.author.name },
    url: absoluteUrl(`/blog/${guide.slug}`),
  };
  return (
    <Script
      id="ld-json"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
