'use client';

import { Camera, DollarSign, ShoppingCart, Star } from 'lucide-react';

const STATS = [
  { icon: Camera, value: '10,000+', label: 'Spaces analyzed', color: 'text-sand' },
  { icon: DollarSign, value: '$2.4M+', label: 'In project estimates', color: 'text-mint' },
  { icon: ShoppingCart, value: '50,000+', label: 'Materials sourced', color: 'text-sand-light' },
  { icon: Star, value: '4.8 / 5', label: 'User satisfaction', color: 'text-mint-glow' },
];

export default function TrustBand() {
  return (
    <section className="relative bg-graphite py-10 sm:py-14 md:py-16">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-blueprint-dark bg-[length:48px_48px] opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 md:gap-6">
          {STATS.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center">
              <div className="mx-auto mb-2 sm:mb-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/8 bg-white/5">
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
              </div>
              <div className="text-xl font-bold text-white sm:text-2xl md:text-3xl">{value}</div>
              <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/50">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
