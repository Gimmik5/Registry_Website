// ============================================================
// /checkout — FULL CHECKOUT PAGE
// ------------------------------------------------------------
// Query params:
//   giftId — which gift is being purchased/contributed to
//   amount — (optional) contribution amount for funds & group gifts
//
// Flow:
//   1. Server fetches the gift and verifies it's still available
//   2. Shows a summary + the guest info form
//   3. Form submits to /api/checkout and redirects to Stripe
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { getGiftById } from "@/lib/database/gifts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GuestInfoForm } from "@/components/checkout/GuestInfoForm";
import { formatPrice } from "@/lib/utils/formatting";
import { GiftStatus } from "@prisma/client";

type SearchParams = Promise<{ giftId?: string; amount?: string }>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();
  const { giftId, amount: amountParam } = await searchParams;

  // No gift selected — show a friendly message
  if (!giftId) {
    return (
      <NoGiftSelected />
    );
  }

  const gift = await getGiftById(giftId);
  if (!gift || gift.status === GiftStatus.DRAFT) {
    notFound();
  }

  // Already purchased — gently inform and redirect back
  if (gift.status === GiftStatus.PURCHASED) {
    return <AlreadyPurchased />;
  }

  const isFundOrGroup = gift.isFund || gift.isGroupGift;

  // Determine the final amount for display and submission
  const amount = isFundOrGroup
    ? amountParam
      ? parseFloat(amountParam)
      : 0
    : Number(gift.price);

  // For fund/group, the amount must have been passed in. If not, bounce back.
  if (isFundOrGroup && (!amountParam || amount <= 0)) {
    return <MissingAmount giftId={gift.id} />;
  }

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/gift/${gift.id}`}
          className="text-sm text-lilac-700 hover:text-lilac-900 inline-block mb-6"
        >
          &larr; Back to gift
        </Link>

        <h1 className="text-3xl text-lilac-900 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-6">
          {/* Thumbnail */}
          {gift.imageUrl && (
            <div className="relative w-full md:w-32 aspect-square bg-lilac-50 rounded-xl overflow-hidden border border-border mx-auto md:mx-0">
              <Image
                src={gift.imageUrl}
                alt={gift.name}
                fill
                className="object-contain p-3"
                sizes="128px"
                unoptimized
              />
            </div>
          )}

          {/* Summary */}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider text-lilac-700 mb-1">
              {isFundOrGroup ? "Contributing to" : "Gift"}
            </p>
            <h2 className="text-xl text-lilac-900 mb-2">{gift.name}</h2>
            <p className="text-2xl font-medium text-lilac-900">
              {formatPrice(amount)}
            </p>
          </div>
        </div>

        <Card>
          <GuestInfoForm
            giftId={gift.id}
            amount={amount}
            isFundOrGroup={isFundOrGroup}
          />
        </Card>
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// Sub-states rendered as small helper components for clarity
// ------------------------------------------------------------

function NoGiftSelected() {
  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-3xl text-lilac-900 mb-4">Checkout</h1>
        <p className="text-text-muted mb-6">
          No gift selected. Please choose a gift from the registry first.
        </p>
        <Link href="/registry">
          <Button>Browse the registry</Button>
        </Link>
      </div>
    </main>
  );
}

function AlreadyPurchased() {
  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-3xl text-lilac-900 mb-4">Oh no!</h1>
        <p className="text-text-muted mb-6">
          Someone beat you to it — this gift has just been purchased. Please choose another from the registry.
        </p>
        <Link href="/registry">
          <Button>Back to the registry</Button>
        </Link>
      </div>
    </main>
  );
}

function MissingAmount({ giftId }: { giftId: string }) {
  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-3xl text-lilac-900 mb-4">Choose your amount</h1>
        <p className="text-text-muted mb-6">
          Please go back and enter how much you&apos;d like to contribute.
        </p>
        <Link href={`/gift/${giftId}`}>
          <Button>Back to the gift</Button>
        </Link>
      </div>
    </main>
  );
}
