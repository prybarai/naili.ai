'use client';

import Link from 'next/link';
import { RefreshCw, Home, Search } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#F6F3EE] via-[#FBF8F4] to-[#F1ECE5]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(216,185,138,0.08),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-red-50 to-orange-50">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Something went wrong</h1>
        <p className="mt-3 max-w-md text-lg text-ink-500">
          We hit a snag while building your estimate. Don&apos;t worry — nothing is lost.
        </p>

        <div className="mt-10 grid w-full max-w-sm gap-3">
          <button
            onClick={reset}
            className="group flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-4 text-sm font-semibold text-white shadow-soft transition-all hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-canvas-50 px-4 py-3 text-sm font-semibold text-ink shadow-soft transition-all hover:bg-canvas-100"
          >
            <Home className="h-4 w-4" /> Back to homepage
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-ink-400">
            Error reference: <code className="font-mono">{error.digest}</code>
          </p>
        )}

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
