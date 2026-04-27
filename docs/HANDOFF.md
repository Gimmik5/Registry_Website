# Handoff Guide — For the Next Claude Session

**Read this first.** This document is the entry point for resuming work on the wedding registry website. It tells you what state the project is in, what to do next, and where to find the detailed instructions for each task.

---

## What this project is

A custom wedding registry website for Em & Gid's wedding at Quendon. Guests log in with shared credentials, browse a curated gift list, and either buy items or contribute to funds — payments go to the couple via Stripe. The admin (Gideon) manages the list and tracks who bought what.

**Project owner:** Gideon Bergbaum. Learning web development as he goes — wants explanations alongside code, modular file structure, and the ability to make design changes easily.

---

## Read these in order

1. **`docs/HANDOFF.md`** — this file
2. **`docs/STATUS.md`** — exactly what's complete, what's pending, known limitations
3. **`docs/PLAN.md`** — the original implementation plan with phase checkboxes
4. **`docs/CHEATSHEET.md`** — daily commands (dev server, DB, git, Stripe testing)
5. **`CLAUDE.md`** — project conventions and agent governance
6. The relevant deep-dive doc for whatever you're about to do (see "What to do next" below)

Also check the user's persistent memory at:
```
~/.claude/projects/C--Users-Gideon-Bergbaum-Documents-Personal-Projects-Registry-Website/memory/MEMORY.md
```
That includes the user's profile, project context, and accumulated feedback (e.g. "highly modular code", "individual contribution tracking is essential for thank-yous").

---

## What to do next — ordered queue

The project is paused at the end of Phase 4 (Stripe code complete, end-to-end test pending). Here's the resumption order:

### 1. Verify Stripe end-to-end ⬅ **start here**
Stripe code is written but the full test (pay → webhook fires → DB updates → gift status changes) hasn't been done. The Stripe CLI is already configured against the user's sandbox.

→ Follow **`docs/STRIPE_VERIFICATION.md`**

### 2. Phase 5 — Admin polish
- Purchase tracking table at `/admin/purchases` (group by gift OR list per-row — but the per-row data must be available because each Purchase = one thank-you)
- Thank-you tracker (toggle the `thanked` boolean)
- Site content editor (hero text, photos)
- Email notifications (Resend) — admin gets pinged on each payment, guest gets a receipt

→ See `docs/PLAN.md` Phase 5 section. Use the `frontend` and `backend` subagents.

### 3. Phase 6 — Security & polish
- Rate limiting on `/api/auth`, `/api/scrape`, `/api/checkout`
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Input sanitisation audit
- Accessibility audit (WCAG 2.1 AA, screen reader, keyboard nav)
- 404 and error boundary pages
- SEO meta tags
- **Tests** — see `docs/TESTING_STRATEGY.md`

### 4. Phase 7 — Deploy to production
- Push to GitHub (already done as part of pause)
- Railway hosting setup
- Domain registration and DNS
- Switch Stripe to live mode
- Smoke test in production

→ Follow **`docs/DEPLOYMENT.md`**

### Throughout — Design changes
Any time the user wants to tweak colours, fonts, spacing, or layout:

→ Follow **`docs/DESIGN_GUIDE.md`**. Delegate to the `design` subagent for accurate, scoped changes.

---

## How the subagent workflow works

Seven specialised subagents are defined in `.claude/agents/`. You can invoke any of them with the `Agent` tool (`subagent_type: "frontend"` etc.) or the user can invoke them directly with `/agents`.

| Subagent | Use it for |
|---|---|
| `frontend` | React components, pages, forms, client interactivity |
| `backend` | API routes, auth, scraping, server logic |
| `database` | Prisma schema, migrations, query functions |
| `payments` | Stripe integration, checkout, webhooks |
| `testing` | Writing tests (Vitest, Playwright) |
| `teacher` | **Read-only.** Explains code/concepts. Maintains `docs/CHEATSHEET.md` |
| `design` | Theme colours, fonts, layout, UI primitives |

**When to delegate:**
- Open-ended exploration ("find every place X is used")
- Independent parallel work (frontend + backend simultaneously)
- Single-purpose tasks that match a subagent's scope cleanly
- When the user invokes a subagent by name

**When NOT to delegate:**
- Small, sequential edits — just do them in the main context
- When you already have the full context and a subagent would need re-briefing

---

## Useful conventions to remember

- **Highly modular** — one file = one responsibility. Favour many small files over fewer large ones.
- **Named exports** for components and utilities, not default exports.
- **TypeScript strict** — no `any`. Use Prisma's generated types.
- **Database access only via `src/lib/database/`** — never write Prisma queries inline in API routes or pages.
- **Always validate input** in API routes; always check auth (`requireAuth()`, `requireRole()`).
- **Theme colours via CSS variables** in `src/app/globals.css` — never hardcode hex in components.
- **Each contribution = its own `Purchase` row** — critical for thank-you tracking. Never aggregate.
- **Server-authoritative amounts** — for fixed gifts, ignore the client's submitted price; for fund/group contributions, validate against DB constraints.
- **Webhook handlers must be idempotent** — Stripe retries on failure.

---

## Known gotchas

- Next.js 16 renamed `middleware.ts` → `proxy.ts` and the export `middleware` → `proxy`. We use `proxy.ts`.
- Prisma generates types into `node_modules/@prisma/client`. If you see TypeScript errors after a schema change, run `npm run db:generate` (you may need to stop the dev server first on Windows due to file locking).
- `.env.local` (not `.env`) is what Next.js reads. Prisma CLI uses `dotenv-cli` to read the same file via wrapper npm scripts (`npm run db:migrate`, etc.).
- Neon's free tier auto-pauses after inactivity — first query after a quiet period might log an "administrator command" error and reconnect. Harmless.
- Webhook signatures fail if the request body is parsed before verification. The Stripe webhook route reads the raw body with `request.text()` — don't change that.

---

## If you're stuck

- Read the original plan file (`C:\Users\Gideon Bergbaum\.claude\plans\temporal-cuddling-summit.md`) for the most recent design decisions.
- Use the `Explore` subagent for any uncertain codebase question.
- Use the `teacher` subagent if the user asks "explain this".
- The user prefers terse, actionable responses with clear next steps.
