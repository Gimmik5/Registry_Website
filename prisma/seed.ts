// ============================================================
// DATABASE SEED SCRIPT
// ------------------------------------------------------------
// Populates the database with the admin and guest user
// accounts based on credentials in .env.local.
//
// Run with: npm run db:seed
// Safe to run multiple times — uses upsert so it won't create
// duplicates.
// ============================================================

import { hashPassword } from "../src/lib/auth/passwords";
import { upsertUser } from "../src/lib/database/users";
import { prisma } from "../src/lib/database/client";

async function main() {
  console.log("Seeding users from environment variables...");

  // Read credentials from environment
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const guestUsername = process.env.GUEST_USERNAME;
  const guestPassword = process.env.GUEST_PASSWORD;

  // Validate that all required env vars are set
  if (!adminUsername || !adminPassword) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env.local"
    );
  }
  if (!guestUsername || !guestPassword) {
    throw new Error(
      "GUEST_USERNAME and GUEST_PASSWORD must be set in .env.local"
    );
  }

  // Hash passwords before storing
  const adminPasswordHash = await hashPassword(adminPassword);
  const guestPasswordHash = await hashPassword(guestPassword);

  // Create or update the admin user
  await upsertUser(adminUsername, adminPasswordHash, "ADMIN");
  console.log(`  - Admin user "${adminUsername}" ready`);

  // Create or update the guest user
  await upsertUser(guestUsername, guestPasswordHash, "GUEST");
  console.log(`  - Guest user "${guestUsername}" ready`);

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
