'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, Sparkles } from 'lucide-react';

/* ── Showcase images — high-quality renovation photography ── */
const SHOWCASE = [
  { label: 'Bathroom Remodel', src: '/showcase/bathroom-modern.jpg' },
  { label: 'Kitchen Refresh', src: '/showcase/kitchen-after.jpg' },
  { label: 'Outdoor Living', src: '/showcase/deck-after.jpg' },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const t = setInterval(() => setActive((i) => (i + 1) % SHOWCASE.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-graphite">
      {/* Background image carousel */}
      {SHOWCASE.map((item, i) => (
        <div
          key={item.src}
          className="absolute inset-0 transition-opacity duration-[1.2s] ease-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.label}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/70 to-graphite/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-graphite/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] items-end pb-16 pt-24 sm:pb-20 sm:pt-32 md:items-center md:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className={`mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md transition-all duration-700 ${
                loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="ai-pulse" />
              <span className="text-xs sm:text-sm font-medium text-white/80">AI-powered home renovation planning</span>
            </div>

            {/* Headline */}
            <h1
              className={`font-display text-3xl leading-[1.1] tracking-tight text-white transition-all delay-100 duration-700 sm:text-5xl lg:text-6xl xl:text-7xl ${
                loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              See what your home
              <br />
              <span className="bg-gradient-to-r from-sand-light via-sand to-mint bg-clip-text text-transparent">
                could become.
              </span>
            </h1>

            {/* Subhead */}
            <p
              className={`mt-4 sm:mt-6 max-w-lg text-base leading-relaxed text-white/70 transition-all delay-200 duration-700 sm:text-lg md:text-xl ${
                loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              Upload a photo of any room or space. Get AI design concepts, a localized
              cost estimate, and a real materials list you can shop or hand to a contractor.
            </p>

            {/* CTA row */}
            <div
              className={`mt-6 sm:mt-8 flex flex-col gap-3 transition-all delay-300 duration-700 sm:flex-row ${
                loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <Link
                href="#upload"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3.5 sm:px-7 sm:py-4 text-base font-semibold text-graphite shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] active:scale-95"
              >
                <Camera className="h-5 w-5" />
                Upload your photo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 sm:py-4 text-base font-medium text-white/90 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/5 active:scale-95"
              >
                See how it works
              </Link>
            </div>

            {/* Trust line */}
            <p
              className={`mt-4 sm:mt-6 text-xs sm:text-sm text-white/40 transition-all delay-[400ms] duration-700 ${
                loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              Free to start &middot; No account needed &middot; Results in minutes
            </p>
          </div>

          {/* Floating stat cards */}
          <div
            className={`absolute bottom-24 right-10 hidden flex-col gap-3 transition-all delay-500 duration-1000 lg:flex ${
              loaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-xl">
              <div className="text-xs font-medium text-white/50">Estimated cost</div>
              <div className="text-xl font-bold text-white">$4,200 – $6,800</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-xl">
              <div className="text-xs font-medium text-white/50">Materials list</div>
              <div className="text-lg font-bold text-white">12 items</div>
              <div className="text-xs font-semibold text-mint">Ready to shop</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image indicator dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SHOWCASE.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === active ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
