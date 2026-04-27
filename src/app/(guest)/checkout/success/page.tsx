// ============================================================
// /checkout/success
// ------------------------------------------------------------
// Landing page after the guest completes payment on Stripe.
//
// NOTE: We don't rely on the guest hitting this page to record
// the payment — the webhook does that. This page just displays
// a thank-you message. If the webhook hasn't fired yet (rare,
// usually within a second or two), the Purchase will show as
// PENDING here, which is fine — the display is cosmetic.
// ============================================================

import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { getPurchaseBySessionId } from "@/lib/database/purchases";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/formatting";

type SearchParams = Promise<{ session_id?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();
  const { session_id } = await searchParams;

  const purchase = session_id
    ? await getPurchaseBySessionId(session_id)
    : null;

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-lg mx-auto">
        <Card>
          <div className="text-center flex flex-col items-center gap-4">
            {/* Success mark */}
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success text-3xl">
              &#10003;
            </div>

            <h1 className="text-3xl text-lilac-900">Thank you!</h1>

            {purchase ? (
              <>
                <p className="text-text-muted leading-relaxed">
                  Your contribution of{" "}
                  <span className="font-medium text-lilac-900">
                    {formatPrice(purchase.amount)}
                  </span>{" "}
                  towards <span className="text-lilac-900">{purchase.gift.name}</span>{" "}
                  has been received.
                </p>
                <p className="text-text-muted leading-relaxed">
                  Em &amp; Gid will be notified and, if you entered an email
                  address, a receipt is on its way.
                </p>
              </>
            ) : (
              <p className="text-text-muted leading-relaxed">
                Your payment was successful. Em &amp; Gid will be thrilled!
              </p>
            )}

            <div className="flex gap-3 mt-4">
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
