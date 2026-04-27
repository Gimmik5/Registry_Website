// ============================================================
// AUTH (SESSION) PROVIDER
// ------------------------------------------------------------
// Wraps the app with NextAuth's SessionProvider so client
// components can use useSession(), signIn(), and signOut().
// ============================================================

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
