// ============================================================
// INPUT COMPONENT
// ------------------------------------------------------------
// A labelled text input styled with the lilac theme.
// Used for any form field (login, gift form, checkout, etc.).
// ============================================================

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...rest }: InputProps) {
  // Generate a stable id if one wasn't provided (for the label to link to)
  const inputId = id ?? `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-lilac-900"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          px-4 py-2.5 rounded-lg
          bg-surface border border-border
          text-text placeholder:text-text-muted
          focus:outline-none focus:border-lilac-500 focus:ring-2 focus:ring-lilac-200
          transition-colors
          ${error ? "border-error focus:border-error focus:ring-red-100" : ""}
          ${className}
        `}
        {...rest}
      />
      {error && (
        <p className="text-sm text-error mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
