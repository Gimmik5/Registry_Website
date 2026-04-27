// ============================================================
// FORMATTING HELPERS
// ------------------------------------------------------------
// Shared formatters for prices, dates, etc. Use these wherever
// you display values so formatting stays consistent.
// ============================================================

import type { Decimal } from "@prisma/client/runtime/library";

type PriceLike = number | Decimal | string | null | undefined;

/**
 * Format a price as GBP currency string, e.g. "£29.99".
 * Accepts a number, a Prisma Decimal, or a numeric string.
 */
export function formatPrice(value: PriceLike): string {
  if (value === null || value === undefined) return "£0.00";

  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? parseFloat(value)
      : Number(value);

  if (!Number.isFinite(num)) return "£0.00";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(num);
}

/**
 * Format a date as "12 April 2026".
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
