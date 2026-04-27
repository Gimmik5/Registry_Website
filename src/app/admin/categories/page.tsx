// ============================================================
// /admin/categories
// ------------------------------------------------------------
// Admin page for managing gift categories. Simple list + form.
// ============================================================

import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getAllCategories } from "@/lib/database/categories";
import { Card } from "@/components/ui/Card";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN");
  const categories = await getAllCategories();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin"
          className="text-sm text-lilac-700 hover:text-lilac-900 mb-4 inline-block"
        >
          &larr; Back to admin dashboard
        </Link>

        <h1 className="text-3xl text-lilac-900 mb-8 text-center">
          Gift Categories
        </h1>

        <Card>
          <CategoryManager initialCategories={categories} />
        </Card>
      </div>
    </main>
  );
}
