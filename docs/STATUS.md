# Project Status — 2026-04-27

A point-in-time snapshot of the wedding registry website at pause.

---

## Phases Complete

### ✅ Phase 1 — Foundation
- Next.js 16 + TypeScript + Tailwind CSS v4 scaffold
- Prisma 6 wired to Neon (cloud PostgreSQL)
- Two migrations applied: `init` and `add_is_fund`
- NextAuth v5 (beta) with credentials provider — admin + guest tiers
- Route protection via `src/proxy.ts` (Next.js 16's renamed middleware)
- Lilac/gold theme defined as CSS variables in `src/app/globals.css`
- Playfair Display (headings) + Inter (body) fonts loaded
- Landing page at `/` with hero + sign-in CTA

### ✅ Phase 2 — Admin Gift Management
- URL scraper using cheerio with SSRF protection (`src/lib/scraper/`)
- Admin preview-then-edit flow after scrape
- Three gift creation modes: scrape URL / custom item / open-ended fund
- Categories CRUD
- Draft → Published lifecycle with publish/unpublish toggle
- Priority flagging
- Post-publish editing

### ✅ Phase 3 — Guest Experience
- Registry grid with category pills, search, and result count
- Gift detail page with image, description, contribution UI
- Group gift progress meter (`£X of £Y raised`)
- Fund total display (`£X contributed so far`)
- Per-gift contributor list (name + amount)
- Purchased items greyed out, sorted to bottom, not clickable
- Mobile-responsive (1/2/3/4 column grid)

### ✅ Phase 4 — Payments (code complete, **end-to-end test pending**)
- Stripe SDK installed and wired
- `POST /api/checkout` creates a session with server-authoritative amounts
- `POST /api/webhooks/stripe` verifies signature and is idempotent
- Each contribution saved as its own `Purchase` row (per user requirement)
- Group gifts auto-close when target met; funds stay open indefinitely
- Success and cancelled landing pages

---

## What Works Today (manually verified during build)

- Login as `admin` or `guests` (passwords from `.env.local`)
- Adding a gift via URL scrape (e.g. John Lewis product page)
- Adding a custom gift or fund
- Publishing/unpublishing gifts
- Browsing the registry with filters and search
- Clicking through to gift detail
- Submitting the checkout form → being redirected to Stripe's hosted page

## What Needs Verification

- The full Stripe round-trip: pay on Stripe → webhook fires → Purchase row marked COMPLETED → gift status updates correctly. This is the **first thing to do on resumption** — see `docs/STRIPE_VERIFICATION.md`.

---

## Known Limitations & Intentional Shortcuts

| Area | Current state | When to address |
|---|---|---|
| **Email notifications** | None — admin won't be notified of purchases, guests won't get receipts | Phase 5 (Resend integration) |
| **Image optimization** | All scraped images use `unoptimized` (loaded as-is from source CDN) | Phase 6 polish — could add Cloudinary if performance matters |
| **Rate limiting** | None on login, scrape, or checkout endpoints | Phase 6 security hardening |
| **CSRF protection** | NextAuth provides session-cookie CSRF; no extra middleware | Phase 6 — audit and add if needed |
| **Security headers** | None set (no CSP, X-Frame-Options, etc.) | Phase 6 |
| **Drag-to-reorder gifts** | Admin can edit `displayOrder` but no drag UI | Phase 5 polish |
| **Site content editor** | Site copy is hardcoded in pages — no admin UI to edit hero text or upload couple photos | Phase 5 |
| **Thank-you tracker UI** | DB schema supports it (`thanked` flag), no admin page yet | Phase 5 |
| **Tests** | Zero. Framework not yet installed | Phase 6 — see `docs/TESTING_STRATEGY.md` |
| **Domain** | Not registered. Local-only at `http://localhost:3000` | Phase 7 deployment |
| **Production deployment** | Not deployed. Code lives only on local machine + GitHub | Phase 7 — see `docs/DEPLOYMENT.md` |
| **Stripe mode** | Test keys only. Real money never moves | Phase 7 — switch to live keys at deploy time |

---

## Tech Stack Versions (pinned in `package.json`)

| Package | Version | Notes |
|---|---|---|
| `next` | 16.2.4 | Uses Turbopack dev server, App Router, `proxy.ts` (renamed from middleware) |
| `react` / `react-dom` | 19.2.4 | |
| `typescript` | ^5 | Strict mode |
| `tailwindcss` | ^4 | New `@theme inline` config syntax |
| `prisma` / `@prisma/client` | ^6.19.3 | Stayed on v6 (v7 has new config pattern still settling) |
| `next-auth` | ^5.0.0-beta.31 | v5 beta — Auth.js |
| `stripe` | latest | API version pinned in `src/lib/stripe/client.ts` |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `cheerio` | latest | URL scraping |
| `dotenv-cli` / `tsx` | dev only | For `npm run db:*` scripts and seed |

Node.js: v18+ required.

---

## File Counts (source code)

| Type | Count |
|---|---|
| Pages (`src/app/**/page.tsx`) | 12 |
| API routes (`src/app/api/**/route.ts`) | 7 |
| Components (`src/components/**/*.tsx`) | 22 |
| Lib modules (`src/lib/**/*.ts`) | 17 |
| Prisma migrations | 2 |
| Subagent definitions (`.claude/agents/`) | 7 |

---

## Repository

- GitHub: https://github.com/Gimmick5/Registry_Website
- Branch: `main`
- First commit lands as part of the pause (project was untracked until now)

## External Services

| Service | Purpose | Status |
|---|---|---|
| Neon | PostgreSQL database | Connected (test data optional via `npm run db:seed`) |
| Stripe | Payments | Test keys configured. Stripe CLI authenticated against sandbox `acct_1TProP1elPGLG7ek` |
| Cloudinary | Image hosting | Not yet used |
| Resend | Transactional email | Not yet used |
| Railway | Hosting | Not yet provisioned |
