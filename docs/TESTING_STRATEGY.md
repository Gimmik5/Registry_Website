# Testing Strategy

No tests have been written yet. This document outlines what to add when Phase 6 begins, in priority order.

**When to write tests:** before deploying to production, but after the feature behaviour is confirmed manually. Trying to TDD a brand-new feature you haven't fully designed slows you down — the tests cement the wrong contract.

---

## Frameworks

| Layer | Framework | Why |
|---|---|---|
| Unit + integration | **Vitest** | Fast, native TypeScript, Jest-compatible API, plays nicely with Vite/Next |
| End-to-end (E2E) | **Playwright** | Real browser, multi-browser support, great DX, screenshots on failure |
| (Optional) component snapshots | Vitest with `@testing-library/react` | Light visual regression for key components |

---

## Setup

```bash
# Unit + integration
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom

# E2E
npm install -D @playwright/test
npx playwright install   # downloads browser binaries
```

Add scripts to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

Create `vitest.config.ts` at the project root, and `playwright.config.ts`.

---

## Folder structure

```
__tests__/
├── unit/                    # pure functions, isolated
│   ├── scraper.test.ts
│   ├── validators.test.ts
│   ├── formatting.test.ts
│   └── passwords.test.ts
├── integration/             # API routes + database
│   ├── auth.test.ts
│   ├── gifts-api.test.ts
│   ├── checkout-api.test.ts
│   └── webhook.test.ts
└── e2e/                     # full user flows in a browser
    ├── guest-flow.spec.ts
    └── admin-flow.spec.ts
```

---

## Priority test areas

In order of importance — write top-down, ship after the first 5.

### 1. Auth boundaries (`src/lib/auth/helpers.ts`)
**Why first:** every secured page depends on these. A regression breaks the whole admin area.

Test cases:
- `requireAuth()` returns the session when logged in
- `requireAuth()` redirects to `/login` when not logged in
- `requireRole("ADMIN")` allows admins
- `requireRole("ADMIN")` redirects guests to `/`
- `requireRole("GUEST")` allows both guests and admins (or rejects admins — confirm intended behaviour first)

### 2. Scraper safety (`src/lib/scraper/validators.ts`, `parsers.ts`)
**Why:** the scraper makes server-side HTTP requests. SSRF protection MUST work.

Test cases for `isSafeUrl`:
- Allows real https product URLs
- Rejects `http://localhost:3000`
- Rejects `http://127.0.0.1`
- Rejects `http://10.0.0.1`, `http://192.168.1.1`, `http://172.16.0.1` (private IPs)
- Rejects `http://169.254.169.254` (AWS metadata)
- Rejects non-http(s) protocols (`file://`, `ftp://`, `gopher://`)
- Rejects malformed URLs

For `parsers.ts`, test against fixture HTML files (capture real product pages):
- Extracts title from `<meta property="og:title">` first, falls back to `<title>`
- Extracts price from JSON-LD even when the HTML has multiple ld+json blocks
- Returns null when no price data is found (rather than guessing)
- Resolves relative image URLs against the page URL

### 3. Group gift / fund transaction (`src/lib/database/gifts.ts::incrementGroupGiftRaised`)
**Why:** the most complex business logic. A bug here means money tracking goes wrong.

Test cases (with real test DB, no mocks):
- Group gift below target: increments `groupGiftRaised`, sets `status = PARTIALLY_FUNDED`
- Group gift hits target: marks `status = PURCHASED`
- Group gift goes over target (shouldn't happen via API, but defensive): marks PURCHASED
- Fund: increments raised, NEVER marks PURCHASED regardless of target
- Concurrent contributions: two transactions running in parallel both succeed and both increments stick (the `increment` operator is atomic)

### 4. Webhook idempotency (`src/app/api/webhooks/stripe/route.ts`)
**Why:** Stripe retries on failure. Double-processing must not double-credit a fund.

Test cases (mocking the Stripe SDK signature verification):
- First `checkout.session.completed` for a session: marks Purchase COMPLETED, increments fund
- Second identical event for the same session: no-op (Purchase already COMPLETED, fund total unchanged)
- Event for an unknown session id: logs error, returns 200 (don't make Stripe retry forever)
- Invalid signature: returns 400, makes no DB changes
- `checkout.session.expired`: marks PENDING purchase as FAILED

### 5. Checkout amount validation (`src/app/api/checkout/route.ts`)
**Why:** server-authoritative amounts. Don't let a malicious client change the price.

Test cases:
- Fixed gift: server uses `gift.price` even if client sends a different amount
- Group gift: client amount accepted if ≤ remaining
- Group gift: client amount > remaining → 400 with helpful error
- Fund: any positive client amount accepted
- Already PURCHASED gift: 409 rejection
- DRAFT gift: 409 rejection
- Below £0.30 minimum: 400 rejection
- Missing giftId or guestName: 400 with field-specific error

### 6. E2E guest flow (`__tests__/e2e/guest-flow.spec.ts`)
Full happy path:
1. Log in as guest
2. Browse `/registry`
3. Click a gift
4. Enter contribution amount + name + message
5. Get redirected to Stripe (verify URL contains `checkout.stripe.com`)
6. (Stripe mock or skip the actual payment — stop here for E2E sanity)

### 7. E2E admin flow (`__tests__/e2e/admin-flow.spec.ts`)
1. Log in as admin
2. Add a custom gift via `/admin/gifts/new`
3. Publish it
4. Verify it appears on `/registry`
5. Edit it
6. Delete it (no purchases yet)

---

## Test database strategy

- **Unit tests**: no DB needed (pure functions)
- **Integration tests**: use a separate test database (e.g. a second Neon project) with its own connection string in `.env.test`
- Reset state with `npx prisma migrate reset --force --skip-seed` before each test file, then seed fresh data per test

---

## Mocking external services

- **Stripe SDK**: mock `stripe.checkout.sessions.create` to return a fake session object. Never make real Stripe API calls in tests.
- **Stripe webhook signature verification**: in tests, swap `verifyWebhookEvent` for a function that just returns the event. The signature logic itself is tested by Stripe.
- **fetch (URL scraper)**: use `vi.spyOn(global, 'fetch')` to return fixture HTML
- **Email (Resend)**: when added in Phase 5, mock the `Resend.emails.send` method

Never mock the database — always use a real (test) DB. Mocks of Prisma drift from reality and miss real bugs.

---

## CI

Once tests exist, add a GitHub Action at `.github/workflows/ci.yml`:
- Runs on every push and PR
- Spins up a test PostgreSQL container
- Runs `npm run lint`, `npm run test:run`, optionally `npm run test:e2e`
- Blocks merging on failure

---

## Delegate to the testing subagent

The `testing` subagent at `.claude/agents/testing.md` knows the conventions:
- Test behaviour, not implementation
- Meaningful test names ("rejects login with incorrect password", not "test1")
- Arrange-Act-Assert structure
- One behaviour per test
- Don't mock the database

Invoke it with the `Agent` tool when writing tests, e.g.:
```
Agent({
  subagent_type: "testing",
  description: "Write scraper validator tests",
  prompt: "Write Vitest unit tests for src/lib/scraper/validators.ts covering all the SSRF protection cases listed in docs/TESTING_STRATEGY.md priority area 2. Use Arrange-Act-Assert. ..."
})
```

---

## What NOT to test

- **Prisma itself** — Prisma's tests are not your problem
- **Stripe SDK** — same
- **Trivial getters/setters** — no logic, no test
- **Page rendering snapshots** — too brittle, breaks on every UI tweak
- **The framework** — don't write tests that effectively test "does Next.js handle a GET request?"

The goal is confidence in your business logic, not 100% line coverage.
