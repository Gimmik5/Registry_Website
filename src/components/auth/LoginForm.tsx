// ============================================================
// LOGIN FORM
// ------------------------------------------------------------
// The interactive login form. Marked "use client" because it
// handles user input (state, events) which must run in the
// browser, not on the server.
//
// On submit:
//   1. Call NextAuth's signIn() with credentials
//   2. On success → redirect to the right place (admin vs guest)
//   3. On failure → show an error message
// ============================================================

"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    // Attempt login via NextAuth
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // We handle the redirect ourselves
    });

    setSubmitting(false);

    if (!result || result.error) {
      setError("Incorrect username or password. Please try again.");
      return;
    }

    // Success — get the session to check the role, then redirect
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/registry");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Username"
        type="text"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoFocus
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <p className="text-sm text-error text-center" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
