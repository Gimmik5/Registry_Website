// ============================================================
// GIFT LIST MANAGER
// ------------------------------------------------------------
// Admin table of all gifts with quick-action buttons:
//   - Publish / Unpublish
//   - Edit (link to edit page)
//   - Delete (with confirmation)
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils/formatting";

interface GiftListItem {
  id: string;
  name: string;
  price: string | number;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "PURCHASED" | "PARTIALLY_FUNDED";
  isPriority: boolean;
  isGroupGift: boolean;
  category: { name: string } | null;
}

interface GiftListManagerProps {
  gifts: GiftListItem[];
}

export function GiftListManager({ gifts }: GiftListManagerProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleTogglePublish(gift: GiftListItem) {
    setBusyId(gift.id);
    const newStatus = gift.status === "DRAFT" ? "PUBLISHED" : "DRAFT";
    await fetch(`/api/gifts/${gift.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function handleDelete(gift: GiftListItem) {
    if (
      !confirm(`Delete "${gift.name}"? This cannot be undone.`)
    ) {
      return;
    }
    setBusyId(gift.id);
    const response = await fetch(`/api/gifts/${gift.id}`, { method: "DELETE" });
    setBusyId(null);
    if (!response.ok) {
      const json = await response.json();
      alert(json.error ?? "Failed to delete gift");
      return;
    }
    router.refresh();
  }

  if (gifts.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="mb-4">No gifts yet.</p>
        <Link href="/admin/gifts/new">
          <Button>Add your first gift</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {gifts.map((gift) => (
        <div
          key={gift.id}
          className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4"
        >
          {/* Thumbnail */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-lilac-50">
            {gift.imageUrl ? (
              <Image
                src={gift.imageUrl}
                alt=""
                fill
                className="object-contain"
                sizes="64px"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lilac-300">
                &#10047;
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-lilac-900 truncate">
                {gift.name}
              </p>
              <Badge
                variant={
                  gift.status === "PUBLISHED"
                    ? "published"
                    : gift.status === "DRAFT"
                    ? "draft"
                    : gift.status === "PURCHASED"
                    ? "purchased"
                    : "partial"
                }
              >
                {gift.status.toLowerCase().replace("_", " ")}
              </Badge>
              {gift.isPriority && <Badge variant="priority">Priority</Badge>}
              {gift.isGroupGift && <Badge variant="neutral">Group</Badge>}
            </div>
            <p className="text-sm text-text-muted mt-0.5">
              {formatPrice(gift.price)}
              {gift.category && <> &middot; {gift.category.name}</>}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {gift.status !== "PURCHASED" && (
              <Button
                variant="ghost"
                onClick={() => handleTogglePublish(gift)}
                disabled={busyId === gift.id}
                className="px-4 py-2 text-sm"
              >
                {gift.status === "DRAFT" ? "Publish" : "Unpublish"}
              </Button>
            )}
            <Link href={`/admin/gifts/${gift.id}/edit`}>
              <Button variant="secondary" className="px-4 py-2 text-sm">
                Edit
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(gift)}
              disabled={busyId === gift.id}
              className="text-sm text-error hover:text-red-700 px-2"
              aria-label={`Delete ${gift.name}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
