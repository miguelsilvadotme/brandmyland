import "server-only";
import Stripe from "stripe";
import { resolveAuctionMode } from "@/lib/config";

export function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY) && resolveAuctionMode() === "live";
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function logStripeFailure(event: string, error: unknown, extra?: Record<string, unknown>) {
  console.error(
    JSON.stringify({
      level: "error",
      source: "stripe",
      event,
      extra,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    }),
  );
}
