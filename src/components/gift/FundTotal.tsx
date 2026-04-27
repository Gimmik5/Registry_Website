// ============================================================
// FUND TOTAL
// ------------------------------------------------------------
// Display for an open-ended fund (e.g. honeymoon). Shows the
// total amount contributed so far, but no target or progress
// bar — funds don't have a cap.
// ============================================================

import { formatPrice } from "@/lib/utils/formatting";

interface FundTotalProps {
  raised: number;
}

export function FundTotal({ raised }: FundTotalProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-lg font-medium text-lilac-900">
        {formatPrice(raised)}
      </p>
      <p className="text-xs text-text-muted">
        {raised > 0 ? "contributed so far" : "be the first to contribute"}
      </p>
    </div>
  );
}
