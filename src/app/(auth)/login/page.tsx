// ============================================================
// LOGIN PAGE
// ------------------------------------------------------------
// URL: /login
// Server component that renders the login form.
// The LoginForm itself is a client component because it needs
// to handle form state and events.
// ============================================================

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-xl border border-border p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-lilac-700 mb-2">
              Em &amp; Gid at Quendon
            </p>
            <h1 className="text-3xl font-normal text-lilac-900 mb-2">
              Welcome
            </h1>
            <p className="text-sm text-text-muted">
              Please sign in with the credentials from your invitation.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-lilac-200" />
            <span className="text-lilac-400">&#10047;</span>
            <div className="h-px flex-1 bg-lilac-200" />
          </div>

          {/* The actual form (client component) */}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
