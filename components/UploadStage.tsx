"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Sparkles, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function UploadStage() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    if (!zipCode.trim() || zipCode.trim().length !== 5) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    router.push(`/vision/start?zip=${encodeURIComponent(zipCode.trim())}`);
  };

  return (
    <section id="upload" className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-light/20">
          <Sparkles className="h-7 w-7 text-sand-dark" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Get a real renovation plan in seconds
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">
          Upload a photo, tell us what you want to do, and naili builds your cost range, materials list, contractor brief, and design concept — all from one page.
        </p>

        <div className="mx-auto mt-8 max-w-md">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{5}"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                placeholder="Enter your ZIP code"
                maxLength={5}
                className="w-full rounded-xl border border-panel bg-canvas-50 py-3 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-sand-dark focus:outline-none focus:ring-1 focus:ring-sand-dark"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
            <Button size="lg" onClick={handleStart} disabled={zipCode.length !== 5}>
              Go <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-left text-sm text-red-600">{error}</p>
          )}
          <p className="mt-3 text-xs text-slate-400">
            We use your ZIP for local pricing. No spam, no sharing.
          </p>
        </div>
      </div>
    </section>
  );
}
