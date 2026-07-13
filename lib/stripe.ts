import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

/**
 * Returns the Stripe publishable key from environment variables.
 * Gracefully returns empty string if not configured.
 */
export function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
}

/**
 * Returns the Pro monthly price ID from environment variables.
 * Gracefully returns empty string if not configured.
 */
export function getProPriceId(): string {
  return process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "";
}

/**
 * Server-side Stripe instance.
 * Returns null if STRIPE_SECRET_KEY is not set (graceful fallback).
 */
export function getStripeServer(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/**
 * Client-side Stripe instance loader.
 * Returns null if no publishable key is configured.
 */
let stripeClientPromise: Promise<import("@stripe/stripe-js").Stripe | null> | null = null;

export function getStripeClient(): Promise<import("@stripe/stripe-js").Stripe | null> | null {
  const key = getPublishableKey();
  if (!key) return null;
  if (!stripeClientPromise) {
    stripeClientPromise = loadStripe(key);
  }
  return stripeClientPromise;
}

/** Convenience re-export for server-side use. */
export const stripeServer = getStripeServer();
