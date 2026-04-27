// ============================================================
// ROUTE PROTECTION PROXY (Next.js 16 middleware)
// ------------------------------------------------------------
// Runs BEFORE every matching page loads. Checks whether the
// user is logged in and has the right role; redirects them
// to /login (or home) if not.
//
// Note: In Next.js 16 this was renamed from "middleware" to
// "proxy" but the functionality is identical.
//
// Protected routes:
//   /admin/**    — ADMIN role required
//   /registry/** — any logged-in user (guest or admin)
//   /gift/**     — any logged-in user
//   /checkout/** — any logged-in user
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Which paths this proxy applies to.
// Everything else (including /login, /, /api/auth) skips the proxy.
export const config = {
  matcher: ["/admin/:path*", "/registry/:path*", "/gift/:path*", "/checkout/:path*"],
};

export async function proxy(request: NextRequest) {
  // Read the NextAuth JWT token from the session cookie
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // In production the cookie is prefixed with __Secure-
    secureCookie: process.env.NODE_ENV === "production",
  });

  const { pathname } = request.nextUrl;

  // Not logged in → redirect to login page
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only paths — reject guests
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/registry", request.url));
  }

  // Logged in and authorised → continue
  return NextResponse.next();
}
