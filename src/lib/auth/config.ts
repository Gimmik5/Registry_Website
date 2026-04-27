// ============================================================
// NEXTAUTH CONFIGURATION
// ------------------------------------------------------------
// Sets up authentication for the website using NextAuth.js v5.
// We use the "Credentials" provider, which accepts a username
// and password (as opposed to Google/GitHub login).
//
// On successful login:
//   1. NextAuth creates a signed session cookie
//   2. The cookie is sent with every subsequent request
//   3. Middleware checks the cookie to protect routes
//
// Exports:
//   - handlers: GET and POST handlers for /api/auth/[...nextauth]
//   - auth:    helper to get the current session (server-side)
//   - signIn:  programmatic login
//   - signOut: programmatic logout
// ============================================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByUsername } from "@/lib/database/users";
import { verifyPassword } from "@/lib/auth/passwords";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT strategy (session stored in cookie, no DB lookup per request)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Which login methods are allowed
  providers: [
    Credentials({
      // Fields shown on the default NextAuth login page (we build our own)
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      /**
       * The authorize function runs when someone tries to log in.
       * Return the user object on success, or null on failure.
       */
      async authorize(credentials) {
        // Validate input
        const username = credentials?.username;
        const password = credentials?.password;

        if (
          typeof username !== "string" ||
          typeof password !== "string" ||
          !username ||
          !password
        ) {
          return null;
        }

        // Look up the user in the database
        const user = await findUserByUsername(username);
        if (!user) {
          return null;
        }

        // Check the password
        const passwordMatches = await verifyPassword(
          password,
          user.passwordHash
        );
        if (!passwordMatches) {
          return null;
        }

        // Return the user object (goes into the JWT)
        return {
          id: user.id,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],

  // Callbacks run at various points in the auth lifecycle
  callbacks: {
    /**
     * Attach the user's role to the JWT token when they log in.
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
      }
      return token;
    },

    /**
     * Attach the role from the JWT to the session object
     * so page components can read session.user.role.
     */
    async session({ session, token }) {
      if (session.user && token.role) {
        (session.user as { role?: Role }).role = token.role as Role;
      }
      return session;
    },
  },

  // Where to redirect for sign-in
  pages: {
    signIn: "/login",
  },
});
