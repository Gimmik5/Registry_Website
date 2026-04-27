// ============================================================
// GIFT DATABASE QUERIES
// ------------------------------------------------------------
// All database operations for the Gift model. Gifts are the
// core of the registry — scraped products, custom items, and
// group gifts all live in this table.
// ============================================================

import { prisma } from "./client";
import { GiftStatus, type Gift, type Prisma } from "@prisma/client";

/**
 * Return all gifts matching optional filters, including the
 * category relation. Ordered by displayOrder ascending.
 */
export async function getAllGifts(options?: {
  status?: GiftStatus;
  categoryId?: string | null;
}) {
  const where: Prisma.GiftWhereInput = {};

  if (options?.status !== undefined) {
    where.status = options.status;
  }
  if (options?.categoryId !== undefined) {
    where.categoryId = options.categoryId;
  }

  return prisma.gift.findMany({
    where,
    include: { category: true },
    orderBy: { displayOrder: "asc" },
  });
}

/**
 * Return all gifts visible to guests (everything except DRAFT).
 * Includes the category relation.
 */
export async function getPublishedGifts() {
  return prisma.gift.findMany({
    where: {
      status: {
        in: [
          GiftStatus.PUBLISHED,
          GiftStatus.PURCHASED,
          GiftStatus.PARTIALLY_FUNDED,
        ],
      },
    },
    include: { category: true },
    orderBy: { displayOrder: "asc" },
  });
}

/**
 * Return a single gift with its category and purchases,
 * or null if it doesn't exist.
 */
export async function getGiftById(id: string) {
  return prisma.gift.findUnique({
    where: { id },
    include: {
      category: true,
      purchases: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// Shape of data accepted by create/update
export interface GiftInput {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  categoryId?: string | null;
  isGroupGift?: boolean;
  groupGiftTarget?: number | null;
  isCustom?: boolean;
  isFund?: boolean;
  isPriority?: boolean;
  displayOrder?: number;
  status?: GiftStatus;
}

/**
 * Create a new gift. Defaults to DRAFT status.
 */
export async function createGift(data: GiftInput): Promise<Gift> {
  return prisma.gift.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      imageUrl: data.imageUrl ?? null,
      sourceUrl: data.sourceUrl ?? null,
      categoryId: data.categoryId ?? null,
      isGroupGift: data.isGroupGift ?? false,
      groupGiftTarget: data.groupGiftTarget ?? null,
      isCustom: data.isCustom ?? false,
      isFund: data.isFund ?? false,
      isPriority: data.isPriority ?? false,
      displayOrder: data.displayOrder ?? 0,
      status: data.status ?? GiftStatus.DRAFT,
    },
  });
}

/**
 * Update fields of an existing gift.
 */
export async function updateGift(
  id: string,
  data: Partial<GiftInput>
): Promise<Gift> {
  return prisma.gift.update({
    where: { id },
    data,
  });
}

/**
 * Delete a gift. Will fail (throw) if the gift has any
 * purchases (onDelete: Restrict in schema).
 */
export async function deleteGift(id: string): Promise<Gift> {
  return prisma.gift.delete({
    where: { id },
  });
}

/**
 * Publish a gift (make it visible to guests).
 */
export async function publishGift(id: string): Promise<Gift> {
  return prisma.gift.update({
    where: { id },
    data: { status: GiftStatus.PUBLISHED },
  });
}

/**
 * Unpublish a gift (move back to draft).
 */
export async function unpublishGift(id: string): Promise<Gift> {
  return prisma.gift.update({
    where: { id },
    data: { status: GiftStatus.DRAFT },
  });
}

/**
 * Mark a gift as purchased.
 */
export async function markGiftPurchased(id: string): Promise<Gift> {
  return prisma.gift.update({
    where: { id },
    data: { status: GiftStatus.PURCHASED },
  });
}

/**
 * Atomically increment the groupGiftRaised amount on a gift.
 * Used for both group gifts and open-ended funds.
 *
 * Behaviour:
 *   - Group gift with target: marks as PARTIALLY_FUNDED, then PURCHASED
 *     once raised >= target.
 *   - Fund (isFund true): marks as PARTIALLY_FUNDED but NEVER auto-closes —
 *     funds stay open to accept further contributions indefinitely.
 *
 * Runs as a single transaction so the increment and status update are atomic.
 */
export async function incrementGroupGiftRaised(
  id: string,
  amount: number
): Promise<Gift> {
  return prisma.$transaction(async (tx) => {
    // Step 1: increment the raised amount
    const updated = await tx.gift.update({
      where: { id },
      data: {
        groupGiftRaised: { increment: amount },
        status: GiftStatus.PARTIALLY_FUNDED,
      },
    });

    // Step 2: check if we've hit the target — but NEVER auto-close a fund
    if (
      !updated.isFund &&
      updated.groupGiftTarget !== null &&
      Number(updated.groupGiftRaised) >= Number(updated.groupGiftTarget)
    ) {
      return tx.gift.update({
        where: { id },
        data: { status: GiftStatus.PURCHASED },
      });
    }

    return updated;
  });
}
