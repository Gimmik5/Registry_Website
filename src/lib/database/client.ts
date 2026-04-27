// ============================================================
// PRISMA CLIENT SINGLETON
// ------------------------------------------------------------
// Prisma creates a database connection pool. We want to reuse
// the SAME client across the whole app instead of creating a
// new one every time a file imports it.
//
// In development, Next.js hot-reloads files, which would create
// many clients and exhaust database connections. The `global`
// trick below keeps one client across reloads.
// ============================================================

import { PrismaClient } from "@prisma/client";

// Add `prisma` to the Node.js global type (development only)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse existing client if it exists, otherwise create a new one
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log queries in development to help with debugging
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// In development, attach the client to `global` so hot reloads reuse it
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
