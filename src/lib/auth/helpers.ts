// ============================================================
// AUTH HELPER FUNCTIONS
// ------------------------------------------------------------
// Small, reusable helpers for checking who is logged in and
// what role they have. Used by server components and API
// routes to enforce access control.
// ============================================================

import { redirect } from "next/navigation";
import { auth } from "./config";
import type { Role } from "@prisma/client";

/**
 * Get the current session, or null if not logged in.
 */
export async function getSession() {
  return auth();
}

/**
 * Require that the user is logged in. If not, redirect to login.
 * Returns the session so callers can use user info.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Require that the user has a specific role.
 * Redirects to login if not authenticated; to home if wrong role.
 */
export async function requireRole(role: Role) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== role) {
    redirect("/");
  }
  return session;
}
