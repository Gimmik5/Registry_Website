// ============================================================
// BUTTON COMPONENT
// ------------------------------------------------------------
// A reusable button with theme-aware variants. Used everywhere
// a button appears so styles stay consistent.
//
// Variants:
//   primary   — lilac background (main CTAs)
//   secondary — outlined lilac
//   accent    — gold background (special highlights)
//   ghost     — transparent, text only
// ============================================================

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "accent" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-lilac-500 hover:bg-lilac-600 text-white shadow-md hover:shadow-lg",
  secondary:
    "bg-transparent border-2 border-lilac-500 text-lilac-700 hover:bg-lilac-50",
  accent:
    "bg-accent hover:bg-accent-dark text-white shadow-md hover:shadow-lg",
  ghost: "bg-transparent text-lilac-700 hover:bg-lilac-100",
};

export function Button({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        px-6 py-3 rounded-full font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
