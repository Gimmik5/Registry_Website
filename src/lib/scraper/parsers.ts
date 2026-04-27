// ============================================================
// HTML PARSERS
// ------------------------------------------------------------
// Pure functions that extract product metadata from a parsed
// HTML document (Cheerio API instance). Each parser tries
// multiple strategies and returns null when nothing is found.
//
// Strategy priority:
//   1. Open Graph / Twitter meta tags (most reliable)
//   2. Schema.org JSON-LD structured data
//   3. HTML fallbacks (title tag, first h1, first img)
// ============================================================

import type { CheerioAPI } from "cheerio";

// Helper — return the first non-empty trimmed value, or null
function firstNonEmpty(values: (string | undefined | null)[]): string | null {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return null;
}

/**
 * Extract the product title.
 * Tries og:title, twitter:title, <title>, then first <h1>.
 */
export function extractTitle($: CheerioAPI): string | null {
  return firstNonEmpty([
    $('meta[property="og:title"]').attr("content"),
    $('meta[name="twitter:title"]').attr("content"),
    $("title").first().text(),
    $("h1").first().text(),
  ]);
}

/**
 * Extract a product image URL, resolved against the page URL.
 */
export function extractImage(
  $: CheerioAPI,
  baseUrl: string
): string | null {
  const candidate = firstNonEmpty([
    $('meta[property="og:image"]').attr("content"),
    $('meta[property="og:image:secure_url"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $("img").first().attr("src"),
  ]);

  if (!candidate) return null;

  // Resolve relative URLs (e.g. /images/foo.jpg → https://site.com/images/foo.jpg)
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Extract a product description.
 */
export function extractDescription($: CheerioAPI): string | null {
  return firstNonEmpty([
    $('meta[property="og:description"]').attr("content"),
    $('meta[name="description"]').attr("content"),
  ]);
}

// Try to pull a numeric price from a schema.org JSON-LD object
// (handles: { offers: { price }} and { price } and arrays of those)
function priceFromJsonLd(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = priceFromJsonLd(item);
      if (found !== null) return found;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Direct price
  const direct = toNumber(obj.price);
  if (direct !== null) return direct;

  // offers.price
  const offers = obj.offers;
  if (offers) {
    const fromOffers = priceFromJsonLd(offers);
    if (fromOffers !== null) return fromOffers;
  }

  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    if (!cleaned) return null;
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Extract the product price as a number (e.g. 29.99).
 * Only uses structured data (JSON-LD, meta tags) — never scrapes
 * visible text, which is unreliable and currency-ambiguous.
 */
export function extractPrice($: CheerioAPI): number | null {
  // 1. Try meta tags first
  const metaPrice = firstNonEmpty([
    $('meta[property="product:price:amount"]').attr("content"),
    $('meta[property="og:price:amount"]').attr("content"),
    $('meta[itemprop="price"]').attr("content"),
  ]);
  if (metaPrice) {
    const n = toNumber(metaPrice);
    if (n !== null) return n;
  }

  // 2. Try JSON-LD schema.org Product blocks
  const jsonLdBlocks = $('script[type="application/ld+json"]');
  for (const element of jsonLdBlocks.toArray()) {
    const raw = $(element).contents().text();
    if (!raw) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      const price = priceFromJsonLd(parsed);
      if (price !== null) return price;
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }

  return null;
}
