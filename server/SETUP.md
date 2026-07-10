# wishtoria — Setup Guide

This turns your romantic surprise site into a product you can sell: buyers pick
pages, pay with Razorpay (UPI/cards), and get a private link + QR to their own
personalized site.

## What's in here

```
sell/                  ← the sales + builder website (landing, plans, form)
server/                ← Node/Express backend (payments, DB, links, QR, player)
  index.js             ← API + routes
  config.js            ← pricing (INR) + env
  db.js                ← SQLite database (auto-created: lovesite.db)
  player.js            ← renders each buyer's site from their saved content
index.html + script.js ← your original demo (served at /demo)
```

## 1. Run it locally (no payment account needed)

```bash
cd server
npm install
cp .env.example .env      # leave the Razorpay keys blank for now
npm start
```

Open **http://localhost:4242** → click *Create Today* → pick pages → fill the form →
*Pay & build*. With blank keys it runs in **TEST_MODE**: no real charge, but it still
creates the record, a unique link, and a QR. You'll get a live link like
`http://localhost:4242/s/ab12cd34`.

## 2. Go live with Razorpay (India)

1. Create a Razorpay account: https://dashboard.razorpay.com → complete KYC.
2. Dashboard → **Settings → API Keys → Generate Key**. Copy the **Key Id** and **Key Secret**.
3. Put them in `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   BASE_URL=https://yourdomain.com
   ```
4. Restart the server. It now says **LIVE Razorpay** and opens real checkout (UPI, cards, netbanking, wallets).

> Use `rzp_test_...` keys first to test with fake cards, then switch to `rzp_live_...`.

### Webhook (recommended — the reliable source of truth)

Payments should be confirmed by a webhook, not just the browser callback.

1. Dashboard → **Settings → Webhooks → Add New Webhook**.
2. URL: `https://yourdomain.com/api/webhook`
3. Secret: pick any strong string, and put the same value in `.env` as
   `RAZORPAY_WEBHOOK_SECRET=...`
4. Subscribe to events: **`payment.captured`** (and optionally `order.paid`).
5. Save. The server verifies the signature and marks the site paid automatically.

## 3. Templates

Buyers pick a **template** first (Romantic, Birthday, Anniversary, Friendship, Congrats).
Each sets colours, mood and a starter set of pages. Themes live in two mirrored places —
keep them in sync when adding a new one:

- `sell/script.js` → `TEMPLATES` (frontend picker + builder theming)
- `server/player.js` → `TEMPLATES` (the buyer's live site theming)

The chosen template id is stored per site (`sites.template`) and applied via CSS variables.

## 4. Free plan + ads

There are three plans (`server/config.js` → `PRICING`):

- **Simple (Free)** — up to 3 pages, ₹0. Before the form, the buyer sees a short
  **ad interstitial** (5-second gate), and their finished site shows a small
  “Made with 🎁 wishtoria” badge.
- **Basic** — ₹1499, up to 4 pages, no ads/badge.
- **Premium** — ₹2999, all pages + music + custom domain.

### Plugging in Google AdSense

1. Create an AdSense account and get approved: https://adsense.google.com
2. Add the AdSense loader script to `sell/index.html` `<head>`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>
   ```
3. Paste your ad **unit** into the `#ad-slot` div in `sell/index.html` (replace the
   placeholder). The interstitial already calls `adsbygoogle.push({})` when it opens.

> Note: AdSense generally requires a live domain with real content and approval before
> ads serve. Until then the styled placeholder is shown and the 5-second gate still works.

## 5. Pricing

Edit `server/config.js` → `PRICING` (all in ₹). The **server** decides the amount —
the browser price is display-only, so nobody can pay less by editing the page.

```js
basic: 1499,      // up to 4 pages
premium: 2999,    // all pages
addonPage: 399,   // each page beyond 4 on Basic
```

## 6. Deploy

- **Server**: Render.com, Railway, or a small VPS. Set the env vars there.
  Note: SQLite lives in a file — use a persistent disk, or move to Postgres/Supabase
  for scale (see below).
- **Domain**: point it at the server; set `BASE_URL` to the https URL so links + QR are correct.

## 7. Scaling notes (when you outgrow SQLite)

- **Database**: swap SQLite for **Supabase/Postgres** — change only `db.js`.
- **Photo/music uploads**: buyers upload files directly (stored in `server/uploads/`,
  served at `/uploads/...`). For scale/CDN, swap the `/api/upload` handler to push to
  Supabase Storage or Cloudinary and keep storing the returned URL in `content`.
  On a host with an ephemeral disk (e.g. some Render tiers), use a persistent disk or
  move uploads to object storage so files survive restarts.
- **Emails**: wire the buyer's link into an email (Resend / SendGrid) after payment.

## API reference

| Method | Route | Purpose |
|---|---|---|
| GET  | `/api/config` | Razorpay key + pricing + mode for the frontend |
| POST | `/api/upload` | Upload a photo/audio file, returns its URL (max 20 MB) |
| POST | `/api/orders` | Create a draft + Razorpay order (server prices it) |
| POST | `/api/verify` | Verify payment signature, mark paid, return link + QR |
| POST | `/api/webhook`| Razorpay server-to-server payment confirmation |
| GET  | `/api/sites/:slug` | Buyer's content JSON (paid only) |
| GET  | `/api/qr/:slug` | QR code PNG of the share link |
| GET  | `/s/:slug` | The buyer's live personalized site |
