"use client";

import BulletproofUploadFlow from "@/components/BulletproofUploadFlow";

export default function UploadStage() {
  return (
    <section id="upload" className="relative bg-canvas py-16 md:py-24">
      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[80%] -translate-x-1/2 bg-radial-warm opacity-60" />
      <BulletproofUploadFlow />
    </section>
  );
}
