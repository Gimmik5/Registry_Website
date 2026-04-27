// ============================================================
// /api/categories
// ------------------------------------------------------------
// GET  — list all categories (any authenticated user)
// POST — create a new category (admin only)
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth/helpers";
import {
  createCategory,
  getAllCategories,
} from "@/lib/database/categories";
import { requireString, slugify, toPositiveNumber } from "@/lib/utils/validation";

/**
 * GET /api/categories
 */
export async function GET() {
  await requireAuth();
  const categories = await getAllCategories();
  return NextResponse.json({ data: categories });
}

/**
 * POST /api/categories
 * Create a new category (admin only).
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

  let name: string;
  try {
    name = requireString(raw.name, "name", 100);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid input" },
      { status: 400 }
    );
  }

  const slug = slugify(name);
  const order = toPositiveNumber(raw.displayOrder);

  try {
    const category = await createCategory({
      name,
      slug,
      displayOrder: order !== null ? Math.floor(order) : 0,
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Category could not be created (name or slug may already exist)" },
      { status: 409 }
    );
  }
}
