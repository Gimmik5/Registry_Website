// ============================================================
// USER DATABASE QUERIES
// ------------------------------------------------------------
// All database operations involving the User model live here.
// API routes and auth logic import from this file instead of
// calling Prisma directly, so queries stay consistent and
// reusable.
// ============================================================

import { prisma } from "./client";
import type { Role, User } from "@prisma/client";

/**
 * Find a user by their username.
 * Returns null if no user exists with that username.
 */
export async function findUserByUsername(
  username: string
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { username },
  });
}

/**
 * Create or update a user (used by the seed script).
 * If a user with this username already exists, their password and role are updated.
 */
export async function upsertUser(
  username: string,
  passwordHash: string,
  role: Role
): Promise<User> {
  return prisma.user.upsert({
    where: { username },
    update: { passwordHash, role },
    create: { username, passwordHash, role },
  });
}
