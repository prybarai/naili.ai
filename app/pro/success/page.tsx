import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Subscription Active — Naili Pro",
  description: "Your Naili Pro subscription is active. Welcome to the network.",
};

export default function ProSuccessPage() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-lg text-center">
        {/* Green checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mint/20">
          <CheckCircle2 className="h-10 w-10 text-mint" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Subscription active!
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink-500 max-w-md mx-auto">
          Welcome to <span className="font-semibold text-ink">Naili Pro</span>.
          You now have access to premium contractor tools, better-matched leads, and
          early access to new features.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/my-projects"
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-canvas-50 shadow-lg transition hover:opacity-90 hover:shadow-xl active:scale-95"
          >
            View my dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-sm text-ink-400">
          Need help?{" "}
          <a
            href="mailto:support@naili.ai"
            className="font-medium text-amber-600 hover:text-amber-700 underline underline-offset-2"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
