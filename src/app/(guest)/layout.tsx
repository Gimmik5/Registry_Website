// ============================================================
// GUEST SECTION LAYOUT
// ------------------------------------------------------------
// Wraps every guest-facing page (/registry, /gift, /checkout)
// with the guest header. Because (guest) is a route group
// (parentheses), it adds layout without changing the URL.
// ============================================================

import type { ReactNode } from "react";
import { GuestHeader } from "@/components/layout/GuestHeader";

export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GuestHeader />
      {children}
    </>
  );
}
