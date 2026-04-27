// ============================================================
// /admin/gifts/[id]/edit
// ------------------------------------------------------------
// Admin page to edit an existing gift. Loads the current gift
// data and passes it to the reusable GiftForm as initial values.
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { getGiftById } from "@/lib/database/gifts";
import { getAllCategories } from "@/lib/database/categories";
import { Card } from "@/components/ui/Card";
import { GiftForm } from "@/components/gift/GiftForm";

type Params = Promise<{ id: string }>;

export default async function EditGiftPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireRole("ADMIN");

  const gift = await getGiftById(id);
  if (!gift) notFound();

  const categories = await getAllCategories();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/gifts"
          className="text-sm text-lilac-700 hover:text-lilac-900 mb-4 inline-block"
        >
          &larr; Back to gift list
        </Link>

        <h1 className="text-3xl text-lilac-900 mb-8 text-center">
          Edit Gift
        </h1>

        <Card>
          <GiftForm
            giftId={gift.id}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            initialValues={{
              name: gift.name,
              description: gift.description,
              price: gift.price.toString(),
              imageUrl: gift.imageUrl,
              sourceUrl: gift.sourceUrl,
              categoryId: gift.categoryId,
              isGroupGift: gift.isGroupGift,
              groupGiftTarget: gift.groupGiftTarget?.toString() ?? null,
              isPriority: gift.isPriority,
              isCustom: gift.isCustom,
              isFund: gift.isFund,
            }}
          />
        </Card>
      </div>
    </main>
  );
}
