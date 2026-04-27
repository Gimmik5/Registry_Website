// ============================================================
// STRIPE CHECKOUT SESSION HELPERS
// ------------------------------------------------------------
// Creates a Stripe Checkout Session (the hosted payment page)
// for a single gift contribution. Returns the session id and
// URL for the guest to be redirected to.
//
// Key design choices:
//   - We use Stripe Checkout (hosted), not Payment Intents. This
//     keeps card details entirely on Stripe's servers — we stay
//     out of PCI scope.
//   - Metadata on the session lets the webhook handler look up
//     our internal Purchase row.
//   - Amounts are in pence (Stripe's smallest currency unit).
// ============================================================

import { stripe } from "./client";

interface CreateCheckoutSessionArgs {
  giftId: string;
  giftName: string;
  amount: number;          // in GBP (pounds), e.g. 29.99
  guestName: string;
  guestMessage: string | null;
  guestEmail: string | null;
  origin: string;          // e.g. "http://localhost:3000"
}

export interface CreatedCheckoutSession {
  sessionId: string;
  url: string;
}

/**
 * Convert a GBP amount (pounds) to pence. Stripe expects
 * integer amounts in the smallest currency unit.
 */
function toPence(amountGbp: number): number {
  return Math.round(amountGbp * 100);
}

/**
 * Create a new Stripe Checkout Session for a single contribution.
 */
export async function createCheckoutSession(
  args: CreateCheckoutSessionArgs
): Promise<CreatedCheckoutSession> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    // What the guest is paying for — displayed on the Stripe page
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: toPence(args.amount),
          product_data: {
            name: args.giftName,
          },
        },
        quantity: 1,
      },
    ],

    // Where Stripe sends the guest after the payment attempt
    success_url: `${args.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${args.origin}/checkout/cancelled`,

    // Optional — Stripe emails the receipt to this address
    customer_email: args.guestEmail ?? undefined,

    // Metadata lets the webhook handler link the Stripe event back
    // to our internal Purchase row (by session id).
    metadata: {
      giftId: args.giftId,
      guestName: args.guestName,
      // Truncate message so we don't exceed Stripe's 500-char metadata limit
      guestMessage: (args.guestMessage ?? "").slice(0, 450),
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a session URL");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}
