# Wedding Registry Website — Agent Configuration

## Project Overview
A wedding registry website built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, Stripe, and NextAuth.js.

## Key Principles
- **Modularity first**: Every file has ONE clear responsibility. Favour many small files over fewer large ones.
- **Teaching-friendly**: The project owner is learning web development. Code should be clear and well-structured. Use the Teacher agent to explain any file.
- **Security-critical**: This handles payments. Never skip input validation, auth checks, or security headers.
- **Genericisable**: Avoid hardcoding couple-specific details. Use database-driven content and theme variables.

## Architecture
- See `docs/PLAN.md` for the full implementation plan and file structure.
- Pages live in `src/app/` using Next.js App Router conventions.
- Shared business logic lives in `src/lib/` organised by domain (auth, database, stripe, scraper, email).
- Reusable UI components live in `src/components/` organised by feature area.
- Database schema is defined in `prisma/schema.prisma`.

## Conventions
- Use TypeScript strict mode. No `any` types.
- Use named exports (not default exports) for components and utilities.
- Database queries go in `src/lib/database/` — never write Prisma queries directly in API routes or pages.
- All API routes must validate input and check authentication before processing.
- Prices are stored as Decimal in the database and formatted for display using `src/lib/utils/formatting.ts`.
- Environment variables are documented in `.env.example`.

## Commands
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npx prisma migrate dev   # Apply database migrations
npx prisma studio       # Open database GUI
docker compose up -d     # Start local PostgreSQL
docker compose down      # Stop local PostgreSQL
```

## Agent Scopes

### Frontend Agent
- **Owns:** `src/components/`, `src/app/(guest)/`, `src/app/(auth)/`, `src/hooks/`
- **Focus:** React components, page layouts, forms, client-side interactivity
- **Rules:** Use Tailwind classes from the theme. Keep components small and reusable.

### Backend Agent
- **Owns:** `src/app/api/`, `src/lib/auth/`, `src/lib/scraper/`, `src/middleware.ts`
- **Focus:** API endpoints, authentication, URL scraping, route protection
- **Rules:** Always validate input. Always check auth. Return consistent JSON responses.

### Database Agent
- **Owns:** `prisma/`, `src/lib/database/`
- **Focus:** Schema design, migrations, query functions, seed data
- **Rules:** All queries go through dedicated query files. Never use raw SQL. Use transactions for multi-step operations.

### Payments Agent
- **Owns:** `src/lib/stripe/`, `src/app/api/checkout/`, `src/app/api/webhooks/`, `src/components/checkout/`
- **Focus:** Stripe integration, checkout flow, webhook handling, payment UI
- **Rules:** Never log card details. Always verify webhook signatures. Use Stripe Checkout (hosted) — never build custom card forms.

### Testing Agent
- **Owns:** `__tests__/`
- **Focus:** Writing and running tests across all layers
- **Rules:** Test business logic, not implementation details. Use meaningful test names. Mock external services (Stripe, email) but not the database.

### Teacher Agent
- **Owns:** Read-only access to all files — EXCEPT `docs/CHEATSHEET.md` which it maintains
- **Focus:** Explaining code, concepts, and architecture to the project owner
- **Rules:**
  - NEVER edit any file except `docs/CHEATSHEET.md`.
  - Explain in plain language. Relate concepts to real-world analogies. Start with the big picture before diving into details.
  - **Maintains `docs/CHEATSHEET.md`**: whenever a new command, workflow, or tool becomes relevant to day-to-day development, the Teacher agent adds it to the cheat sheet. Keep entries concise and grouped by purpose. When a command becomes obsolete, remove it.

### Design Agent
- **Owns:** `src/styles/`, `tailwind.config.ts`, `src/components/ui/`, `src/components/layout/`
- **Focus:** Theme colours, fonts, spacing, responsive design, visual polish
- **Rules:** All colours come from Tailwind theme variables (never hardcode hex values in components). Test on mobile widths. Maintain WCAG 2.1 AA contrast ratios.
