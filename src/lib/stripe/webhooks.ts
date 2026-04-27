// ============================================================
// STRIPE WEBHOOK HELPERS
// ------------------------------------------------------------
// Verifies a raw webhook request using the signing secret.
// If verification fails we throw — the caller should respond
// with 400 and NOT process the event. Unsigned webhooks are
// forgeable and must never be trusted.
// ============================================================

import { stripe } from "./client";
import type Stripe from "stripe";

/**
 * Verify a raw webhook payload and return the parsed Stripe event.
 * Throws if the signature is missing, malformed, or invalid.
 */
export function verifyWebhookEvent(
  rawBody: string,
  signatureHeader: string | null
): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  if (!signatureHeader) {
    throw new Error("Missing Stripe signature header");
  }

  return stripe.webhooks.constructEvent(
    rawBody,
    signatureHeader,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
