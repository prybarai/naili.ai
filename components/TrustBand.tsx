'use client';

import { Camera, DollarSign, ShoppingCart, Users } from 'lucide-react';

const STATS = [
  { icon: Camera, value: '10,000+', label: 'Photos analyzed' },
  { icon: DollarSign, value: '$2.4M+', label: 'In project estimates' },
  { icon: ShoppingCart, value: '50,000+', label: 'Materials sourced' },
  { icon: Users, value: '4.8/5', label: 'User satisfaction' },
];

export default function TrustBand() {
  return (
    <section className="border-y border-hairline bg-white/60 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-5">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-sand-dark" />
              <div className="text-2xl font-bold text-ink md:text-3xl">{value}</div>
              <div className="mt-1 text-sm text-ink-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
