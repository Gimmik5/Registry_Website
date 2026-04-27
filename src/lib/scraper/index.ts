// ============================================================
// URL SCRAPER — MAIN ENTRY POINT
// ------------------------------------------------------------
// Takes a product URL and returns the extracted name, image,
// price, and description. Called by /api/scrape.
//
// Safety measures:
//   - URL validation (blocks localhost, private IPs, etc.)
//   - 10-second request timeout
//   - 2MB response size limit
//   - Requires HTML content-type
// ============================================================

import * as cheerio from "cheerio";
import { isSafeUrl } from "./validators";
import {
  extractTitle,
  extractImage,
  extractPrice,
  extractDescription,
} from "./parsers";

export interface ScrapedProduct {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  sourceUrl: string;
}

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB
const USER_AGENT =
  "Mozilla/5.0 (compatible; WeddingRegistryBot/1.0; +https://emandgidsatquendon.com/bot)";

/**
 * Fetch a product page and extract metadata.
 * Throws on network errors, unsafe URLs, or non-HTML responses.
 */
export async function scrapeProductUrl(url: string): Promise<ScrapedProduct> {
  if (!isSafeUrl(url)) {
    throw new Error("Invalid or unsafe URL");
  }

  // Set up a 10-second timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out after 10 seconds");
    }
    throw new Error("Failed to fetch URL");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  // Reject non-HTML responses (e.g. binary downloads)
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) {
    throw new Error("URL did not return an HTML document");
  }

  // Check declared content-length to reject huge pages early
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
    throw new Error("Page too large to scrape");
  }

  const html = await response.text();

  // Guard against servers that don't send content-length
  if (html.length > MAX_RESPONSE_BYTES) {
    throw new Error("Page too large to scrape");
  }

  const $ = cheerio.load(html);

  return {
    title: extractTitle($),
    description: extractDescription($),
    imageUrl: extractImage($, url),
    price: extractPrice($),
    sourceUrl: url,
  };
}
