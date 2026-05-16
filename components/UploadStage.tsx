"use client";

import BulletproofUploadFlow from "@/components/BulletproofUploadFlow";

export default function UploadStage() {
  return (
    <section id="upload" className="relative overflow-hidden bg-canvas py-20 md:py-28">
      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[90%] -translate-x-1/2 bg-radial-warm opacity-70" />
      {/* Cool accent glow */}
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-mint/20 to-transparent opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-20 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-sand/15 to-transparent opacity-60 blur-3xl" />
      
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mono-label mb-3">Get started</p>
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl lg:text-5xl">
            Your renovation plan starts here
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">
            One photo is all it takes. Our AI analyzes your space and builds a complete plan with costs, materials, and design concepts.
          </p>
        </div>
        <BulletproofUploadFlow />
      </div>
    </section>
  );
}
