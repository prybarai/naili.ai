'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, Sparkles, DollarSign, FileText, Palette } from 'lucide-react';

/* ── Before / After showcase pairs ── */
const SHOWCASE_PAIRS = [
  {
    label: 'Kitchen Refresh',
    before: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&h=400&fit=crop',
  },
  {
    label: 'Bathroom Remodel',
    before: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&h=400&fit=crop',
  },
  {
    label: 'Outdoor Living',
    before: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  },
];

const RESULTS = [
  { icon: Palette, label: 'AI design concepts', value: 'Personalized' },
  { icon: DollarSign, label: 'Cost estimate', value: 'Localized' },
  { icon: FileText, label: 'Materials list', value: 'Shoppable' },
];

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowAfter(false);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % SHOWCASE_PAIRS.length);
        setTimeout(() => setShowAfter(true), 400);
      }, 300);
    }, 5000);
    setTimeout(() => setShowAfter(true), 800);
    return () => clearInterval(timer);
  }, []);

  const pair = SHOWCASE_PAIRS[activeIdx];

  return (
    <section className="relative overflow-hidden pb-8 pt-24 md:pb-16 md:pt-32">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-b from-sand/20 via-mint/10 to-transparent blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-panel bg-canvas-50/80 px-4 py-2 backdrop-blur-sm">
              <div className="ai-pulse" />
              <span className="text-sm font-semibold text-ink-600">AI-powered renovation planning</span>
            </div>

            <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
              Snap a photo.
              <br />
              <span className="text-signature">Get a complete plan.</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-ink-600 md:text-xl">
              Upload a photo of any room or space. Naili gives you AI design concepts,
              a localized cost estimate, and a shoppable materials list — in minutes.
            </p>

            {/* What you get */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {RESULTS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-hairline bg-white/80 p-3.5 text-center shadow-sm backdrop-blur-sm">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-sand-dark" />
                  <div className="text-xs font-bold uppercase tracking-wider text-ink">{value}</div>
                  <div className="mt-0.5 text-[11px] text-ink-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#upload"
                className="btn-primary justify-center text-base !py-4 !px-8"
              >
                <Camera className="h-5 w-5" />
                Upload your photo
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#how-it-works" className="btn-ghost justify-center">
                See how it works
              </Link>
            </div>

            <p className="mt-4 text-xs text-ink-400">
              Free to start &middot; No account needed &middot; Results in minutes
            </p>
          </div>

          {/* Right — Before / After visual */}
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            {/* Floating label */}
            <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
              <div className="rounded-full border border-hairline bg-white/90 px-4 py-1.5 text-sm font-semibold text-ink shadow-soft backdrop-blur-sm">
                <Sparkles className="mr-1.5 inline h-4 w-4 text-sand-dark" />
                {pair.label}
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-hairline bg-canvas-200 shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
              {/* Before image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pair.before}
                alt={`${pair.label} before`}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* After image — slides in */}
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  showAfter ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pair.after}
                  alt={`${pair.label} after`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Before / After labels */}
              <div className="absolute bottom-4 left-4 z-10">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm transition-all duration-500 ${
                  showAfter ? 'bg-mint/90 text-ink' : 'bg-white/90 text-ink'
                }`}>
                  {showAfter ? 'After' : 'Before'}
                </span>
              </div>

              {/* Dot indicators */}
              <div className="absolute bottom-4 right-4 z-10 flex gap-1.5">
                {SHOWCASE_PAIRS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setShowAfter(false);
                      setTimeout(() => {
                        setActiveIdx(i);
                        setTimeout(() => setShowAfter(true), 400);
                      }, 300);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIdx ? 'w-6 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -bottom-4 -left-4 z-10 rounded-2xl border border-hairline bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="text-xs font-medium text-ink-500">Estimated cost</div>
              <div className="text-lg font-bold text-ink">$4,200 – $6,800</div>
            </div>
            <div className="absolute -right-4 top-1/3 z-10 rounded-2xl border border-hairline bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="text-xs font-medium text-ink-500">Materials</div>
              <div className="text-lg font-bold text-ink">12 items</div>
              <div className="text-xs text-mint font-semibold">Shop ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
