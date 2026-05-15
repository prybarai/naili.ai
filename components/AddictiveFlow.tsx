'use client';

import {
  Camera,
  Sparkles,
  Palette,
  DollarSign,
  ShoppingCart,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    num: '01',
    icon: Camera,
    title: 'Upload a photo',
    body: 'Snap a picture of any room, exterior, or space you want to improve.',
    accent: 'from-sand/20 to-sand/5',
    iconColor: 'text-sand-dark',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'AI analyzes your space',
    body: 'Our AI identifies materials, dimensions, condition, and style — then builds your plan.',
    accent: 'from-mint/20 to-mint/5',
    iconColor: 'text-[#5BA88C]',
  },
  {
    num: '03',
    icon: Palette,
    title: 'See design concepts',
    body: 'Get AI-generated before/after visuals showing what your space could look like.',
    accent: 'from-[#C4B5FD]/20 to-[#C4B5FD]/5',
    iconColor: 'text-[#7C3AED]',
  },
  {
    num: '04',
    icon: DollarSign,
    title: 'Get a cost estimate',
    body: 'Localized pricing based on your ZIP code, quality tier, and project scope.',
    accent: 'from-[#86EFAC]/20 to-[#86EFAC]/5',
    iconColor: 'text-[#16A34A]',
  },
  {
    num: '05',
    icon: ShoppingCart,
    title: 'Shop your materials',
    body: 'Real products with real prices and direct links to Home Depot, Lowe\'s, and Amazon.',
    accent: 'from-[#FCA5A5]/20 to-[#FCA5A5]/5',
    iconColor: 'text-[#DC2626]',
  },
  {
    num: '06',
    icon: FileCheck,
    title: 'Share or hire',
    body: 'Send your plan to a spouse, share with a contractor, or DIY with the full materials list.',
    accent: 'from-[#93C5FD]/20 to-[#93C5FD]/5',
    iconColor: 'text-[#2563EB]',
  },
];

export default function AddictiveFlow() {
  return (
    <section id="how-it-works" className="section relative">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-panel bg-canvas-50/80 px-4 py-2">
            <Sparkles className="h-4 w-4 text-sand-dark" />
            <span className="text-sm font-semibold text-ink-600">How it works</span>
          </div>
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl lg:text-5xl">
            From photo to plan in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">
            Six steps. One photo. A complete renovation plan you can act on today.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(({ num, icon: Icon, title, body, accent, iconColor }) => (
            <div
              key={num}
              className="group relative overflow-hidden rounded-[1.5rem] border border-hairline bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity group-hover:opacity-100`} />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas-50 border border-hairline shadow-sm">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                  <span className="font-display text-3xl font-light text-ink/10">{num}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-600">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="#upload"
            className="btn-primary inline-flex items-center text-base !py-4 !px-8"
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
