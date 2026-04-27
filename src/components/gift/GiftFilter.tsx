// ============================================================
// GIFT FILTER
// ------------------------------------------------------------
// Horizontal row of category filter pills. "All" is always first.
// ============================================================

"use client";

interface Category {
  id: string;
  name: string;
}

interface GiftFilterProps {
  categories: Category[];
  /** Currently selected category id, or null for "All" */
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function GiftFilter({
  categories,
  selected,
  onSelect,
}: GiftFilterProps) {
  const pillBase =
    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap";
  const pillActive = "bg-lilac-500 text-white";
  const pillIdle =
    "bg-surface border border-border text-lilac-900 hover:bg-lilac-50";

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 -mb-2"
      role="tablist"
      aria-label="Filter gifts by category"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`${pillBase} ${selected === null ? pillActive : pillIdle}`}
        role="tab"
        aria-selected={selected === null}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`${pillBase} ${
            selected === category.id ? pillActive : pillIdle
          }`}
          role="tab"
          aria-selected={selected === category.id}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
