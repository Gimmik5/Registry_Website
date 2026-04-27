// ============================================================
// GUEST HEADER
// ------------------------------------------------------------
// Top navigation bar for the guest-facing section of the site.
// Shows the couple name (linking to the registry), and a
// sign-out button on the right.
// ============================================================

import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function GuestHeader() {
  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/registry"
          className="flex flex-col leading-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-xs uppercase tracking-[0.25em] text-lilac-700">
            Em &amp; Gid
          </span>
          <span className="text-sm text-text-muted italic">at Quendon</span>
        </Link>

        <SignOutButton />
      </div>
    </header>
  );
}
