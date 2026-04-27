// ============================================================
// NEW GIFT FLOW
// ------------------------------------------------------------
// Three ways to add an item to the registry:
//   1. Paste a product URL (scrape name/image/price)
//   2. Add a custom item (blank form, fixed price)
//   3. Add a fund (open-ended contributions — e.g. honeymoon)
// ============================================================

"use client";

import { useState } from "react";
import { UrlScrapeInput, type ScrapedProduct } from "./UrlScrapeInput";
import { GiftForm, type GiftFormInitialValues } from "@/components/gift/GiftForm";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
}

interface NewGiftFlowProps {
  categories: Category[];
}

type Mode = "choose" | "scrape" | "custom" | "fund" | "review";

export function NewGiftFlow({ categories }: NewGiftFlowProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [scraped, setScraped] = useState<ScrapedProduct | null>(null);

  // Step 1 — user picks their starting point
  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-text-muted text-center mb-2">
          How would you like to add a gift?
        </p>
        <Button onClick={() => setMode("scrape")}>
          Paste a Product URL
        </Button>
        <Button variant="secondary" onClick={() => setMode("custom")}>
          Add a Custom Item
        </Button>
        <Button variant="secondary" onClick={() => setMode("fund")}>
          Create a Fund (e.g. Honeymoon)
        </Button>
      </div>
    );
  }

  // Step 2a — scrape URL and show preview form
  if (mode === "scrape" && !scraped) {
    return (
      <div className="flex flex-col gap-4">
        <UrlScrapeInput
          onScraped={(data) => {
            setScraped(data);
            setMode("review");
          }}
        />
        <button
          type="button"
          onClick={() => setMode("choose")}
          className="text-sm text-lilac-700 hover:text-lilac-900 underline self-center"
        >
          Back
        </button>
      </div>
    );
  }

  // Step 2b — custom item (fixed price, not scraped)
  if (mode === "custom") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted text-center">
          Custom items are useful for experiences or anything without an
          online product page. A single guest pays the full price.
        </p>
        <GiftForm
          categories={categories}
          initialValues={{ isCustom: true }}
        />
      </div>
    );
  }

  // Step 2c — fund (open-ended contributions)
  if (mode === "fund") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted text-center">
          A fund lets any guest contribute any amount toward something like a
          honeymoon, home deposit, or experience. Each contribution is
          recorded separately.
        </p>
        <GiftForm
          categories={categories}
          initialValues={{
            isCustom: true,
            isFund: true,
            isGroupGift: true, // funds use the group-gift plumbing
          }}
        />
      </div>
    );
  }

  // Step 3 — review scraped data (editable)
  if (mode === "review" && scraped) {
    const initial: GiftFormInitialValues = {
      name: scraped.title ?? "",
      description: scraped.description,
      price: scraped.price,
      imageUrl: scraped.imageUrl,
      sourceUrl: scraped.sourceUrl,
      isCustom: false,
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="bg-lilac-50 border border-lilac-200 rounded-lg p-4 text-sm text-lilac-900">
          Product details scraped successfully. Review and edit before saving.
        </div>
        <GiftForm categories={categories} initialValues={initial} />
      </div>
    );
  }

  return null;
}
