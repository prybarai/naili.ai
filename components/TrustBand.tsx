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
    <section className="relative bg-graphite py-14 md:py-16">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-blueprint-dark bg-[length:48px_48px] opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {STATS.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/5">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold text-white md:text-3xl">{value}</div>
              <div className="mt-1 text-sm text-white/50">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
