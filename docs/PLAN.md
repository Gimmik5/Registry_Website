# Wedding Registry Website — Implementation Plan

> **Status: PAUSED on 2026-04-27.** Phases 1–4 complete in code. Stripe end-to-end verification is the first thing to do on resumption. See `docs/HANDOFF.md` for the full continuation guide.

## 1. Project Overview

A custom wedding registry website for Em and Gid's wedding at Quendon. Guests log in with shared credentials to browse, reserve, and purchase gifts — with payments processed via Stripe and directed to the couple's account. The admin (couple) manages the gift list, tracks purchases, and customises the site content.

Designed to be modular and themeable so it can evolve into a generic wedding website platform.

- **Domain:** emandgidsatquendon.com (or .co.uk — pending availability check)
- **Hosting:** Railway (app + PostgreSQL database)
- **Payments:** Stripe

---

## 2. Tech Stack

| Layer | Technology | What it does |
|---|---|---|
| Framework | Next.js 14+ (App Router) | The main framework — handles both the website pages AND the backend API in one project |
| Language | TypeScript | Adds type safety to JavaScript — catches errors before they happen |
| Styling | Tailwind CSS | Write CSS styles directly in your HTML using utility classes (e.g. `bg-lilac-500 text-white`) |
| Database | PostgreSQL | Where all data lives — gifts, purchases, users |
| ORM | Prisma | Talks to the database using TypeScript instead of raw SQL |
| Auth | NextAuth.js (v5) | Handles login/logout, sessions, and protecting pages |
| Payments | Stripe Checkout | Secure payment processing — we never touch card numbers |
| URL Scraping | Cheerio | Reads product pages and extracts the name, image, and price |
| Image Storage | Cloudinary (free tier) | Stores and serves product images and couple photos |
| Email | Resend (free tier) | Sends purchase notifications and receipts |
| Hosting | Railway | Runs the app and database in the cloud when ready to go live |

---

## 3. Local Development Setup

Everything runs on your machine first. Nothing goes live until you choose to deploy.

```
You will need installed:
  1. Node.js (v18+)    — Runs JavaScript/TypeScript on your computer
  2. npm               — Installs packages/libraries (comes with Node.js)
  3. Docker Desktop    — Runs a local PostgreSQL database in a container
  4. Git               — Version control (already set up)
```

**Daily workflow:**
```
1. Open terminal in project folder
2. Run: docker compose up -d          ← Starts the local database
3. Run: npm run dev                   ← Starts the website at http://localhost:3000
4. Open browser to http://localhost:3000
5. Make changes → browser updates automatically (hot reload)
6. When done: Ctrl+C to stop, docker compose down to stop the database
```

**Stripe testing:** Stripe provides test API keys and fake card numbers (e.g. 4242 4242 4242 4242). No real money is ever charged during development.

---

## 4. Project Architecture — Modular Breakdown

The project is split into clearly separated folders. Each folder has ONE job.
Each file within a folder has ONE responsibility.

```
Registry_Website/
│
├── docs/                          # DOCUMENTATION
│   ├── PLAN.md                    #   This file — the master plan
│   └── ARCHITECTURE.md            #   Detailed explanation of how everything connects
│
├── prisma/                        # DATABASE
│   ├── schema.prisma              #   Defines all database tables and their relationships
│   ├── seed.ts                    #   Populates the database with test data for development
│   └── migrations/                #   Tracks changes to the database structure over time
│
├── public/                        # STATIC FILES (images, icons — served as-is)
│   ├── images/                    #   Couple photos, default gift image, etc.
│   └── favicon.ico                #   Browser tab icon
│
├── src/                           # ALL APPLICATION CODE
│   │
│   ├── app/                       # PAGES & API ROUTES (Next.js App Router)
│   │   │                          #   Each folder = a URL route on the website
│   │   │
│   │   ├── layout.tsx             #   Root layout — wraps EVERY page (header, footer, theme)
│   │   ├── page.tsx               #   Homepage — landing page with hero image, couple text
│   │   │
│   │   ├── (auth)/                #   AUTHENTICATION PAGES (grouped, no URL prefix)
│   │   │   └── login/
│   │   │       └── page.tsx       #     Login page — username + password form
│   │   │
│   │   ├── (guest)/               #   GUEST-FACING PAGES (requires guest login)
│   │   │   ├── layout.tsx         #     Guest layout — adds guest navigation bar
│   │   │   ├── registry/
│   │   │   │   └── page.tsx       #     Gift list — browse all published gifts
│   │   │   ├── gift/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   #     Single gift detail view
│   │   │   └── checkout/
│   │   │       ├── page.tsx       #     Checkout — enter name, message, pay
│   │   │       ├── success/
│   │   │       │   └── page.tsx   #     Payment success confirmation
│   │   │       └── cancelled/
│   │   │           └── page.tsx   #     Payment cancelled page
│   │   │
│   │   ├── admin/                 #   ADMIN PAGES (requires admin login)
│   │   │   ├── layout.tsx         #     Admin layout — adds admin sidebar navigation
│   │   │   ├── page.tsx           #     Admin dashboard — overview stats
│   │   │   ├── gifts/
│   │   │   │   ├── page.tsx       #     Gift list management (add, edit, reorder, publish)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   #     Add new gift — URL scrape or manual entry
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx #   Edit/preview a specific gift before publishing
│   │   │   ├── purchases/
│   │   │   │   └── page.tsx       #     Purchase tracker — who bought what + thank-you status
│   │   │   ├── categories/
│   │   │   │   └── page.tsx       #     Manage gift categories
│   │   │   └── content/
│   │   │       └── page.tsx       #     Edit site content (hero text, photos, about section)
│   │   │
│   │   └── api/                   #   BACKEND API ROUTES (server-only, not visible to users)
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts   #     NextAuth API handler — processes login/logout
│   │       ├── gifts/
│   │       │   ├── route.ts       #     GET all gifts / POST new gift
│   │       │   └── [id]/
│   │       │       └── route.ts   #     GET/PUT/DELETE a specific gift
│   │       ├── categories/
│   │       │   └── route.ts       #     GET/POST gift categories
│   │       ├── scrape/
│   │       │   └── route.ts       #     POST a URL → returns scraped product data
│   │       ├── checkout/
│   │       │   └── route.ts       #     POST → creates a Stripe checkout session
│   │       ├── purchases/
│   │       │   └── route.ts       #     GET all purchases (admin only)
│   │       ├── content/
│   │       │   └── route.ts       #     GET/PUT site content sections
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── route.ts   #     Receives payment confirmations from Stripe
│   │
│   ├── components/                # REUSABLE UI BUILDING BLOCKS
│   │   │                          #   Each component is a self-contained piece of UI
│   │   │
│   │   ├── ui/                    #   GENERIC UI COMPONENTS (used everywhere)
│   │   │   ├── Button.tsx         #     Reusable button with variants (primary, secondary, etc.)
│   │   │   ├── Card.tsx           #     Content card with shadow and border
│   │   │   ├── Input.tsx          #     Text input field with label and validation
│   │   │   ├── Modal.tsx          #     Popup dialog overlay
│   │   │   ├── Badge.tsx          #     Small status indicator (e.g. "Purchased", "Priority")
│   │   │   ├── Spinner.tsx        #     Loading spinner animation
│   │   │   ├── SearchBar.tsx      #     Search input with icon
│   │   │   └── ProgressBar.tsx    #     Visual progress bar (for group gift funding)
│   │   │
│   │   ├── gift/                  #   GIFT-SPECIFIC COMPONENTS
│   │   │   ├── GiftCard.tsx       #     Single gift display card (image, name, price, status)
│   │   │   ├── GiftGrid.tsx       #     Grid layout that displays multiple GiftCards
│   │   │   ├── GiftForm.tsx       #     Form for creating/editing a gift (admin)
│   │   │   ├── GiftPreview.tsx    #     Preview of scraped gift before saving (admin)
│   │   │   ├── GiftFilter.tsx     #     Category/price filter controls
│   │   │   └── GroupGiftMeter.tsx  #     Shows contribution progress for group gifts
│   │   │
│   │   ├── checkout/              #   CHECKOUT COMPONENTS
│   │   │   ├── CartItem.tsx       #     Single item in the checkout summary
│   │   │   ├── CartSummary.tsx    #     Total price and item count
│   │   │   ├── GuestInfoForm.tsx  #     Name + message form before payment
│   │   │   └── PaymentButton.tsx  #     "Pay with Stripe" button
│   │   │
│   │   ├── admin/                 #   ADMIN-SPECIFIC COMPONENTS
│   │   │   ├── UrlScrapeInput.tsx #     URL input + "Fetch" button for scraping
│   │   │   ├── PurchaseTable.tsx  #     Table of all purchases with thank-you checkboxes
│   │   │   ├── GiftListManager.tsx#     Drag-to-reorder gift list with publish toggle
│   │   │   ├── ContentEditor.tsx  #     Rich text editor for site content
│   │   │   └── StatsCard.tsx      #     Dashboard stat (e.g. "12 gifts purchased")
│   │   │
│   │   └── layout/                #   PAGE STRUCTURE COMPONENTS
│   │       ├── Header.tsx         #     Top navigation bar
│   │       ├── Footer.tsx         #     Bottom footer with links
│   │       ├── AdminSidebar.tsx   #     Admin navigation sidebar
│   │       ├── HeroSection.tsx    #     Large hero image with overlay text
│   │       └── PhotoGallery.tsx   #     Grid of couple photos
│   │
│   ├── lib/                       # BUSINESS LOGIC & UTILITIES
│   │   │                          #   Shared logic used by pages and API routes
│   │   │
│   │   ├── auth/
│   │   │   ├── config.ts          #     NextAuth configuration (providers, callbacks)
│   │   │   ├── helpers.ts         #     Auth helper functions (getSession, requireAdmin, etc.)
│   │   │   └── passwords.ts       #     Password hashing and comparison (bcrypt)
│   │   │
│   │   ├── database/
│   │   │   ├── client.ts          #     Prisma client singleton (one connection, reused)
│   │   │   ├── gifts.ts           #     Gift database queries (getAll, getById, create, update)
│   │   │   ├── purchases.ts       #     Purchase database queries
│   │   │   ├── categories.ts      #     Category database queries
│   │   │   └── content.ts         #     Site content database queries
│   │   │
│   │   ├── stripe/
│   │   │   ├── client.ts          #     Stripe SDK client initialisation
│   │   │   ├── checkout.ts        #     Create checkout sessions
│   │   │   └── webhooks.ts        #     Webhook signature verification and event handling
│   │   │
│   │   ├── scraper/
│   │   │   ├── index.ts           #     Main scrape function — URL in, product data out
│   │   │   ├── parsers.ts         #     HTML parsing logic (extract title, image, price)
│   │   │   └── validators.ts      #     URL validation and sanitisation
│   │   │
│   │   ├── email/
│   │   │   ├── client.ts          #     Resend email client setup
│   │   │   ├── templates.ts       #     Email HTML templates (purchase notification, receipt)
│   │   │   └── send.ts            #     Send email functions (notifyAdmin, sendReceipt)
│   │   │
│   │   └── utils/
│   │       ├── formatting.ts      #     Price formatting, date formatting
│   │       ├── validation.ts      #     Input validation helpers (sanitise strings, validate URLs)
│   │       └── constants.ts       #     App-wide constants (roles, statuses, limits)
│   │
│   ├── hooks/                     # REACT HOOKS (client-side logic patterns)
│   │   ├── useCart.ts             #     Shopping cart state management
│   │   ├── useGifts.ts           #     Fetch and cache gift data
│   │   └── useDebounce.ts        #     Debounce search input (wait before searching)
│   │
│   ├── styles/                    # STYLING
│   │   └── globals.css            #     Tailwind imports + lilac theme CSS variables
│   │
│   ├── middleware.ts              # ROUTE PROTECTION
│   │                              #     Runs before every page load — redirects to login
│   │                              #     if not authenticated, blocks guest from admin pages
│   │
│   └── types/                     # TYPESCRIPT TYPE DEFINITIONS
│       ├── gift.ts                #     Gift, GiftCategory, GiftStatus types
│       ├── purchase.ts            #     Purchase, PaymentStatus types
│       ├── auth.ts                #     User, Session, Role types
│       └── content.ts            #     SiteContent section types
│
├── __tests__/                     # ALL TESTS
│   ├── unit/                      #   Test individual functions in isolation
│   │   ├── scraper.test.ts        #     URL scraping tests
│   │   ├── validation.test.ts     #     Input validation tests
│   │   └── formatting.test.ts    #     Price/date formatting tests
│   ├── integration/               #   Test multiple parts working together
│   │   ├── gifts-api.test.ts      #     Gift CRUD API tests
│   │   ├── checkout.test.ts       #     Checkout flow tests
│   │   └── auth.test.ts           #     Authentication tests
│   └── e2e/                       #   Test full user flows in a browser
│       ├── guest-flow.test.ts     #     Guest: login → browse → checkout
│       └── admin-flow.test.ts     #     Admin: login → add gift → publish
│
├── docker-compose.yml             # LOCAL DATABASE — runs PostgreSQL in Docker
├── .env.example                   # ENVIRONMENT VARIABLES TEMPLATE (never commit real secrets)
├── .env.local                     # YOUR LOCAL SECRETS (git-ignored)
├── tailwind.config.ts             # TAILWIND CONFIGURATION — lilac theme colours defined here
├── next.config.ts                 # NEXT.JS CONFIGURATION
├── tsconfig.json                  # TYPESCRIPT CONFIGURATION
├── package.json                   # PROJECT DEPENDENCIES AND SCRIPTS
├── CLAUDE.md                      # AGENT CONFIGURATION — how AI agents work with this codebase
└── README.md                      # SETUP GUIDE + TROUBLESHOOTING
```

---

## 5. Data Model

### Users
| Field | Type | Purpose |
|---|---|---|
| id | UUID | Unique identifier |
| username | String | Login username |
| passwordHash | String | Bcrypt-hashed password (never store plain text) |
| role | Enum: ADMIN / GUEST | Determines what pages they can access |
| createdAt | DateTime | When the account was created |

### Gift Categories
| Field | Type | Purpose |
|---|---|---|
| id | UUID | Unique identifier |
| name | String | Display name (e.g. "Kitchen", "Bedroom", "Experiences") |
| slug | String | URL-friendly version (e.g. "kitchen") |
| displayOrder | Int | Controls the order categories appear on the page |

### Gifts
| Field | Type | Purpose |
|---|---|---|
| id | UUID | Unique identifier |
| name | String | Gift name (scraped or manually entered) |
| description | String? | Optional description |
| price | Decimal | Price in GBP |
| imageUrl | String? | Product image URL |
| sourceUrl | String? | Original product page URL (null for custom gifts) |
| categoryId | UUID? | Which category this gift belongs to |
| isGroupGift | Boolean | Can multiple people contribute? |
| groupGiftTarget | Decimal? | Total amount needed (for group gifts) |
| groupGiftRaised | Decimal | Amount contributed so far (default 0) |
| isCustom | Boolean | Was this manually created (not scraped)? |
| isPriority | Boolean | Flagged as "most wanted" |
| status | Enum | DRAFT / PUBLISHED / PURCHASED / PARTIALLY_FUNDED |
| displayOrder | Int | Controls order within its category |
| createdAt | DateTime | When added |
| updatedAt | DateTime | Last modified |

### Purchases
| Field | Type | Purpose |
|---|---|---|
| id | UUID | Unique identifier |
| giftId | UUID | Which gift was purchased |
| guestName | String | Who bought it |
| guestMessage | String? | Personal message from the guest |
| amount | Decimal | Amount paid |
| stripeSessionId | String | Stripe checkout session reference |
| stripePaymentIntentId | String? | Stripe payment reference |
| paymentStatus | Enum | PENDING / COMPLETED / FAILED / REFUNDED |
| thanked | Boolean | Has a thank-you been sent? (default false) |
| createdAt | DateTime | When the purchase was made |

### Site Content
| Field | Type | Purpose |
|---|---|---|
| id | UUID | Unique identifier |
| section | String | Which part of the site (HERO, ABOUT, STORY, etc.) |
| title | String? | Section heading |
| body | String? | Section text content |
| imageUrl | String? | Section image |
| updatedAt | DateTime | Last modified |

---

## 6. Feature Breakdown by Phase

### Phase 1 — Foundation ✅ COMPLETE
- [x] Project scaffolding (Next.js, TypeScript, Tailwind, Prisma)
- [x] ~~Docker Compose for local PostgreSQL~~ — switched to Neon (cloud) for simpler setup
- [x] Database schema and initial migration
- [x] Environment variable setup
- [x] Authentication (admin + guest login with NextAuth)
- [x] Route protection middleware (Next.js 16: now `proxy.ts`)
- [x] Base layout, lilac theme, fonts
- [x] Landing page with hero section

### Phase 2 — Admin Gift Management ✅ COMPLETE
- [x] URL scraper endpoint (paste link → extract image, name, price)
- [x] Admin preview/edit screen after scrape (review before saving)
- [x] Manual/custom gift creation (cash fund contributions)
- [x] Gift categories CRUD
- [x] Gift list management (reorder, edit, delete)
- [x] Draft/publish workflow
- [x] Priority flagging (wish-list)
- [x] Post-publish editing
- [x] **Bonus:** Open-ended Funds (`isFund` flag — honeymoon contributions etc.)

### Phase 3 — Guest Experience ✅ COMPLETE
- [x] Published gift list view (grid with images, prices, status)
- [x] Category filtering and search
- [x] Gift detail view
- [x] Group gift progress display (meter showing contributions)
- [x] Purchased items greyed out (visible but not buyable)
- [x] Cart / item selection (single-item flow rather than cart — sufficient for the use case)
- [x] **Bonus:** Per-gift contributor list (names + amounts visible to guests)

### Phase 4 — Payments ✅ COMPLETE (pending end-to-end verification)
- [x] Stripe integration and account setup
- [x] Checkout flow (name + message prompt → Stripe Checkout)
- [x] Stripe webhook handler (payment confirmation)
- [x] Purchase recording and gift status update
- [ ] Email notifications (admin: new purchase; guest: receipt) — **deferred to Phase 5**
- [x] Group gift partial payments (and fund contributions)

> **Verification pending:** see `docs/STRIPE_VERIFICATION.md` for the test script to run.

### Phase 5 — Admin Dashboard
- [ ] Purchase tracking table (who bought what, messages, timestamps)
- [ ] Thank-you tracker (checkbox per purchase)
- [ ] Site content editor (hero text, photos, about section)
- [ ] Dashboard stats overview

### Phase 6 — Security & Polish
- [ ] Rate limiting on all sensitive endpoints
- [ ] CSRF protection
- [ ] Input sanitisation across all forms
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsiveness pass
- [ ] Error handling, loading states, 404 page
- [ ] SEO meta tags

### Phase 7 — Deployment
- [ ] Railway setup (app + database)
- [ ] Domain purchase and DNS configuration
- [ ] SSL certificate (auto via Railway)
- [ ] Environment variables in Railway
- [ ] GitHub → Railway auto-deploy pipeline

---

## 7. Security Plan

| Layer | Measure | Why |
|---|---|---|
| Passwords | Bcrypt hashing (cost factor 12) | Even if database is breached, passwords can't be read |
| Sessions | HttpOnly, Secure, SameSite=Strict cookies | Prevents JavaScript from reading session tokens |
| Login | Rate limited: 5 attempts/minute | Stops brute-force password guessing |
| API | Rate limited per endpoint | Prevents abuse and scraping overload |
| CSRF | Token verification on all form submissions | Prevents cross-site request forgery |
| Input | Server-side validation and sanitisation | Blocks XSS and injection attacks |
| SQL | Prisma ORM (parameterised queries) | Prevents SQL injection |
| Payments | Stripe Checkout (hosted by Stripe) | Card numbers never touch our server (PCI compliant) |
| Webhooks | Stripe signature verification | Ensures payment confirmations are genuinely from Stripe |
| HTTPS | Enforced via Railway auto-SSL | All traffic encrypted in transit |
| Secrets | .env files, never committed to git | API keys stay out of source code |
| Headers | X-Frame-Options, X-Content-Type-Options, CSP | Prevents clickjacking and content sniffing |
| Scraping | Server-side only, timeouts, size limits | Prevents SSRF attacks |

---

## 8. Payment Flow

```
1. Guest selects gift(s) from the registry
                    ↓
2. Guest clicks "Purchase" → taken to checkout page
                    ↓
3. Guest enters their name and a personal message
                    ↓
4. Guest clicks "Pay" → our server creates a Stripe Checkout Session
   (includes: gift price, guest name/message in metadata)
                    ↓
5. Guest is redirected to Stripe's secure payment page
   (we NEVER see their card details)
                    ↓
6. Guest completes payment on Stripe
                    ↓
7. Stripe sends a webhook (automated notification) to our server:
   POST /api/webhooks/stripe
                    ↓
8. Our webhook handler:
   a. Verifies the notification is genuinely from Stripe
   b. Saves the purchase to our database
   c. Updates the gift status to PURCHASED (or adds to group gift total)
   d. Sends email to admin: "Someone bought [gift name]!"
   e. Sends receipt email to guest (if email provided)
                    ↓
9. Guest sees a confirmation page: "Thank you! Your gift has been reserved."
```

---

## 9. Design System — Lilac Theme

### Colour Palette
```
Primary:        #9B72CF    (lilac — main brand colour)
Primary light:  #C4A6E3    (lighter lilac — hover states, backgrounds)
Primary dark:   #7B52AF    (deeper lilac — active states, emphasis)
Accent:         #D4AF37    (gold — call-to-action buttons, highlights)
Background:     #FAF8FC    (very light lilac tint — page background)
Surface:        #FFFFFF    (white — cards, inputs)
Text:           #2D2040    (dark purple-grey — main text)
Text muted:     #6B5B7B    (lighter — secondary text, captions)
Success:        #4CAF50    (green — confirmations)
Error:          #E53935    (red — errors, warnings)
Border:         #E8DFF0    (soft lilac — card borders, dividers)
Purchased:      #B0A3BF    (muted lilac-grey — greyed-out purchased items)
```

### Typography
- **Headings:** Playfair Display (elegant serif — wedding feel)
- **Body:** Inter (clean, readable sans-serif)

### Purchased Gift Styling
- Image desaturated (greyed out via CSS filter)
- "Purchased" badge overlay
- Click disabled, cursor shows "not allowed"
- Still visible in the list so guests can see what's been taken

---

## 10. Agent Configuration

Seven specialised agents for efficient development:

| Agent | Focus | What it does |
|---|---|---|
| **Frontend** | UI components, pages, client-side logic | Builds and edits React components, page layouts, forms, and interactive elements |
| **Backend** | API routes, auth, scraping, server logic | Builds and edits server-side API endpoints, authentication, middleware |
| **Database** | Schema, migrations, queries, seeds | Manages the Prisma schema, writes database queries, handles migrations |
| **Payments** | Stripe integration, checkout, webhooks | Builds and edits all payment-related code |
| **Testing** | Unit, integration, and E2E tests | Writes and runs tests to catch bugs |
| **Teacher** | Explains code and concepts (read-only) | Walks through any file explaining what it does and why — never edits code |
| **Design** | Theme, styling, layout, responsiveness | Updates colours, fonts, spacing, and visual design — makes design changes simple |
