// ============================================================
// SERIALISATION HELPERS
// ------------------------------------------------------------
// Prisma returns Decimal values that can't be passed directly
// from a Server Component to a Client Component (not JSON-safe).
// These helpers convert them to strings at the boundary.
// ============================================================

import type { Gift, Category } from "@prisma/client";
import type { GiftCardData } from "@/components/gift/GiftCard";

/**
 * Convert a Prisma Gift (with optional category) to the plain
 * JSON-safe shape expected by GiftCard components.
 */
export function serialiseGiftForCard(
  gift: Gift & { category: Category | null }
): GiftCardData {
  return {
    id: gift.id,
    name: gift.name,
    price: gift.price.toString(),
    imageUrl: gift.imageUrl,
    status: gift.status,
    isPriority: gift.isPriority,
    isGroupGift: gift.isGroupGift,
    isFund: gift.isFund,
    groupGiftTarget: gift.groupGiftTarget?.toString() ?? null,
    groupGiftRaised: gift.groupGiftRaised.toString(),
    categoryId: gift.categoryId,
    category: gift.category ? { name: gift.category.name } : null,
  };
}
