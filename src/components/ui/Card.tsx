// ============================================================
// CARD COMPONENT
// ------------------------------------------------------------
// A generic surface for grouping content. Used by forms, gift
// cards, dashboard panels, etc.
// ============================================================

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl shadow-sm border border-border p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
