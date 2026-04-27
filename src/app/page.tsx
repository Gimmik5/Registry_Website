// ============================================================
// HOME PAGE (LANDING PAGE)
// ------------------------------------------------------------
// The first page visitors see. For now, it's a simple welcome
// that confirms the lilac theme is working. We'll expand this
// with hero imagery, couple photos, and the registry link once
// authentication is in place.
// ============================================================

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-2xl">
        {/* Hero heading */}
        <p className="text-sm uppercase tracking-[0.3em] text-lilac-700 mb-4">
          You&apos;re invited to the wedding of
        </p>
        <h1 className="text-5xl sm:text-7xl font-normal text-lilac-900 mb-6">
          Em &amp; Gid
        </h1>
        <p className="text-xl text-lilac-700 italic mb-12">
          at Quendon
        </p>

        {/* Divider ornament */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-16 bg-lilac-300" />
          <span className="text-lilac-400 text-2xl">&#10047;</span>
          <div className="h-px w-16 bg-lilac-300" />
        </div>

        {/* Subtext */}
        <p className="text-text-muted max-w-lg mx-auto leading-relaxed mb-10">
          Welcome to our wedding registry. Sign in with the credentials
          shared in your invitation to browse our gift list.
        </p>

        {/* Call-to-action button */}
        <a
          href="/login"
          className="inline-block bg-lilac-500 hover:bg-lilac-600 text-white font-medium px-8 py-3 rounded-full transition-colors shadow-md hover:shadow-lg"
        >
          Sign In
        </a>
      </div>

      {/* Temporary footer showing the theme is live */}
      <p className="absolute bottom-6 text-xs text-text-muted">
        Lilac theme active &middot; Development preview
      </p>
    </main>
  );
}
