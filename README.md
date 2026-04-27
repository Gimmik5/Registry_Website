# Wedding Registry Website

A custom wedding registry website for Em & Gid's wedding at Quendon. A replacement for using off-the-shelf registry websites.

Built with Next.js 16, TypeScript, Tailwind CSS, Prisma, PostgreSQL (Neon), NextAuth.js, and Stripe.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Daily Development Workflow](#daily-development-workflow)
- [Project Structure](#project-structure)
- [Available Commands](#available-commands)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, you need:

1. **Node.js v18 or newer** — [download here](https://nodejs.org/) (pick the LTS version)
2. **Git** — already installed
3. **A Neon database account** (free) — [neon.tech](https://neon.tech)
4. **A code editor** — VS Code recommended

Verify Node.js is installed by running in terminal:
```bash
node --version    # Should print v18.x.x or higher
npm --version     # Should print 9.x.x or higher
```

---

## First-Time Setup

If you're setting this up from scratch (e.g. on a new computer):

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repo-url>
   cd Registry_Website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create your local environment file**:
   ```bash
   cp .env.example .env.local
   ```
   Then open `.env.local` in a text editor and fill in the real values (see [Environment Variables](#environment-variables)).

4. **Run database migrations** (creates tables in your Neon database):
   ```bash
   npm run db:migrate
   ```

5. **Start the dev server**:
   ```bash
   npm run dev
   ```

6. **Open the site** at [http://localhost:3000](http://localhost:3000)

---

## Daily Development Workflow

Once set up, your normal workflow is:

```bash
# Start the dev server
npm run dev

# The site auto-reloads when you save files
# Press Ctrl+C in the terminal to stop
```

The site runs at [http://localhost:3000](http://localhost:3000).

### When you change the database schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` and give the migration a descriptive name
3. Prisma creates the migration file and applies it to your database

### To browse the database visually

```bash
npm run db:studio
```
Opens Prisma Studio in your browser — a GUI for viewing and editing your data.

---

## Project Structure

See `docs/PLAN.md` for a detailed breakdown.

Key folders:
- `src/app/` — pages and API routes
- `src/components/` — reusable UI components
- `src/lib/` — business logic (auth, database queries, Stripe, email)
- `prisma/` — database schema and migrations
- `docs/` — project documentation

---

## Available Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server on http://localhost:3000 |
| `npm run build` | Build the production version |
| `npm run start` | Start the production server (after running build) |
| `npm run lint` | Check the code for style issues |
| `npm run db:migrate` | Apply database schema changes to Neon |
| `npm run db:generate` | Regenerate the Prisma TypeScript client |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:push` | Push schema changes without creating a migration (dev only) |
| `npm run db:seed` | Populate the database with test data |

---

## Environment Variables

All secrets live in `.env.local` (which is git-ignored). See `.env.example` for the template.

| Variable | Purpose | Where to get it |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | [Neon dashboard](https://console.neon.tech) |
| `NEXTAUTH_URL` | Base URL of the app | Use `http://localhost:3000` for dev |
| `NEXTAUTH_SECRET` | Secret used to sign session cookies | Generate at [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) |
| `ADMIN_USERNAME` | Admin login username | Choose your own |
| `ADMIN_PASSWORD` | Admin login password | Choose a strong password |
| `GUEST_USERNAME` | Shared guest login | Choose something simple |
| `GUEST_PASSWORD` | Shared guest password | Choose something guests can type easily |
| `STRIPE_PUBLISHABLE_KEY` | Stripe client key | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) — test mode |
| `STRIPE_SECRET_KEY` | Stripe server key | Stripe Dashboard — test mode |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures | Stripe Dashboard → Webhooks |
| `CLOUDINARY_*` | Image storage credentials | [Cloudinary](https://cloudinary.com) |
| `RESEND_API_KEY` | Email sending | [Resend](https://resend.com) |

---

## Troubleshooting

### "Command not found: npm" or "node"
Node.js is not installed or not on your PATH. Install it from [nodejs.org](https://nodejs.org) and restart your terminal.

### `npm install` fails with permission errors
On Windows, try running the terminal as Administrator. On Mac/Linux, never use `sudo npm install` — instead, fix your npm permissions ([guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)).

### "Error: Environment variable not found: DATABASE_URL"
Your `.env.local` file is missing or doesn't have `DATABASE_URL` set. Copy from `.env.example` and fill in your Neon connection string.

### Database migrations fail: "Can't reach database server"
- Check that your Neon connection string in `.env.local` is correct
- Check that Neon hasn't paused your project due to inactivity (free tier pauses after a period — just make any query to wake it up)
- Check your internet connection

### "Port 3000 is already in use"
Another process is using port 3000. Either:
- Stop the other process
- Run Next.js on a different port: `npm run dev -- -p 3001`

### Changes to `.env.local` aren't taking effect
Next.js only reads `.env.local` on startup. Stop the dev server (Ctrl+C) and run `npm run dev` again.

### "Module not found" errors
Try deleting `node_modules` and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client out of sync (red squiggles in editor)
Regenerate the Prisma client:
```bash
npm run db:generate
```
Then restart your editor/TypeScript server.

### Styles not applying / Tailwind classes not working
- Make sure the dev server is running
- Check that the class exists in `src/app/globals.css` (custom classes like `bg-lilac-500`)
- Hard refresh your browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### VS Code: "Cannot find module '@/...'" errors
The `@/` alias maps to `src/`. Make sure your editor is using the project's `tsconfig.json`. In VS Code, press Ctrl+Shift+P → "TypeScript: Restart TS Server".

### Still stuck?
1. Check the error message carefully — it usually tells you what's wrong
2. Search the exact error text on Google or Stack Overflow
3. Ask the Teacher agent to explain what's happening

---

## Security Notes

- **Never commit `.env.local`** — it contains secrets. Git is configured to ignore it.
- **Never share API keys** in screenshots, chat messages, or public repos.
- **Use test Stripe keys** during development. Only switch to live keys when deploying.
- **Rotate secrets** if you ever accidentally commit them — treat them as compromised immediately.

---

## Next Steps

See `docs/PLAN.md` for the full implementation roadmap.

## Resuming the Project

If you're picking this up from a paused state, start by reading `docs/HANDOFF.md` — it explains current status and the ordered next-step queue.
