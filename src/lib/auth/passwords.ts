// ============================================================
// PASSWORD HASHING UTILITIES
// ------------------------------------------------------------
// We never store passwords in plain text. Instead we store a
// "hash" — a one-way transformation of the password. Even if
// the database is leaked, the original passwords can't be
// recovered from the hashes.
//
// Using bcrypt: the industry standard for password hashing.
// It's deliberately slow, which makes brute-force attacks
// impractical.
// ============================================================

import bcrypt from "bcryptjs";

// How computationally expensive the hash should be.
// Higher = slower = more secure. 12 is a good balance.
const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password for storage in the database.
 *
 * @param plainPassword The password the user entered
 * @returns A hashed string safe to store in the database
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Check if a plain-text password matches a stored hash.
 *
 * @param plainPassword The password the user just entered on login
 * @param hashedPassword The hash we stored in the database
 * @returns true if they match, false otherwise
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
