// ============================================================
// BADGE COMPONENT
// ------------------------------------------------------------
// Small status indicator (e.g. "Draft", "Purchased", "Priority").
// ============================================================

import type { ReactNode } from "react";

type BadgeVariant =
  | "draft"
  | "published"
  | "purchased"
  | "partial"
  | "priority"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  draft: "bg-lilac-100 text-lilac-700",
  published: "bg-green-100 text-green-800",
  purchased: "bg-purchased/20 text-lilac-900",
  partial: "bg-accent/20 text-accent-dark",
  priority: "bg-accent/20 text-accent-dark",
  neutral: "bg-lilac-50 text-text-muted",
};

export function Badge({ variant = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
