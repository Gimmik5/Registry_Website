// ============================================================
// SIGN-OUT BUTTON
// ------------------------------------------------------------
// A small client component wrapping NextAuth's signOut().
// Clicking ends the session and returns to the landing page.
// ============================================================

"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  return (
    <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </Button>
  );
}
