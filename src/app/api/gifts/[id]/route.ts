// ============================================================
// /api/gifts/[id]
// ------------------------------------------------------------
// GET    — get a single gift (auth required)
// PATCH  — update a gift (admin only)
// DELETE — delete a gift (admin only, fails if purchases exist)
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/helpers";
import {
  deleteGift,
  getGiftById,
  updateGift,
  type GiftInput,
} from "@/lib/database/gifts";
import { sanitiseString, toBoolean, toPositiveNumber } from "@/lib/utils/validation";
import { GiftStatus } from "@prisma/client";

type Params = Promise<{ id: string }>;

/**
 * GET /api/gifts/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const session = await requireAuth();

  const gift = await getGiftById(id);
  if (!gift) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  }

  // Guests can only see published gifts
  if (
    session.user?.role !== "ADMIN" &&
    gift.status === GiftStatus.DRAFT
  ) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  }

  return NextResponse.json({ data: gift });
}

/**
 * PATCH /api/gifts/[id]
 * Partial update of a gift.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  await requireRole("ADMIN");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const input: Partial<GiftInput> = {};

  if ("name" in raw) {
    const name = sanitiseString(raw.name, 200);
    if (name) input.name = name;
  }
  if ("description" in raw) {
    input.description = sanitiseString(raw.description, 2000);
  }
  if ("price" in raw) {
    const p = toPositiveNumber(raw.price);
    if (p !== null) input.price = p;
  }
  if ("imageUrl" in raw) {
    input.imageUrl = sanitiseString(raw.imageUrl, 2048);
  }
  if ("sourceUrl" in raw) {
    input.sourceUrl = sanitiseString(raw.sourceUrl, 2048);
  }
  if ("categoryId" in raw) {
    input.categoryId = sanitiseString(raw.categoryId, 100);
  }
  if ("isGroupGift" in raw) input.isGroupGift = toBoolean(raw.isGroupGift);
  if ("groupGiftTarget" in raw) {
    input.groupGiftTarget = toPositiveNumber(raw.groupGiftTarget);
  }
  if ("isFund" in raw) input.isFund = toBoolean(raw.isFund);
  if ("isPriority" in raw) input.isPriority = toBoolean(raw.isPriority);
  if ("displayOrder" in raw) {
    const n = toPositiveNumber(raw.displayOrder);
    if (n !== null) input.displayOrder = Math.floor(n);
  }
  if ("status" in raw && typeof raw.status === "string") {
    // Only accept known enum values
    const allowed: GiftStatus[] = [
      GiftStatus.DRAFT,
      GiftStatus.PUBLISHED,
      GiftStatus.PURCHASED,
      GiftStatus.PARTIALLY_FUNDED,
    ];
    if (allowed.includes(raw.status as GiftStatus)) {
      input.status = raw.status as GiftStatus;
    }
  }

  try {
    const gift = await updateGift(id, input);
    return NextResponse.json({ data: gift });
  } catch (error) {
    console.error("Failed to update gift:", error);
    return NextResponse.json(
      { error: "Failed to update gift" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gifts/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  await requireRole("ADMIN");

  try {
    await deleteGift(id);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    // Prisma throws P2003 / P2014 when the restrict constraint is violated
    console.error("Failed to delete gift:", error);
    return NextResponse.json(
      {
        error:
          "Cannot delete this gift — it has existing purchases. Archive it instead.",
      },
      { status: 409 }
    );
  }
}
