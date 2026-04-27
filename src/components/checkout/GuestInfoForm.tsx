// ============================================================
// GUEST INFO FORM
// ------------------------------------------------------------
// The checkout form shown before redirecting to Stripe. Captures:
//   - Name (required)
//   - Personal message (optional)
//   - Email (optional — used to send a Stripe receipt)
//
// On submit:
//   1. POST to /api/checkout with the collected info + giftId + amount
//   2. Server creates a Stripe session, returns the hosted URL
//   3. We redirect the browser to the Stripe page
// ============================================================

"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface GuestInfoFormProps {
  giftId: string;
  amount: number;
  isFundOrGroup: boolean;
}

export function GuestInfoForm({
  giftId,
  amount,
  isFundOrGroup,
}: GuestInfoFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId,
          amount,
          guestName: name,
          guestMessage: message || null,
          guestEmail: email || null,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Failed to start checkout");
        setSubmitting(false);
        return;
      }

      // Redirect the browser to the Stripe-hosted payment page
      window.location.href = json.data.url;
    } catch {
      setError("Network error — please try again");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Your name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Who is this from?"
        required
        autoFocus
      />

      <Input
        label="Email (optional — for payment receipt)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <div>
        <label
          htmlFor="message"
          className="text-sm font-medium text-lilac-900 block mb-1.5"
        >
          A message for Em &amp; Gid (optional)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={
            isFundOrGroup
              ? "Wish them well, or leave a note with your contribution..."
              : "Congratulations, wishes for the future..."
          }
          maxLength={1000}
          className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-lilac-500 focus:ring-2 focus:ring-lilac-200 transition-colors resize-y"
        />
        <p className="text-xs text-text-muted mt-1">
          {message.length}/1000
        </p>
      </div>

      {error && (
        <p className="text-sm text-error text-center" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting
          ? "Redirecting to Stripe..."
          : `Continue to Payment (£${amount.toFixed(2)})`}
      </Button>

      <p className="text-xs text-text-muted text-center">
        Secure payment processed by Stripe. Your card details never touch our servers.
      </p>
    </form>
  );
}
