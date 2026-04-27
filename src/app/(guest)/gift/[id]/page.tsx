// ============================================================
// /gift/[id] — GIFT DETAIL
// ------------------------------------------------------------
// Full view of a single gift. Handles three modes:
//   - Fixed gift: single "Purchase" button with the fixed price
//   - Group gift: contribution input (clamped to remaining amount)
//   - Fund: contribution input (no cap, any amount)
//
// Also shows previous contributors (for funds & group gifts)
// with a small list of names and amounts — guests can see the
// gift is gathering momentum without seeing private messages.
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { getGiftById } from "@/lib/database/gifts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GroupGiftMeter } from "@/components/gift/GroupGiftMeter";
import { FundTotal } from "@/components/gift/FundTotal";
import { ContributionInput } from "@/components/gift/ContributionInput";
import { formatPrice } from "@/lib/utils/formatting";
import { GiftStatus, PaymentStatus } from "@prisma/client";

type Params = Promise<{ id: string }>;

export default async function GiftDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAuth();

  const gift = await getGiftById(id);

  // Hide drafts from guests — behave like it doesn't exist
  if (!gift || gift.status === GiftStatus.DRAFT) {
    notFound();
  }

  const isPurchased = gift.status === GiftStatus.PURCHASED;

  // For group gifts, compute how much is still needed
  const remaining =
    gift.isGroupGift && gift.groupGiftTarget !== null && !gift.isFund
      ? Math.max(
          0,
          Number(gift.groupGiftTarget) - Number(gift.groupGiftRaised)
        )
      : undefined;

  // Show only completed contributions (skip pending or failed payments)
  const completedContributions = gift.purchases.filter(
    (p) => p.paymentStatus === PaymentStatus.COMPLETED
  );

  return (
    <main className="flex-1 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/registry"
          className="text-sm text-lilac-700 hover:text-lilac-900 inline-block mb-6"
        >
          &larr; Back to registry
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square bg-lilac-50 rounded-2xl overflow-hidden border border-border">
            {gift.imageUrl ? (
              <Image
                src={gift.imageUrl}
                alt={gift.name}
                fill
                className={`object-contain p-6 ${isPurchased ? "grayscale" : ""}`}
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl text-lilac-200">
                &#10047;
              </div>
            )}

            {/* Status overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
              {isPurchased && <Badge variant="purchased">Purchased</Badge>}
              {gift.isFund && !isPurchased && <Badge variant="neutral">Fund</Badge>}
              {gift.isPriority && !isPurchased && (
                <Badge variant="priority">&#10033; Most Wanted</Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {gift.category && (
              <p className="text-xs uppercase tracking-wider text-lilac-700 mb-2">
                {gift.category.name}
              </p>
            )}

            <h1 className="text-3xl text-lilac-900 mb-4">{gift.name}</h1>

            {gift.description && (
              <p className="text-text-muted leading-relaxed mb-6">
                {gift.description}
              </p>
            )}

            {/* Price / meter / fund total */}
            <div className="mb-6">
              {gift.isFund ? (
                <FundTotal raised={Number(gift.groupGiftRaised)} />
              ) : gift.isGroupGift && gift.groupGiftTarget !== null ? (
                <GroupGiftMeter
                  raised={Number(gift.groupGiftRaised)}
                  target={Number(gift.groupGiftTarget)}
                />
              ) : (
                <p className="text-3xl font-medium text-lilac-900">
                  {formatPrice(gift.price)}
                </p>
              )}
            </div>

            {/* Action */}
            {isPurchased ? (
              <div className="bg-lilac-50 border border-lilac-200 rounded-xl p-4 text-center">
                <p className="text-sm text-text-muted">
                  This gift has been purchased. Thank you for looking!
                </p>
              </div>
            ) : gift.isFund ? (
              <ContributionInput
                giftId={gift.id}
                suggestedAmount={Number(gift.price) > 0 ? Number(gift.price) : undefined}
                buttonLabel="Contribute to Fund"
              />
            ) : gift.isGroupGift ? (
              <ContributionInput
                giftId={gift.id}
                maxAmount={remaining}
                buttonLabel="Contribute to Gift"
              />
            ) : (
              <Link href={`/checkout?giftId=${gift.id}`} className="w-full">
                <Button className="w-full">Purchase This Gift</Button>
              </Link>
            )}

            {/* Source link (if scraped) */}
            {gift.sourceUrl && (
              <p className="text-xs text-text-muted text-center mt-4">
                <a
                  href={gift.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lilac-700 underline"
                >
                  View original product page
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Contributor list for funds & group gifts */}
        {(gift.isFund || gift.isGroupGift) &&
          completedContributions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-sm uppercase tracking-wider text-lilac-700 mb-4">
                Contributors
              </h2>
              <ul className="flex flex-col gap-2">
                {completedContributions.map((contribution) => (
                  <li
                    key={contribution.id}
                    className="bg-surface border border-border rounded-lg px-4 py-2 flex justify-between items-center"
                  >
                    <span className="text-lilac-900">{contribution.guestName}</span>
                    <span className="text-sm text-text-muted font-medium">
                      {formatPrice(contribution.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </main>
  );
}
