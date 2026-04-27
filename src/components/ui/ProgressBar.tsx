// ============================================================
// PROGRESS BAR
// ------------------------------------------------------------
// Simple visual progress indicator. Used for group-gift funding
// but also reusable anywhere else progress needs to be shown.
// ============================================================

interface ProgressBarProps {
  /** Current value (e.g. amount raised) */
  value: number;
  /** Maximum value (e.g. group gift target) */
  max: number;
  /** Optional accessible label */
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  // Clamp percentage between 0 and 100
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const isFull = percent >= 100;

  return (
    <div
      className="w-full h-2 bg-lilac-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isFull ? "bg-success" : "bg-lilac-500"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
