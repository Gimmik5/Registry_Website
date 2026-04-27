// ============================================================
// AUTH TYPE EXTENSIONS
// ------------------------------------------------------------
// NextAuth has its own default types for Session and User.
// We extend them here so TypeScript knows about the custom
// `role` field we attach to sessions.
// ============================================================

import type { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `auth()`, `useSession()` and the JWT callback
   */
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
    };
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
