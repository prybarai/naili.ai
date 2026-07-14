import Link from 'next/link';
import { Search, Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(216,185,138,0.08),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
        {/* Decorative */}
        <div className="mb-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-sand/20 to-amber-50">
            <span className="text-5xl font-bold text-sand-dark">404</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Page not found</h1>
        <p className="mt-3 max-w-md text-lg text-ink-500">
          Looks like this room doesn&apos;t exist in our floor plan. Let&apos;s get you back to something useful.
        </p>

        {/* Quick links */}
        <div className="mt-10 grid w-full max-w-sm gap-3">
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-4 text-sm font-semibold text-white shadow-soft transition-all hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            Start your own project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/blog"
              className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-canvas-50 px-4 py-3 text-sm font-semibold text-ink shadow-soft transition-all hover:bg-canvas-100"
            >
              <Search className="h-4 w-4" /> Blog & Guides
            </Link>
            <Link
              href="/cities"
              className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-canvas-50 px-4 py-3 text-sm font-semibold text-ink shadow-soft transition-all hover:bg-canvas-100"
            >
              <Search className="h-4 w-4" /> City Guides
            </Link>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2 text-sm text-ink-400">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="#292524" strokeWidth="1.5" opacity="0.6" />
            <path d="M10 22 L10 10 L22 22 L22 10" stroke="#292524" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="16" r="1.4" fill="#D8B98A" />
          </svg>
          <span>naili</span>
        </div>
      </div>
    </div>
  );
}
