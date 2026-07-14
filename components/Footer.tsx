"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  const isPro = pathname?.startsWith("/pro");

  return (
    <footer
      className={cn(
        "relative z-10 border-t px-4 py-12 sm:px-6 sm:py-14 md:px-10",
        isPro
          ? "border-white/5 bg-graphite-800 text-white/50"
          : "border-canvas-50/10 bg-graphite text-white/50"
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* Top row */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-lg tracking-tight text-white">naili</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              AI-powered renovation planning. Upload a photo, get a real estimate, material list, and design concepts.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Product</p>
              <div className="space-y-2.5 text-sm">
                <Link href="/" className="block text-white/40 hover:text-white transition-colors">Estimate</Link>
                <Link href="/blog" className="block text-white/40 hover:text-white transition-colors">Cost Guides</Link>
                <Link href="/cities" className="block text-white/40 hover:text-white transition-colors">City Guides</Link>
                <Link href="/calculators" className="block text-white/40 hover:text-white transition-colors">Calculators</Link>
                <Link href="/pro" className="block text-white/40 hover:text-white transition-colors">For Pros</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Account</p>
              <div className="space-y-2.5 text-sm">
                <Link href="/my-projects" className="block text-white/40 hover:text-white transition-colors">My Projects</Link>
                <Link href="/get-quotes" className="block text-white/40 hover:text-white transition-colors">Get Quotes</Link>
                <Link href="/auth/login" className="block text-white/40 hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Company</p>
              <div className="space-y-2.5 text-sm">
                <Link href="/privacy" className="block text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
                <span className="block text-white/20 text-xs cursor-default">&copy; {new Date().getFullYear()} Naili Labs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="ai-pulse" />
            <span className="text-xs text-white/30">AI-powered renovation intelligence</span>
          </div>
          <p className="text-xs text-white/20">
            Estimates are planning-grade, not contractor quotes. Always verify with local pros.
          </p>
        </div>
      </div>
    </footer>
  );
}
