// ============================================================
// URL SCRAPE INPUT
// ------------------------------------------------------------
// Admin pastes a product URL → click "Fetch" → calls /api/scrape
// → returns the scraped data to the parent component via
// onScraped callback.
// ============================================================

"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface ScrapedProduct {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  sourceUrl: string;
}

interface UrlScrapeInputProps {
  onScraped: (data: ScrapedProduct) => void;
}

export function UrlScrapeInput({ onScraped }: UrlScrapeInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Failed to fetch page");
        return;
      }

      onScraped(json.data);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="Product URL"
        type="url"
        placeholder="https://www.johnlewis.com/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading || !url}>
        {loading ? "Fetching..." : "Fetch Product Details"}
      </Button>
    </form>
  );
}
