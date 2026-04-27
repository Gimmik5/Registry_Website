// ============================================================
// SEARCH BAR
// ------------------------------------------------------------
// Generic search input with a magnifying-glass icon. Used on
// the registry page to search gift names.
// ============================================================

"use client";

import type { ChangeEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="relative">
      {/* Search icon (SVG, no external dependency) */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search gifts"
        className="
          w-full pl-11 pr-4 py-2.5 rounded-full
          bg-surface border border-border
          text-text placeholder:text-text-muted
          focus:outline-none focus:border-lilac-500 focus:ring-2 focus:ring-lilac-200
          transition-colors
        "
      />
    </div>
  );
}
