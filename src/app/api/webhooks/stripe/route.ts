// ============================================================
// POST /api/webhooks/stripe
// ------------------------------------------------------------
// Receives payment notifications from Stripe after a guest
// completes or cancels a checkout session.
//
// Events we handle:
//   checkout.session.completed — payment succeeded
//   checkout.session.expired   — session expired without payment
//
// Critical security requirements:
//   1. The body must be read as the RAW text (not parsed JSON),
//      otherwise signature verification fails.
//   2. We verify the Stripe-Signature header against our webhook
//      secret before doing ANYTHING else.
//   3. The handler must be idempotent — Stripe retries on failure.
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookEvent } from "@/lib/stripe/webhooks";
import {
  getPurchaseBySessionId,
  markPurchaseCompleted,
  markPurchaseFailed,
} from "@/lib/database/purchases";
import {
  getGiftById,
  incrementGroupGiftRaised,
  markGiftPurchased,
} from "@/lib/database/gifts";
import { PaymentStatus } from "@prisma/client";
import type Stripe from "stripe";

// Route config — disable body parsing so we can read the raw bytes
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Read the raw body — signature verification requires the
  // exact bytes Stripe sent, unmodified by JSON parsing.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = verifyWebhookEvent(rawBody, signature);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid signature";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleSessionCompleted(event.data.object);
        break;
      }
      case "checkout.session.expired": {
        await handleSessionExpired(event.data.object);
        break;
      }
      default:
        // Unhandled event types — just ACK so Stripe doesn't retry
        break;
    }
  } catch (error) {
    console.error(`Webhook handler failed for ${event.type}:`, error);
    // Return 500 so Stripe retries. Make sure handlers are idempotent.
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

/**
 * A guest successfully completed a Stripe checkout session.
 * Mark the Purchase as COMPLETED and update the gift.
 *
 * Idempotency: if we've already processed this session,
 * re-processing is a no-op because:
 *   - markPurchaseCompleted will simply reset the same fields
 *   - But we MUST NOT double-increment group-gift totals, so we
 *     check the current status before incrementing.
 */
async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  // Find the pending Purchase row we created in /api/checkout
  const purchase = await getPurchaseBySessionId(session.id);
  if (!purchase) {
    console.error(`No Purchase found for session ${session.id}`);
    return;
  }

  // If we've already processed this session, stop here (idempotency)
  if (purchase.paymentStatus === PaymentStatus.COMPLETED) {
    return;
  }

  // Mark the purchase completed and store the payment intent id
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await markPurchaseCompleted(session.id, paymentIntentId ?? "");

  // Update the gift itself
  const gift = await getGiftById(purchase.giftId);
  if (!gift) {
    console.error(`Gift ${purchase.giftId} not found for session ${session.id}`);
    return;
  }

  if (gift.isGroupGift || gift.isFund) {
    // Contribution toward a group gift or fund — increment the raised total.
    // incrementGroupGiftRaised handles auto-marking as PURCHASED when a
    // group-gift target is met (funds stay open indefinitely).
    await incrementGroupGiftRaised(gift.id, Number(purchase.amount));
  } else {
    // Fixed-price gift — mark it purchased so nobody else can buy it.
    await markGiftPurchased(gift.id);
  }
}

/**
 * The Stripe session expired (guest never paid). Mark the
 * pending purchase as FAILED so it doesn't clutter reports.
 */
async function handleSessionExpired(session: Stripe.Checkout.Session) {
  await markPurchaseFailed(session.id);
}
