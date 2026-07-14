'use client';

import {
  Camera,
  Sparkles,
  Palette,
  DollarSign,
  ShoppingCart,
  Send,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    num: '01',
    icon: Camera,
    title: 'Snap a photo',
    body: 'Take a picture of any room, exterior, or space you want to transform.',
    gradient: 'from-sand/30 to-sand/5',
    iconBg: 'bg-sand/15',
    iconColor: 'text-sand-dark',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'AI reads your space',
    body: 'We detect materials, dimensions, condition, and style in seconds.',
    gradient: 'from-mint/30 to-mint/5',
    iconBg: 'bg-mint/15',
    iconColor: 'text-[#4A9B7F]',
  },
  {
    num: '03',
    icon: Palette,
    title: 'See the possibilities',
    body: 'Get AI-generated concept images showing what your space could look like.',
    gradient: 'from-[#C4B5FD]/30 to-[#C4B5FD]/5',
    iconBg: 'bg-[#C4B5FD]/15',
    iconColor: 'text-[#7C3AED]',
  },
  {
    num: '04',
    icon: DollarSign,
    title: 'Know the cost',
    body: 'Get a localized estimate based on your ZIP, quality tier, and scope.',
    gradient: 'from-[#86EFAC]/30 to-[#86EFAC]/5',
    iconBg: 'bg-[#86EFAC]/15',
    iconColor: 'text-[#16A34A]',
  },
  {
    num: '05',
    icon: ShoppingCart,
    title: 'Shop real products',
    body: 'A materials list with real brands, prices, and links to buy.',
    gradient: 'from-[#FCA5A5]/25 to-[#FCA5A5]/5',
    iconBg: 'bg-[#FCA5A5]/15',
    iconColor: 'text-[#DC2626]',
  },
  {
    num: '06',
    icon: Send,
    title: 'Share or start',
    body: 'Email to your spouse, text a contractor, or DIY with the full plan.',
    gradient: 'from-[#93C5FD]/25 to-[#93C5FD]/5',
    iconBg: 'bg-[#93C5FD]/15',
    iconColor: 'text-[#2563EB]',
  },
];

export default function AddictiveFlow() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 relative bg-canvas">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 sm:mb-16 text-center">
          <p className="mono-label mb-2 sm:mb-3">How it works</p>
          <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl md:text-4xl lg:text-5xl">
            Photo to plan in minutes
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-base sm:text-lg text-ink-600">
            One photo. Six steps. A complete renovation plan you can act on today.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(({ num, icon: Icon, title, body, gradient, iconBg, iconColor }) => (
            <div
              key={num}
              className="group relative overflow-hidden rounded-2xl sm:rounded-[1.5rem] border border-hairline bg-canvas-50 p-5 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              {/* Hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="relative flex gap-4 sm:block">
                <div className="flex-shrink-0 sm:mb-5 flex items-start sm:items-center justify-between">
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
                  </div>
                  <span className="hidden sm:block font-display text-4xl font-light text-ink/[0.06]">{num}</span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-semibold tracking-tight text-ink">{title}</h3>
                  <p className="text-sm sm:text-[15px] leading-relaxed text-ink-500">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <Link
            href="#upload"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 sm:px-8 sm:py-4 text-base font-semibold text-canvas-50 shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-95"
          >
            <Camera className="h-5 w-5" />
            Try it now — it&apos;s free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
