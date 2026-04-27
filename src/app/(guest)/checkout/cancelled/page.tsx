// ============================================================
// /checkout/cancelled
// ------------------------------------------------------------
// Landing page if the guest backs out of the Stripe payment
// flow. The Purchase stays in PENDING status — the webhook
// will mark it FAILED when the Stripe session expires.
// ============================================================

import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function CheckoutCancelledPage() {
  await requireAuth();

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-lg mx-auto">
        <Card>
          <div className="text-center flex flex-col items-center gap-4">
            <h1 className="text-3xl text-lilac-900">Payment cancelled</h1>

            <p className="text-text-muted leading-relaxed">
              No worries — nothing was charged. The gift is still available
              if you&apos;d like to come back to it later.
            </p>

            <div className="flex gap-3 mt-2">
              <Link href="/registry">
                <Button>Back to registry</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
