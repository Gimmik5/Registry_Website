// ============================================================
// /admin/gifts/new
// ------------------------------------------------------------
// Admin page to add a new gift to the registry. Shows the
// two-step scrape-then-review flow.
// ============================================================

import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getAllCategories } from "@/lib/database/categories";
import { Card } from "@/components/ui/Card";
import { NewGiftFlow } from "@/components/admin/NewGiftFlow";

export default async function NewGiftPage() {
  await requireRole("ADMIN");
  const categories = await getAllCategories();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/gifts"
          className="text-sm text-lilac-700 hover:text-lilac-900 mb-4 inline-block"
        >
          &larr; Back to gift list
        </Link>

        <h1 className="text-3xl text-lilac-900 mb-8 text-center">
          Add a New Gift
        </h1>

        <Card>
          <NewGiftFlow
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </Card>
      </div>
    </main>
  );
}
