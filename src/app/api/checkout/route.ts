// ============================================================
// POST /api/checkout
// ------------------------------------------------------------
// The guest has chosen a gift and filled in the name/message
// form. We:
//   1. Validate the input
//   2. Look up the gift in our database
//   3. Determine the final amount (trust the DB, not the client)
//      - Fixed gift: use gift.price
//      - Group gift: client amount, capped at remaining
//      - Fund: client amount, any positive value
//   4. Create a PENDING Purchase row
//   5. Create a Stripe checkout session with metadata
//   6. Return the Stripe URL so the client can redirect
//
// Any payment protection from double-buying happens here too:
//   - Already PURCHASED → reject
//   - DRAFT → reject (shouldn't happen, but defence in depth)
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { getGiftById } from "@/lib/database/gifts";
import { createPendingPurchase } from "@/lib/database/purchases";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import {
  requireString,
  sanitiseString,
  toPositiveNumber,
} from "@/lib/utils/validation";
import { GiftStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  await requireAuth();

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const raw = body as Record<string, unknown>;

  // --- Validate inputs ---
  let giftId: string;
  let guestName: string;
  try {
    giftId = requireString(raw.giftId, "giftId", 100);
    guestName = requireString(raw.guestName, "guestName", 200);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid input" },
      { status: 400 }
    );
  }

  const guestMessage = sanitiseString(raw.guestMessage, 1000);
  const guestEmail = sanitiseString(raw.guestEmail, 200);
  const clientAmount = toPositiveNumber(raw.amount);

  // --- Look up gift ---
  const gift = await getGiftById(giftId);
  if (!gift) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  }

  // --- Reject if not available ---
  if (gift.status === GiftStatus.DRAFT) {
    return NextResponse.json(
      { error: "This gift is not currently available" },
      { status: 409 }
    );
  }
  if (gift.status === GiftStatus.PURCHASED) {
    return NextResponse.json(
      { error: "Sorry — this gift has already been purchased." },
      { status: 409 }
    );
  }

  // --- Determine the final amount (server-authoritative) ---
  let finalAmount: number;

  if (gift.isFund) {
    // Fund: accept any positive amount the guest typed
    if (clientAmount === null) {
      return NextResponse.json(
        { error: "Please enter a contribution amount" },
        { status: 400 }
      );
    }
    finalAmount = clientAmount;
  } else if (gift.isGroupGift && gift.groupGiftTarget !== null) {
    // Group gift with a target — cap at what's remaining
    const raised = Number(gift.groupGiftRaised);
    const target = Number(gift.groupGiftTarget);
    const remaining = Math.max(0, target - raised);

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "This gift is already fully funded." },
        { status: 409 }
      );
    }
    if (clientAmount === null) {
      return NextResponse.json(
        { error: "Please enter a contribution amount" },
        { status: 400 }
      );
    }
    if (clientAmount > remaining) {
      return NextResponse.json(
        {
          error: `Please lower your amount — only £${remaining.toFixed(2)} is still needed.`,
        },
        { status: 400 }
      );
    }
    finalAmount = clientAmount;
  } else {
    // Fixed-price gift: ignore client amount, use DB price
    finalAmount = Number(gift.price);
    if (finalAmount <= 0) {
      return NextResponse.json(
        { error: "This gift has no price set" },
        { status: 500 }
      );
    }
  }

  // Stripe minimum is 30p in GBP — reject trivially small amounts
  if (finalAmount < 0.3) {
    return NextResponse.json(
      { error: "Minimum contribution is £0.30" },
      { status: 400 }
    );
  }

  // --- Determine the origin URL for Stripe redirects ---
  // In dev this is http://localhost:3000. In prod we read from env.
  const origin =
    process.env.NEXTAUTH_URL ?? request.nextUrl.origin;

  // --- Create Stripe session ---
  let session;
  try {
    session = await createCheckoutSession({
      giftId: gift.id,
      giftName: gift.name,
      amount: finalAmount,
      guestName,
      guestMessage,
      guestEmail,
      origin,
    });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    return NextResponse.json(
      { error: "Payment session could not be created. Please try again." },
      { status: 500 }
    );
  }

  // --- Record a PENDING Purchase so the webhook can find it ---
  try {
    await createPendingPurchase({
      giftId: gift.id,
      guestName,
      guestMessage,
      guestEmail,
      amount: finalAmount,
      stripeSessionId: session.sessionId,
    });
  } catch (error) {
    console.error("Failed to record pending purchase:", error);
    return NextResponse.json(
      { error: "Failed to record purchase — please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { url: session.url } });
}
