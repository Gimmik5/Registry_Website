// ============================================================
// POST /api/scrape
// ------------------------------------------------------------
// Admin-only endpoint. Takes a URL and returns scraped product
// metadata so the admin can preview it before adding to the
// registry.
//
// Request:  { url: string }
// Response: { data: ScrapedProduct } or { error: string }
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/helpers";
import { scrapeProductUrl } from "@/lib/scraper";
import { requireString } from "@/lib/utils/validation";

export async function POST(request: NextRequest) {
  // Only admins can scrape URLs
  await requireRole("ADMIN");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  let url: string;
  try {
    url = requireString((body as { url?: unknown })?.url, "url", 2048);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const data = await scrapeProductUrl(url);
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to scrape URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
