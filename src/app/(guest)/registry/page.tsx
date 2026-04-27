// ============================================================
// /registry — GUEST GIFT LIST
// ------------------------------------------------------------
// The main page for wedding guests. Shows all published gifts
// (including purchased ones, greyed out). Server-side fetches
// the data, then passes it to the interactive GiftGrid.
// ============================================================

import { requireAuth } from "@/lib/auth/helpers";
import { getPublishedGifts } from "@/lib/database/gifts";
import { getAllCategories } from "@/lib/database/categories";
import { serialiseGiftForCard } from "@/lib/utils/serialise";
import { GiftGrid } from "@/components/gift/GiftGrid";

export default async function RegistryPage() {
  await requireAuth();

  // Fetch published gifts + all categories in parallel
  const [gifts, categories] = await Promise.all([
    getPublishedGifts(),
    getAllCategories(),
  ]);

  const serialisedGifts = gifts.map(serialiseGiftForCard);

  // Only show categories that have at least one published gift
  const usedCategoryIds = new Set(
    gifts.map((g) => g.categoryId).filter((id): id is string => id !== null)
  );
  const visibleCategories = categories
    .filter((c) => usedCategoryIds.has(c.id))
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <main className="flex-1 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-lilac-700 mb-2">
            Our Gift Registry
          </p>
          <h1 className="text-4xl sm:text-5xl text-lilac-900 mb-4">
            Gifts from us to you, or you to us
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-lilac-300" />
            <span className="text-lilac-400">&#10047;</span>
            <div className="h-px w-12 bg-lilac-300" />
          </div>
          <p className="text-text-muted max-w-xl mx-auto">
            Thank you for being a part of our celebration. If you&apos;d like to
            contribute a gift, you&apos;ll find our wishes below. Everything is
            entirely optional — your presence is our favourite present.
          </p>
        </div>

        {/* Gift grid with filters */}
        {serialisedGifts.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg">The gift list isn&apos;t published yet.</p>
            <p className="text-sm mt-1">Please check back soon.</p>
          </div>
        ) : (
          <GiftGrid
            gifts={serialisedGifts}
            categories={visibleCategories}
          />
        )}
      </div>
    </main>
  );
}
