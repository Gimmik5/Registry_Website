// ============================================================
// GIFT CARD
// ------------------------------------------------------------
// Displays a single gift in the registry grid.
//
// States:
//   DRAFT            — admin only, shouldn't reach guests
//   PUBLISHED        — fully interactive, click to view
//   PARTIALLY_FUNDED — group gift with some contributions, still buyable
//   PURCHASED        — greyed out, not clickable, "Purchased" label
//
// Visual flags:
//   isPriority  — shows gold "Most Wanted" badge
//   isGroupGift — shows progress meter instead of price
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { GroupGiftMeter } from "./GroupGiftMeter";
import { FundTotal } from "./FundTotal";
import { formatPrice } from "@/lib/utils/formatting";

export interface GiftCardData {
  id: string;
  name: string;
  price: string | number;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "PURCHASED" | "PARTIALLY_FUNDED";
  isPriority: boolean;
  isGroupGift: boolean;
  isFund: boolean;
  groupGiftTarget: string | number | null;
  groupGiftRaised: string | number;
  categoryId: string | null;
  category: { name: string } | null;
}

interface GiftCardProps {
  gift: GiftCardData;
}

export function GiftCard({ gift }: GiftCardProps) {
  const isPurchased = gift.status === "PURCHASED";

  // Shared card classes — the "purchased" variant is visually muted
  const cardClasses = `
    bg-surface border border-border rounded-2xl overflow-hidden
    flex flex-col
    ${isPurchased ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:border-lilac-300 transition-all"}
  `;

  // Inner content (extracted so we can skip the Link wrapper for purchased items)
  const content = (
    <>
      {/* Image */}
      <div className="relative aspect-square bg-lilac-50 overflow-hidden">
        {gift.imageUrl ? (
          <Image
            src={gift.imageUrl}
            alt={gift.name}
            fill
            className={`object-contain p-4 ${isPurchased ? "grayscale" : ""}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-lilac-200">
            &#10047;
          </div>
        )}

        {/* Badge overlays (top-right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {isPurchased && <Badge variant="purchased">Purchased</Badge>}
          {gift.isFund && !isPurchased && <Badge variant="neutral">Fund</Badge>}
          {gift.isPriority && !isPurchased && (
            <Badge variant="priority">&#10033; Most Wanted</Badge>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {gift.category && (
          <p className="text-xs uppercase tracking-wider text-lilac-700">
            {gift.category.name}
          </p>
        )}
        <h3 className="font-medium text-lilac-900 leading-snug line-clamp-2">
          {gift.name}
        </h3>

        {/* Price / group gift progress / fund total — pinned to bottom */}
        <div className="mt-auto pt-2">
          {gift.isFund ? (
            <FundTotal raised={Number(gift.groupGiftRaised)} />
          ) : gift.isGroupGift && gift.groupGiftTarget !== null ? (
            <GroupGiftMeter
              raised={Number(gift.groupGiftRaised)}
              target={Number(gift.groupGiftTarget)}
            />
          ) : (
            <p className="text-lg font-medium text-lilac-900">
              {formatPrice(gift.price)}
            </p>
          )}
        </div>
      </div>
    </>
  );

  // Purchased items aren't clickable; everything else links to the detail page
  if (isPurchased) {
    return (
      <div className={cardClasses} aria-label={`${gift.name} (purchased)`}>
        {content}
      </div>
    );
  }

  return (
    <Link href={`/gift/${gift.id}`} className={cardClasses}>
      {content}
    </Link>
  );
}
