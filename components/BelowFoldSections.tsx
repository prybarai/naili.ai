'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import ProjectCounter from '@/components/ProjectCounter';
import posthog from 'posthog-js';

/* ─────────────────────────────────────────────────────────────
   Below-fold sections: How It Works, Stats, Features, 
   Testimonials, Guides, Newsletter
   ───────────────────────────────────────────────────────────── */
export default function BelowFoldSections() {
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  return (
    <>
      {/* ═══════════ HOW IT WORKS — Numbered steps ═══════════ */}
      <div className="nl-section pb-8">
        <p className="nl-eyebrow text-center">How It Works</p>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-ink mb-8">
          From photo to renovation plan in minutes
        </h2>
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            { step: '1', emoji: '📸', title: 'Upload a Photo', desc: 'Snap a picture of the room or outdoor space.' },
            { step: '2', emoji: '🎯', title: 'Choose Your Scope', desc: 'Tell us your ZIP, style, and quality level.' },
            { step: '3', emoji: '🤖', title: 'AI Analyzes Everything', desc: 'Naili estimates costs, lists materials, and generates concepts.' },
            { step: '4', emoji: '📋', title: 'Get Your Plan', desc: 'Full estimate + materials + design concepts in one page.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="nl-step mx-auto">{item.step}</div>
              <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
              <p className="text-sm text-ink-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative section break */}
      <div className="nl-image-break">
        <div className="h-48 sm:h-56 bg-gradient-to-r from-sand/10 via-sand-light/20 to-mint/10 rounded-[2rem] flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl block mb-2">🏠</span>
            <p className="text-sm text-ink-400 italic">Your renovation, visualized</p>
          </div>
        </div>
      </div>

      {/* ═══════════ STATS — Gradient text ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="nl-stat">
          <div className="nl-gradient-text nl-stat__value">50+</div>
          <p className="nl-stat__label">Project Categories</p>
        </div>
        <ProjectCounter />
        <div className="nl-stat">
          <div className="nl-gradient-text nl-stat__value">Free</div>
          <p className="nl-stat__label">To Get Started</p>
        </div>
        <div className="nl-stat">
          <div className="nl-gradient-text nl-stat__value">Real</div>
          <p className="nl-stat__label">Local Pricing</p>
        </div>
      </div>

      {/* ═══════════ FEATURES — Card grid ═══════════ */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { emoji: '🧠', title: 'Smart Cost Engine', desc: 'Real, data-backed estimates for any renovation — not generic averages. Powered by local pricing across 50+ categories.' },
          { emoji: '🎨', title: 'Design Concepts', desc: 'See AI-generated before-and-after concepts of your specific space. Visualize your dream renovation before spending a dime.' },
          { emoji: '📦', title: 'Materials & Brief', desc: 'Get a complete project brief with material list, step-by-step scope, and everything you need to hire or DIY.' },
        ].map((card) => (
          <div key={card.title} className="nl-card text-center">
            <div className="text-3xl mb-3">{card.emoji}</div>
            <h3 className="font-bold text-ink mb-1">{card.title}</h3>
            <p className="text-sm text-ink-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* ═══════════ TESTIMONIALS — From our community ═══════════ */}
      <div className="mb-12">
        <p className="nl-eyebrow text-center">From our community</p>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-ink mb-2">Homeowners trust Naili</h2>
        <p className="text-center text-sm text-ink-500 mb-8 max-w-lg mx-auto">Real estimates from real people planning their next project.</p>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              quote: 'Naili saved me hours of research. The estimate was within $500 of what I actually paid for my kitchen refresh.',
              name: 'Sarah M.', location: 'Denver, CO', project: 'Kitchen Refresh',
            },
            {
              quote: 'The AI-generated before/after concepts helped me visualize exactly what my kitchen would look like. I knew what I wanted before talking to any contractor.',
              name: 'James K.', location: 'Austin, TX', project: 'Kitchen Remodel',
            },
            {
              quote: 'As a contractor, I love that every lead comes with a full scope of work. No more guessing games — just clear, detailed project briefs from day one.',
              name: 'Mike R.', location: 'Columbus, OH', project: 'Contractor Partner',
            },
          ].map((t) => (
            <div key={t.name} className="rounded-[1.5rem] border border-hairline bg-canvas-50 p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
              <div className="mb-3 flex items-center gap-0.5">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-ink-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 border-t border-hairline pt-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sand-light/40 to-amber-50 text-xs font-bold text-ink">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-400">{t.location} &middot; {t.project}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ GUIDES — Zone cards linking to blog ═══════════ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div><p className="nl-eyebrow">Renovation Guides</p><h2 className="font-bold text-lg text-ink">What you need to know</h2></div>
          <Link href="/blog" className="text-xs text-ink-500 hover:text-ink transition-colors">View all 15+ guides →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { slug: 'kitchen-remodel-cost', name: 'Kitchen Renovation Costs', desc: 'What to expect for a full kitchen remodel in 2026 — from budget to premium.' },
            { slug: 'bathroom-remodel-cost', name: 'Bathroom Remodel Guide', desc: 'Step-by-step walkthrough of a bathroom renovation.' },
            { slug: 'flooring-cost', name: 'Flooring Cost Guide', desc: 'Hardwood, tile, LVP, and carpet — what each costs per square foot.' },
            { slug: 'roof-replacement-cost', name: 'Roof Replacement Costs', desc: 'Asphalt, metal, tile — what a new roof costs for your home.' },
            { slug: 'hvac-replacement-cost', name: 'HVAC Replacement Budget', desc: 'Furnace, AC, heat pump — complete system pricing and lifespan.' },
            { slug: 'basement-finishing-cost', name: 'Basement Finishing Guide', desc: 'Waterproofing, finishing, and adding living space below grade.' },
          ].map((guide) => (
            <Link key={guide.slug} href={`/blog/${guide.slug}`} className="nl-zone">
              <div className="nl-zone__name">{guide.name}</div>
              <p className="text-sm text-ink-500">{guide.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════ CALCULATORS + CITY GUIDES ═══════════ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div><p className="nl-eyebrow">Free Tools</p><h2 className="font-bold text-lg text-ink">Renovation calculators & city guides</h2></div>
          <Link href="/calculators" className="text-xs text-ink-500 hover:text-ink transition-colors">Try calculators →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/calculators" className="nl-zone">
            <div className="nl-zone__name">💰 Quick Cost Estimator</div>
            <p className="text-sm text-ink-500">Ballpark any renovation by category, square footage, and quality level.</p>
          </Link>
          <Link href="/calculators" className="nl-zone">
            <div className="nl-zone__name">📈 ROI Calculator</div>
            <p className="text-sm text-ink-500">See typical resale value recoup rates for kitchens, baths, roofing, and more.</p>
          </Link>
          <Link href="/cities" className="nl-zone">
            <div className="nl-zone__name">🏙️ City Cost Guides</div>
            <p className="text-sm text-ink-500">Local pricing for 50 US cities — NYC to LA, Chicago to Houston.</p>
          </Link>
        </div>
      </div>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <div className="nl-newsletter mb-8">
        <p className="nl-eyebrow">Stay Updated</p>
        <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">Renovation tips, straight to your inbox</h2>
        <p className="text-sm text-ink-500 max-w-md mx-auto mb-6">Get monthly cost trends, project ideas, and pro tips — free.</p>
        {newsletterSubmitted ? (
          <div className="flex items-center justify-center gap-2 text-sm text-mint font-semibold">
            <CheckCircle2 className="h-4 w-4" /> You&apos;re subscribed!
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = (e.target as HTMLFormElement).email?.value;
            if (email) { posthog.capture('naili_newsletter_signup', { email }); setNewsletterSubmitted(true); setShowNewsletterForm(false); }
          }}>
            {showNewsletterForm ? (
              <div className="flex gap-2 max-w-sm mx-auto flex-wrap justify-center">
                <input type="email" name="email" placeholder="your@email.com" required className="flex-1 min-w-[200px] rounded-full border border-panel bg-canvas px-4 py-2.5 text-sm text-ink outline-none focus:border-sand focus:ring-2 focus:ring-sand/20" />
                <button type="submit" className="rounded-full bg-ink text-canvas-50 px-5 py-2.5 text-sm font-semibold transition hover:opacity-90">Subscribe</button>
              </div>
            ) : (
              <button onClick={() => setShowNewsletterForm(true)} className="rounded-full bg-ink text-canvas-50 px-6 py-2.5 text-sm font-semibold transition hover:opacity-90">
                Join the list
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
}
