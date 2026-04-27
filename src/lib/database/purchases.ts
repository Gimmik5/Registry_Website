// ============================================================
// PURCHASE DATABASE QUERIES
// ------------------------------------------------------------
// All database operations for the Purchase model. Every payment
// (whether fixed gift, group contribution, or fund donation) is
// one row so the couple can thank each contributor individually.
// ============================================================

import { prisma } from "./client";
import { PaymentStatus, type Purchase } from "@prisma/client";

/**
 * Create a new Purchase row in PENDING state. Called when a
 * Stripe checkout session is created, before the guest pays.
 */
export async function createPendingPurchase(data: {
  giftId: string;
  guestName: string;
  guestMessage: string | null;
  guestEmail: string | null;
  amount: number;
  stripeSessionId: string;
}): Promise<Purchase> {
  return prisma.purchase.create({
    data: {
      giftId: data.giftId,
      guestName: data.guestName,
      guestMessage: data.guestMessage,
      guestEmail: data.guestEmail,
      amount: data.amount,
      stripeSessionId: data.stripeSessionId,
      paymentStatus: PaymentStatus.PENDING,
    },
  });
}

/**
 * Look up a Purchase by its Stripe session id.
 * Used by the webhook handler and the success page.
 */
export async function getPurchaseBySessionId(
  stripeSessionId: string
) {
  return prisma.purchase.findUnique({
    where: { stripeSessionId },
    include: { gift: true },
  });
}

/**
 * Mark a Purchase as COMPLETED and attach the final payment
 * intent id from Stripe.
 */
export async function markPurchaseCompleted(
  stripeSessionId: string,
  stripePaymentIntentId: string
): Promise<Purchase> {
  return prisma.purchase.update({
    where: { stripeSessionId },
    data: {
      paymentStatus: PaymentStatus.COMPLETED,
      stripePaymentIntentId,
    },
  });
}

/**
 * Mark a Purchase as FAILED. Called when Stripe reports the
 * session expired or payment failed.
 */
export async function markPurchaseFailed(
  stripeSessionId: string
): Promise<Purchase | null> {
  const existing = await prisma.purchase.findUnique({
    where: { stripeSessionId },
  });
  if (!existing) return null;

  return prisma.purchase.update({
    where: { stripeSessionId },
    data: { paymentStatus: PaymentStatus.FAILED },
  });
}

/**
 * List all purchases (admin dashboard). Newest first.
 * Includes the gift so the admin sees what was bought.
 */
export async function getAllPurchases() {
  return prisma.purchase.findMany({
    include: { gift: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Toggle the "thanked" flag on a purchase.
 */
export async function setPurchaseThanked(
  id: string,
  thanked: boolean
): Promise<Purchase> {
  return prisma.purchase.update({
    where: { id },
    data: {
      thanked,
      thankedAt: thanked ? new Date() : null,
    },
  });
}
