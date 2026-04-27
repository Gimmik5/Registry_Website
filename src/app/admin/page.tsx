// ============================================================
// ADMIN DASHBOARD
// ------------------------------------------------------------
// Landing page for admins. Quick links to manage gifts and
// categories. Stats and purchase tracking coming in Phase 5.
// ============================================================

import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getAllGifts } from "@/lib/database/gifts";
import { getAllCategories } from "@/lib/database/categories";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AdminDashboardPage() {
  const session = await requireRole("ADMIN");

  // Quick stats
  const gifts = await getAllGifts();
  const categories = await getAllCategories();
  const draftCount = gifts.filter((g) => g.status === "DRAFT").length;
  const publishedCount = gifts.filter((g) => g.status === "PUBLISHED").length;
  const purchasedCount = gifts.filter((g) => g.status === "PURCHASED").length;

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-2">
            Admin Dashboard
          </p>
          <h1 className="text-4xl text-lilac-900 mb-2">
            Welcome back, {session.user?.name}
          </h1>
          <p className="text-text-muted">
            Manage your wedding registry from here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <Card className="text-center">
            <p className="text-3xl font-medium text-lilac-900">{gifts.length}</p>
            <p className="text-sm text-text-muted mt-1">Total gifts</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-medium text-lilac-900">{draftCount}</p>
            <p className="text-sm text-text-muted mt-1">Drafts</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-medium text-lilac-900">{publishedCount}</p>
            <p className="text-sm text-text-muted mt-1">Published</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-medium text-lilac-900">{purchasedCount}</p>
            <p className="text-sm text-text-muted mt-1">Purchased</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Card>
            <h2 className="text-xl text-lilac-900 mb-2">Gifts</h2>
            <p className="text-sm text-text-muted mb-4">
              Add, edit, and publish gifts in your registry.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link href="/admin/gifts">
                <Button variant="secondary" className="text-sm px-4 py-2">
                  View All
                </Button>
              </Link>
              <Link href="/admin/gifts/new">
                <Button className="text-sm px-4 py-2">+ New Gift</Button>
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl text-lilac-900 mb-2">Categories</h2>
            <p className="text-sm text-text-muted mb-4">
              {categories.length} {categories.length === 1 ? "category" : "categories"} defined.
            </p>
            <Link href="/admin/categories">
              <Button variant="secondary" className="text-sm px-4 py-2">
                Manage Categories
              </Button>
            </Link>
          </Card>
        </div>

        <div className="text-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
