// ============================================================
// STRIPE CLIENT SINGLETON
// ------------------------------------------------------------
// One Stripe instance for the whole app. We read the secret key
// from the environment — never hardcoded.
//
// The Stripe SDK pins to a specific API version, so behaviour is
// deterministic across Stripe's own updates.
// ============================================================

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to .env.local (use a test key while developing)."
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Pinning the API version means Stripe upgrades won't silently change behaviour.
  apiVersion: "2025-11-17.clover",
  typescript: true,
});
