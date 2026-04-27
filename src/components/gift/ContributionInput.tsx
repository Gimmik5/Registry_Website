// ============================================================
// CONTRIBUTION INPUT
// ------------------------------------------------------------
// Amount input shown on the gift detail page for:
//   - Funds: guest types any amount (with an optional suggestion)
//   - Group gifts: guest types how much they want to contribute
//                  toward the target (clamped to remaining amount)
//
// On submit, redirects to /checkout with the chosen amount.
// Fixed-price gifts use a simpler button (no amount input).
// ============================================================

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/formatting";

interface ContributionInputProps {
  giftId: string;
  /** Optional suggested amount (placeholder only) */
  suggestedAmount?: number;
  /** Maximum allowed — for group gifts with a target */
  maxAmount?: number;
  /** Button label — e.g. "Contribute" or "Pay Now" */
  buttonLabel: string;
}

export function ContributionInput({
  giftId,
  suggestedAmount,
  maxAmount,
  buttonLabel,
}: ContributionInputProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(
    suggestedAmount ? String(suggestedAmount) : ""
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }
    if (maxAmount !== undefined && parsed > maxAmount) {
      setError(
        `This gift only needs ${formatPrice(maxAmount)} more. Please lower your amount.`
      );
      return;
    }

    // Pass amount to the checkout page via query string
    router.push(`/checkout?giftId=${giftId}&amount=${parsed}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        label="Your contribution (£)"
        type="number"
        step="0.01"
        min="0.01"
        max={maxAmount}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={
          suggestedAmount ? `e.g. ${suggestedAmount}` : "Any amount you like"
        }
        required
      />

      {maxAmount !== undefined && (
        <p className="text-xs text-text-muted -mt-1">
          Up to {formatPrice(maxAmount)} remaining
        </p>
      )}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full">
        {buttonLabel}
      </Button>
    </form>
  );
}
