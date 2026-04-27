// ============================================================
// NEXTAUTH API ROUTE HANDLER
// ------------------------------------------------------------
// This file wires up the NextAuth handlers to the URL path
// /api/auth/*. NextAuth uses this single endpoint for all
// authentication flows: sign in, sign out, session check, etc.
//
// The actual logic lives in src/lib/auth/config.ts — this file
// just connects it to a Next.js route.
// ============================================================

import { handlers } from "@/lib/auth/config";

export const { GET, POST } = handlers;
