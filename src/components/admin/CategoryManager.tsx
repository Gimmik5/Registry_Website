// ============================================================
// CATEGORY MANAGER
// ------------------------------------------------------------
// Simple admin UI for creating categories. Lists existing ones
// and provides a form to add a new one.
// ============================================================

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const json = await response.json();
      setError(json.error ?? "Failed to create category");
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Existing categories */}
      <div>
        <h2 className="text-sm uppercase tracking-wider text-lilac-700 mb-3">
          Existing Categories ({initialCategories.length})
        </h2>
        {initialCategories.length === 0 ? (
          <p className="text-text-muted text-sm">
            No categories yet. Add one below.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {initialCategories.map((c) => (
              <li
                key={c.id}
                className="bg-surface border border-border rounded-lg px-4 py-2 flex justify-between items-center"
              >
                <span className="font-medium text-lilac-900">{c.name}</span>
                <span className="text-xs text-text-muted font-mono">
                  /{c.slug}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add new */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-wider text-lilac-700">
          Add New Category
        </h2>
        <Input
          label="Category name"
          placeholder="e.g. Kitchen, Bedroom, Experiences"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={submitting || !name}>
          {submitting ? "Adding..." : "Add Category"}
        </Button>
      </form>
    </div>
  );
}
