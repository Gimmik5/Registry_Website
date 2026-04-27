// ============================================================
// GROUP GIFT METER
// ------------------------------------------------------------
// Shows funding progress for a group gift: "£X of £Y raised"
// with a progress bar underneath.
// ============================================================

import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatPrice } from "@/lib/utils/formatting";

interface GroupGiftMeterProps {
  raised: number;
  target: number;
}

export function GroupGiftMeter({ raised, target }: GroupGiftMeterProps) {
  const remaining = Math.max(0, target - raised);
  const isFull = raised >= target;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline text-sm">
        <span className="font-medium text-lilac-900">
          {formatPrice(raised)} raised
        </span>
        <span className="text-text-muted text-xs">
          of {formatPrice(target)}
        </span>
      </div>
      <ProgressBar
        value={raised}
        max={target}
        label={`${formatPrice(raised)} of ${formatPrice(target)} raised`}
      />
      {!isFull && (
        <p className="text-xs text-text-muted">
          {formatPrice(remaining)} to go
        </p>
      )}
    </div>
  );
}
