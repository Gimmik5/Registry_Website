// ============================================================
// GIFT FORM
// ------------------------------------------------------------
// Reusable form for creating and editing a gift. Used for:
//   - "New scraped gift" (prefilled from /api/scrape)
//   - "New custom gift" (blank, fixed price)
//   - "New fund" (open-ended contributions, e.g. honeymoon)
//   - "Edit existing gift" (prefilled from API)
//
// Behaviour varies by mode:
//   - Fund: no image URL, no source URL, price = suggested contribution
//     (not required), group-gift toggle hidden (implicit)
//   - Scraped / custom: standard fixed-price fields
//
// Submits via POST or PATCH depending on whether `giftId` is
// provided.
// ============================================================

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export interface GiftFormInitialValues {
  name?: string;
  description?: string | null;
  price?: number | string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  categoryId?: string | null;
  isGroupGift?: boolean;
  groupGiftTarget?: number | string | null;
  isPriority?: boolean;
  isCustom?: boolean;
  isFund?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface GiftFormProps {
  giftId?: string; // If set, form updates instead of creates
  initialValues?: GiftFormInitialValues;
  categories: Category[];
  /** Called on successful submit. Passed the gift id returned by the server. */
  onSuccess?: (giftId: string) => void;
}

export function GiftForm({
  giftId,
  initialValues = {},
  categories,
  onSuccess,
}: GiftFormProps) {
  const router = useRouter();

  // Once set, this never changes — you can't convert between fund and
  // non-fund via the edit form (would be misleading for existing contributions)
  const isFund = initialValues.isFund ?? false;

  // Form state
  const [name, setName] = useState(initialValues.name ?? "");
  const [description, setDescription] = useState(initialValues.description ?? "");
  const [price, setPrice] = useState(
    initialValues.price != null ? String(initialValues.price) : ""
  );
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl ?? "");
  const [sourceUrl, setSourceUrl] = useState(initialValues.sourceUrl ?? "");
  const [categoryId, setCategoryId] = useState(initialValues.categoryId ?? "");
  const [isGroupGift, setIsGroupGift] = useState(initialValues.isGroupGift ?? false);
  const [groupGiftTarget, setGroupGiftTarget] = useState(
    initialValues.groupGiftTarget != null
      ? String(initialValues.groupGiftTarget)
      : ""
  );
  const [isPriority, setIsPriority] = useState(initialValues.isPriority ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    // Funds always behave as group gifts internally
    const groupGiftFlag = isFund ? true : isGroupGift;

    const payload = {
      name,
      description: description || null,
      // Funds: price is a suggestion, default to 0 if blank.
      price: isFund
        ? price
          ? parseFloat(price)
          : 0
        : parseFloat(price),
      imageUrl: imageUrl || null,
      sourceUrl: sourceUrl || null,
      categoryId: categoryId || null,
      isGroupGift: groupGiftFlag,
      groupGiftTarget:
        groupGiftFlag && groupGiftTarget
          ? parseFloat(groupGiftTarget)
          : null,
      isFund,
      isPriority,
      isCustom: initialValues.isCustom ?? !sourceUrl,
    };

    try {
      const response = await fetch(
        giftId ? `/api/gifts/${giftId}` : "/api/gifts",
        {
          method: giftId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Failed to save gift");
        return;
      }

      if (onSuccess) {
        onSuccess(json.data.id);
      } else {
        router.push("/admin/gifts");
        router.refresh();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Image preview (applies to all gift types, including funds) */}
      {imageUrl && (
        <div className="flex justify-center">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-lilac-50 border border-border">
            <Image
              src={imageUrl}
              alt={name || "Gift preview"}
              fill
              className="object-contain"
              sizes="192px"
              unoptimized
            />
          </div>
        </div>
      )}

      <Input
        label={isFund ? "Fund name (e.g. Honeymoon Fund)" : "Name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium text-lilac-900 block mb-1.5"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder={
            isFund
              ? "Tell guests what you're saving for..."
              : undefined
          }
          className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-lilac-500 focus:ring-2 focus:ring-lilac-200 transition-colors resize-y"
        />
      </div>

      <Input
        label={isFund ? "Suggested contribution (£, optional)" : "Price (£)"}
        type="number"
        step="0.01"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required={!isFund}
        placeholder={isFund ? "e.g. 50 (guests can change this)" : undefined}
      />

      {/* Image URL — optional for all gift types, including funds */}
      <Input
        label={isFund ? "Image URL (optional)" : "Image URL"}
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder={isFund ? "e.g. a photo of your destination" : undefined}
      />

      {/* Source URL only for non-funds (a fund has no "original product page") */}
      {!isFund && (
        <Input
          label="Source URL (original product page)"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      )}

      <div>
        <label
          htmlFor="category"
          className="text-sm font-medium text-lilac-900 block mb-1.5"
        >
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-text focus:outline-none focus:border-lilac-500 focus:ring-2 focus:ring-lilac-200 transition-colors"
        >
          <option value="">— No category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-lilac-900 cursor-pointer">
          <input
            type="checkbox"
            checked={isPriority}
            onChange={(e) => setIsPriority(e.target.checked)}
            className="w-4 h-4 accent-lilac-500"
          />
          Priority gift (highlight as most-wanted)
        </label>

        {/* Group-gift toggle hidden for funds (implicit) */}
        {!isFund && (
          <label className="flex items-center gap-2 text-sm text-lilac-900 cursor-pointer">
            <input
              type="checkbox"
              checked={isGroupGift}
              onChange={(e) => setIsGroupGift(e.target.checked)}
              className="w-4 h-4 accent-lilac-500"
            />
            Group gift (multiple guests can contribute)
          </label>
        )}
      </div>

      {/* Target only for non-fund group gifts */}
      {!isFund && isGroupGift && (
        <Input
          label="Target Amount (£)"
          type="number"
          step="0.01"
          min="0"
          value={groupGiftTarget}
          onChange={(e) => setGroupGiftTarget(e.target.value)}
          placeholder="Total amount needed to fully fund this gift"
        />
      )}

      {error && (
        <p className="text-sm text-error text-center" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Saving..." : giftId ? "Save Changes" : "Add Gift"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
