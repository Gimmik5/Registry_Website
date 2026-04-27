# Command Cheat Sheet

Quick reference for the commands you'll use day-to-day. The **Teacher agent** keeps this updated — whenever a new useful command appears in the project, it gets added here.

All commands are run from the project root:
`C:\Users\Gideon Bergbaum\Documents\Personal Projects\Registry_Website`

---

## Project Paused — Resuming?

The project is paused as of 2026-04-27 with Phases 1–4 complete. To resume:

1. Read `docs/HANDOFF.md` — the entry point that explains everything
2. Read `docs/STATUS.md` — what's done, what's not
3. Pick your next task from the queue:
   - Verify Stripe end-to-end → `docs/STRIPE_VERIFICATION.md`
   - Deploy to production → `docs/DEPLOYMENT.md`
   - Add tests → `docs/TESTING_STRATEGY.md`
   - Make design changes → `docs/DESIGN_GUIDE.md`

---

## Running the Website Locally

| What you want to do | Command |
|---|---|
| **Start the dev server** (view site at http://localhost:3000) | `npm run dev` |
| **Stop the dev server** | Press `Ctrl+C` in the terminal |
| **Restart the dev server** (after env changes) | `Ctrl+C` then `npm run dev` |
| Open the site in browser | Visit [http://localhost:3000](http://localhost:3000) |

## Testing Stripe Payments Locally

For Stripe webhooks to work during local development, you need the **Stripe CLI** to forward real Stripe events to your local server.

| What you want to do | Command |
|---|---|
| **Install Stripe CLI** (one time) | See [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli#install) |
| **Log in to Stripe** (one time) | `stripe login` |
| **Start forwarding webhooks** to local dev server | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| **Get the webhook signing secret** | The `stripe listen` command prints one — copy it into `STRIPE_WEBHOOK_SECRET` in `.env.local` |

### Test card numbers

Use these in Stripe's test mode — no real money moves:
- **Success:** `4242 4242 4242 4242`
- **Requires authentication:** `4000 0025 0000 3155`
- **Declined:** `4000 0000 0000 0002`
- Expiry: any future date (e.g. `12/34`)
- CVC: any 3 digits (e.g. `123`)
- ZIP/postcode: any (e.g. `SW1A 1AA`)

## Key Pages (once logged in)

| URL | Who can see it | What it does |
|---|---|---|
| `/` | Everyone | Landing page |
| `/login` | Everyone | Login form |
| `/registry` | Any logged-in user | Gift list with search and category filters |
| `/gift/[id]` | Any logged-in user | Detail view of a single gift |
| `/checkout?giftId=...` | Any logged-in user | Checkout form (name, message) then redirects to Stripe |
| `/checkout/success` | Any logged-in user | Landing page after successful payment |
| `/checkout/cancelled` | Any logged-in user | Landing page if guest cancels the Stripe flow |
| `/admin` | Admin only | Admin dashboard with stats and links |
| `/admin/gifts` | Admin only | Manage all gifts (publish, edit, delete) |
| `/admin/gifts/new` | Admin only | Add a gift — paste URL, create custom, or set up a fund |
| `/admin/gifts/[id]/edit` | Admin only | Edit a specific gift |
| `/admin/categories` | Admin only | Manage gift categories |

> **Tip:** Once the dev server is running, any changes you save to files will automatically refresh in the browser. No need to restart.

---

## Database Commands

| What you want to do | Command |
|---|---|
| **View the database visually** (GUI for your tables) | `npm run db:studio` |
| **Create a migration** after changing `schema.prisma` | `npm run db:migrate` |
| **Regenerate Prisma types** (if TypeScript errors about Prisma) | `npm run db:generate` |
| **Push schema changes without a migration** (dev only, loses data) | `npm run db:push` |
| **Seed the database** with test data | `npm run db:seed` |
| **Reset the database** (wipe all data — destructive!) | `npm run prisma -- migrate reset` |

---

## Git Commands

| What you want to do | Command |
|---|---|
| See what files have changed | `git status` |
| See the actual changes line-by-line | `git diff` |
| Stage all changes for commit | `git add .` |
| Stage a specific file | `git add path/to/file` |
| Commit staged changes | `git commit -m "Your message here"` |
| View recent commits | `git log --oneline -10` |
| Push to GitHub (when set up) | `git push` |
| Pull latest from GitHub | `git pull` |

---

## Dependency Management

| What you want to do | Command |
|---|---|
| Install all dependencies (after `git pull` or fresh clone) | `npm install` |
| Add a new package | `npm install <package-name>` |
| Add a dev-only package (tools, types) | `npm install -D <package-name>` |
| Remove a package | `npm uninstall <package-name>` |
| Update all packages | `npm update` |
| Check for outdated packages | `npm outdated` |

---

## Code Quality

| What you want to do | Command |
|---|---|
| Check code for style issues | `npm run lint` |
| Check TypeScript types across the project | `npx tsc --noEmit` |
| Run tests | `npm run test` _(once tests are added)_ |

---

## Environment Variables

| What you want to do | How |
|---|---|
| Edit local secrets | Open `.env.local` in your editor |
| See what variables are needed | Open `.env.example` |
| Apply `.env.local` changes | Restart the dev server (Ctrl+C, then `npm run dev`) |

> **Important:** Never commit `.env.local` or share its contents. It's git-ignored for safety.

---

## Troubleshooting Quick Fixes

| Problem | Try this |
|---|---|
| "Port 3000 already in use" | `npm run dev -- -p 3001` (uses port 3001 instead) |
| "Module not found" after pulling changes | `npm install` |
| Prisma types missing / red squiggles | `npm run db:generate` |
| Environment variables not loading | Restart the dev server |
| Stuck, general errors | Delete `node_modules` and `.next` folders, then `npm install` |

For a full troubleshooting guide, see `README.md`.

---

## Asking for Help

| Who to ask | When |
|---|---|
| **Teacher agent** | "Explain what this file does" — any file, any concept |
| **Frontend agent** | Building or editing UI components, pages, forms |
| **Backend agent** | API routes, authentication, URL scraping |
| **Database agent** | Schema changes, queries, migrations |
| **Payments agent** | Anything Stripe-related |
| **Design agent** | Colours, fonts, layout, responsive design |
| **Testing agent** | Writing and running tests |

---

## Project Directory Structure Quick Reference

```
Registry_Website/
├── docs/                 ← Documentation (this file, PLAN.md)
├── prisma/               ← Database schema and migrations
├── public/               ← Static files (images, favicon)
├── src/
│   ├── app/              ← Pages and API routes (each folder = URL)
│   ├── components/       ← Reusable UI pieces
│   ├── lib/              ← Business logic (auth, database, stripe, etc.)
│   ├── hooks/            ← React hooks
│   ├── types/            ← TypeScript type definitions
│   └── middleware.ts     ← Route protection
├── .env.local            ← Your secrets (git-ignored)
├── .env.example          ← Template for secrets
├── package.json          ← Dependencies and scripts
├── README.md             ← Setup and troubleshooting
└── CLAUDE.md             ← Agent configuration
```

---

_Last updated by the Teacher agent as new commands become relevant to the project._
