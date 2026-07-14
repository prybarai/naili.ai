"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getProPriceId } from "@/lib/stripe";

interface ProSubscribeButtonProps {
  /** Optional children to render instead of default button text */
  children?: React.ReactNode;
  /** Optional className override */
  className?: string;
}

export default function ProSubscribeButton({
  children,
  className = "",
}: ProSubscribeButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to sign in if not authenticated
      router.push("/auth/login?redirect=/pro");
      return;
    }

    const priceId = getProPriceId();
    if (!priceId) {
      setError("Pro subscription is not yet configured. Please check back soon.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not start checkout. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const stripeNotConfigured = !getProPriceId();

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading || stripeNotConfigured}
        className={
          className ||
          "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3.5 text-base font-semibold text-ink shadow-lg transition hover:from-amber-600 hover:to-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening checkout...
          </>
        ) : stripeNotConfigured ? (
          <>
            <Sparkles className="h-4 w-4" />
            Coming soon
          </>
        ) : (
          children || (
            <>
              <Sparkles className="h-4 w-4" />
              Subscribe to Pro
            </>
          )
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {stripeNotConfigured && !error && (
        <p className="mt-2 text-xs text-ink-400">
          Stripe payment setup is in progress. Check back soon.
        </p>
      )}
    </div>
  );
}
