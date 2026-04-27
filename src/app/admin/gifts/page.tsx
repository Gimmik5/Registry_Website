// ============================================================
// /admin/gifts
// ------------------------------------------------------------
// Admin list of all gifts (drafts and published) with quick
// actions for each. Header has a link to add a new gift.
// ============================================================

import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getAllGifts } from "@/lib/database/gifts";
import { Button } from "@/components/ui/Button";
import { GiftListManager } from "@/components/admin/GiftListManager";

export default async function AdminGiftsPage() {
  await requireRole("ADMIN");
  const gifts = await getAllGifts();

  // Convert Decimal to string for serialisation to client component
  const serialised = gifts.map((g) => ({
    id: g.id,
    name: g.name,
    price: g.price.toString(),
    imageUrl: g.imageUrl,
    status: g.status,
    isPriority: g.isPriority,
    isGroupGift: g.isGroupGift,
    category: g.category ? { name: g.category.name } : null,
  }));

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin"
              className="text-sm text-lilac-700 hover:text-lilac-900 inline-block mb-2"
            >
              &larr; Back to admin dashboard
            </Link>
            <h1 className="text-3xl text-lilac-900">Manage Gifts</h1>
            <p className="text-text-muted mt-1">
              {gifts.length} {gifts.length === 1 ? "gift" : "gifts"} total
            </p>
          </div>
          <Link href="/admin/gifts/new">
            <Button>+ Add Gift</Button>
          </Link>
        </div>

        <GiftListManager gifts={serialised} />
      </div>
    </main>
  );
}
