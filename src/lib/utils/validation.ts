// ============================================================
// INPUT VALIDATION HELPERS
// ------------------------------------------------------------
// Small focused validators used by API routes. Keep validation
// explicit — each route says exactly what it expects.
// ============================================================

/**
 * Trim a string and return null if it's empty or not a string.
 */
export function sanitiseString(value: unknown, maxLength = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, maxLength);
}

/**
 * Require a string, throw a descriptive error if missing.
 */
export function requireString(value: unknown, field: string, maxLength = 500): string {
  const cleaned = sanitiseString(value, maxLength);
  if (cleaned === null) {
    throw new Error(`${field} is required`);
  }
  return cleaned;
}

/**
 * Coerce to a positive number. Returns null for invalid input.
 */
export function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

/**
 * Coerce to a boolean with a default.
 */
export function toBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

/**
 * Generate a URL-friendly slug from a string.
 * "Kitchen Gadgets" → "kitchen-gadgets"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
