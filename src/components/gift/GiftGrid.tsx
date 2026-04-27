// ============================================================
// GIFT GRID
// ------------------------------------------------------------
// Client-side interactive view of the gift list. Handles:
//   - Category filtering
//   - Text search (filters by gift name)
//   - Sorting: priority items first, then purchased items last
// ============================================================

"use client";

import { useMemo, useState } from "react";
import { GiftCard, type GiftCardData } from "./GiftCard";
import { GiftFilter } from "./GiftFilter";
import { SearchBar } from "@/components/ui/SearchBar";

interface Category {
  id: string;
  name: string;
}

interface GiftGridProps {
  gifts: GiftCardData[];
  categories: Category[];
}

export function GiftGrid({ gifts, categories }: GiftGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Derive the filtered & sorted list whenever inputs change
  const visibleGifts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return gifts
      .filter((gift) => {
        // Category filter
        if (selectedCategory && gift.categoryId !== selectedCategory) {
          return false;
        }
        // Search filter
        if (query && !gift.name.toLowerCase().includes(query)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Purchased items go to the end
        const aPurchased = a.status === "PURCHASED" ? 1 : 0;
        const bPurchased = b.status === "PURCHASED" ? 1 : 0;
        if (aPurchased !== bPurchased) return aPurchased - bPurchased;

        // Priority items come first (within each group)
        const aPriority = a.isPriority ? 0 : 1;
        const bPriority = b.isPriority ? 0 : 1;
        if (aPriority !== bPriority) return aPriority - bPriority;

        return 0;
      });
  }, [gifts, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search gifts..."
      />

      {/* Category filter pills */}
      {categories.length > 0 && (
        <GiftFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {/* Result count */}
      <p className="text-sm text-text-muted">
        {visibleGifts.length}{" "}
        {visibleGifts.length === 1 ? "gift" : "gifts"}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Grid */}
      {visibleGifts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No gifts match your filters.</p>
          <p className="text-sm">Try a different category or clear the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleGifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} />
          ))}
        </div>
      )}
    </div>
  );
}
