# Deployment Guide — Going Live on Railway

This guide takes the project from "runs on my laptop" to "wedding guests can use it on the open internet". Follow it in order.

**Estimated time:** 2–3 hours total, spread over a few sessions (DNS propagation needs to settle).

---

## Pre-deployment checklist

Before deploying, complete these:

- [ ] **Stripe end-to-end test passes locally** — see `docs/STRIPE_VERIFICATION.md`
- [ ] **Real passwords chosen** for `ADMIN_PASSWORD` and `GUEST_PASSWORD` in `.env.local` — change from `change-me`
- [ ] **Code committed and pushed** to GitHub `main` branch
- [ ] **Stripe live keys ready** — log into Stripe dashboard, switch to **Live mode** (top-right toggle), grab the live publishable + secret keys
- [ ] **Domain decision made** — will you buy `emandgidsatquendon.com` (or `.co.uk`)? Cost ~£10/year via Cloudflare Registrar
- [ ] **Decision on database**: keep using Neon (recommended), or migrate to Railway PostgreSQL

---

## Step 1: Set up Railway

1. Go to **https://railway.app** and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Gimmick5/Registry_Website`
4. Railway auto-detects Next.js — accept the defaults
5. The first build will fail because environment variables aren't set yet. That's expected.

### Add environment variables

In the Railway project dashboard → **Variables** tab → add each of these:

```
DATABASE_URL              (your Neon connection string OR Railway PG — see Step 2)
NEXTAUTH_URL              https://emandgidsatquendon.com   (or your final domain)
NEXTAUTH_SECRET           (run: openssl rand -base64 32 — must be different from local)
ADMIN_USERNAME            admin
ADMIN_PASSWORD            (a real strong password)
GUEST_USERNAME            guests
GUEST_PASSWORD            (something memorable for the invitation)
STRIPE_PUBLISHABLE_KEY    pk_live_...    (LIVE key, not test)
STRIPE_SECRET_KEY         sk_live_...    (LIVE key, not test)
STRIPE_WEBHOOK_SECRET     (will fill in in Step 4 after registering the prod webhook)
```

If/when you wire up email and image hosting (Phase 5):
```
RESEND_API_KEY            re_...
EMAIL_FROM                registry@emandgidsatquendon.com
ADMIN_EMAIL               your.email@example.com
CLOUDINARY_CLOUD_NAME     ...
CLOUDINARY_API_KEY        ...
CLOUDINARY_API_SECRET     ...
```

---

## Step 2: Database — keep Neon or move to Railway

### Option A — Keep Neon (recommended)

Easiest path. The DB is already migrated and working.

1. Get your Neon connection string from `.env.local` (or Neon console)
2. Paste it as `DATABASE_URL` in Railway variables
3. Done — Prisma will use the same DB whether dev or production

> **Important:** This means local dev and production share a database. For a wedding registry that's fine (you control both ends). When you eventually want a separate prod database, create a second Neon project and use its URL in Railway only.

### Option B — Use Railway PostgreSQL

More setup, but keeps your stack consolidated.

1. In Railway project: **+ New** → **Database** → **PostgreSQL**
2. Railway provisions a managed PG instance and exposes a `DATABASE_URL` variable
3. Reference it in your service: in the **Variables** tab, set `DATABASE_URL=${{Postgres.DATABASE_URL}}`
4. Run migrations on first deploy by adding a build step or running `npx prisma migrate deploy` once via Railway's CLI:
   ```
   railway run npx prisma migrate deploy
   ```
5. (Optional) Migrate existing data from Neon: `pg_dump` from Neon, `psql` import into Railway

---

## Step 3: Deploy

1. After environment variables are set, Railway auto-redeploys
2. Watch the **Deployments** tab for the build log
3. Once green, Railway gives you a URL like `https://registry-website-production.up.railway.app`
4. Visit it — you should see the landing page

### First-time database setup on Railway

If you used **Option B** (Railway PG) and haven't run migrations yet, do it now:

```
railway link                                  # connect CLI to the project
railway run npm run db:migrate -- --name deploy
railway run npm run db:seed                   # seed admin + guest users
```

(For **Option A** Neon, the existing migrations and users are already there.)

---

## Step 4: Stripe production webhook

Local testing used `stripe listen` to forward events. Production needs a real webhook endpoint registered in the Stripe dashboard.

1. Stripe Dashboard → **Developers** → **Webhooks** → **+ Add endpoint**
2. Endpoint URL: `https://your-railway-url.up.railway.app/api/webhooks/stripe` (or your custom domain once configured)
3. Events to send:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Click **Add endpoint** → on the resulting page, click **Reveal** under "Signing secret"
5. Copy the `whsec_...` value
6. Paste into Railway's `STRIPE_WEBHOOK_SECRET` variable
7. Railway redeploys automatically with the new secret

**Test it:** From Stripe dashboard → Webhooks → click the endpoint → **Send test webhook** → choose `checkout.session.completed` → check the response is 200.

---

## Step 5: Custom domain

### Buy the domain
1. Go to **https://domains.cloudflare.com**
2. Search `emandgidsatquendon.com` (or your chosen name)
3. Register — Cloudflare uses at-cost pricing (~$10/year for `.com`, ~$8 for `.co.uk`)

### Point DNS to Railway
1. In Railway service → **Settings** → **Networking** → **Generate Domain** (gives you the railway.app URL) and **+ Custom Domain**
2. Enter `emandgidsatquendon.com` (and optionally `www.emandgidsatquendon.com`)
3. Railway shows DNS records to add — typically one CNAME or A record
4. In Cloudflare DNS:
   - Add the record(s) Railway provided
   - Set the proxy status to **DNS only** (grey cloud) initially — Cloudflare's orange cloud can interfere with Railway's SSL
5. Wait 5–30 minutes for DNS to propagate
6. Railway auto-issues an SSL certificate via Let's Encrypt

### Update `NEXTAUTH_URL`
Once the domain is live:
- In Railway variables: change `NEXTAUTH_URL` to `https://emandgidsatquendon.com`
- Redeploy
- Update the Stripe webhook URL too (Step 4) to use the new domain

---

## Step 6: Pre-launch smoke tests

Visit `https://emandgidsatquendon.com` and verify:

- [ ] Landing page loads with the lilac theme
- [ ] Login as admin works (and password is the new strong one, not `change-me`)
- [ ] Login as guest works
- [ ] Browse `/registry`
- [ ] Add a test gift via URL scrape from admin
- [ ] Make a real £1 purchase as a guest using a real card (you can refund it immediately from Stripe dashboard)
- [ ] Confirm webhook fires and gift status updates
- [ ] Refund the test purchase from Stripe dashboard
- [ ] Check Neon (or Railway PG) for the Purchase row

---

## Step 7: Share with guests

Once smoke tests pass:
- Print the URL and the guest credentials on the wedding invitations (or include a card insert)
- Tell guests: "Visit emandgidsatquendon.com, log in with username `guests` and password `XXXX`"

---

## Cost summary

| Item | When | Cost |
|---|---|---|
| Domain (Cloudflare) | One-off + annual renewal | ~£8–10/year |
| Railway hosting | Monthly | ~$5–10/month (sleeps if no traffic on free tier; paid tier always-on) |
| Neon DB | Monthly | Free tier sufficient (0.5GB storage, auto-pauses) |
| Stripe transaction fees | Per payment | 2.9% + 30p per transaction |
| **Approx total** | | **~£15/month + transaction fees** |

---

## Post-launch admin tasks

After go-live, the admin (Gideon) typically wants to:
- Add the real gift list (not test data) — use `/admin/gifts`
- Publish all gifts at once or in batches
- Watch `/admin/purchases` for incoming contributions (Phase 5 — not built yet)
- Send thank-you notes (Phase 5 thank-you tracker — not built yet)
- After the wedding: archive the site or download the data

---

## Rollback plan

If something goes wrong post-deploy:
- Railway keeps every deployment — go to **Deployments** → click an older successful deploy → **Redeploy**
- Database migrations are forward-only by default. If a bad migration lands, revert in code, push, and apply the corrective migration. NEVER edit a deployed migration file.
- For Stripe: any failed payment can be refunded in the Stripe dashboard. Real charges only happen on live keys, so all test mode purchases are safe to ignore.

---

## When the wedding is over

Options:
1. **Keep it running** — convert into a thank-you / photo gallery site
2. **Archive** — export DB, take down Railway service, keep domain pointed at a static "thanks for celebrating" page
3. **Genericise it** — extract for use as a template for friends' weddings (the codebase was designed to be themeable)
