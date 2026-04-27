// ============================================================
// /api/gifts
// ------------------------------------------------------------
// GET  — list gifts (admin: all, guest: only published ones)
// POST — create a new gift (admin only)
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/helpers";
import {
  createGift,
  getAllGifts,
  getPublishedGifts,
  type GiftInput,
} from "@/lib/database/gifts";
import { requireString, toPositiveNumber, toBoolean, sanitiseString } from "@/lib/utils/validation";

/**
 * GET /api/gifts
 * Admins see all gifts; guests only see published ones.
 */
export async function GET() {
  const session = await requireAuth();
  const gifts =
    session.user?.role === "ADMIN"
      ? await getAllGifts()
      : await getPublishedGifts();
  return NextResponse.json({ data: gifts });
}

/**
 * POST /api/gifts
 * Create a new gift (admin only).
 */
export async function POST(request: NextRequest) {
  await requireRole("ADMIN");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  // Validate required fields
  let name: string;
  let price: number;
  try {
    name = requireString(raw.name, "name", 200);
    const p = toPositiveNumber(raw.price);
    if (p === null) throw new Error("price must be a positive number");
    price = p;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid input" },
      { status: 400 }
    );
  }

  // Build the input object
  const input: GiftInput = {
    name,
    price,
    description: sanitiseString(raw.description, 2000),
    imageUrl: sanitiseString(raw.imageUrl, 2048),
    sourceUrl: sanitiseString(raw.sourceUrl, 2048),
    categoryId: sanitiseString(raw.categoryId, 100),
    isGroupGift: toBoolean(raw.isGroupGift),
    groupGiftTarget: toPositiveNumber(raw.groupGiftTarget),
    isCustom: toBoolean(raw.isCustom),
    isFund: toBoolean(raw.isFund),
    isPriority: toBoolean(raw.isPriority),
  };

  try {
    const gift = await createGift(input);
    return NextResponse.json({ data: gift }, { status: 201 });
  } catch (error) {
    console.error("Failed to create gift:", error);
    return NextResponse.json(
      { error: "Failed to create gift" },
      { status: 500 }
    );
  }
}
