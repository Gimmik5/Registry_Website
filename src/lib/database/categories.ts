// ============================================================
// CATEGORY DATABASE QUERIES
// ------------------------------------------------------------
// All database operations for the Category model. Categories
// group gifts (e.g. "Kitchen", "Bedroom", "Experiences").
// ============================================================

import { prisma } from "./client";
import type { Category } from "@prisma/client";

/**
 * Return all categories, ordered by displayOrder ascending.
 */
export async function getAllCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
  });
}

/**
 * Return a single category by id, or null if it doesn't exist.
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  return prisma.category.findUnique({
    where: { id },
  });
}

/**
 * Create a new category.
 */
export async function createCategory(data: {
  name: string;
  slug: string;
  displayOrder?: number;
}): Promise<Category> {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      displayOrder: data.displayOrder ?? 0,
    },
  });
}

/**
 * Update fields of an existing category.
 */
export async function updateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; displayOrder: number }>
): Promise<Category> {
  return prisma.category.update({
    where: { id },
    data,
  });
}

/**
 * Delete a category. Gifts in this category will have their
 * categoryId set to null (defined by onDelete: SetNull in schema).
 */
export async function deleteCategory(id: string): Promise<Category> {
  return prisma.category.delete({
    where: { id },
  });
}
