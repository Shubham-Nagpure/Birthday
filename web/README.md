# wishtoria (Next.js) — migration in progress

This is the new **Next.js + TypeScript** version of wishtoria, replacing the
vanilla `sell/` + Express `server/` app. It's being migrated in phases; the old
app keeps working until this reaches parity.

## Why the rewrite

- **One source of truth.** Templates, pages and pricing now live once in `lib/`
  and are shared by the builder and the player (previously duplicated in
  `sell/script.js` and `server/player.js`).
- **The player is React components**, not concatenated HTML strings. Each page
  type is its own file in `components/player/pages/` — used for both the live
  site and the in-builder preview.
- **TypeScript** across the board catches shape bugs before runtime.

## Structure

```
app/
  page.tsx              landing (demo index for now)
  s/[slug]/page.tsx     the published/preview site (renders <Player/>)
  api/…                 (Phase 4) orders, verify, webhook, preview, upload
components/player/
  Player.tsx            orchestrator (nav, theme, confetti)
  pages/*.tsx           IntroPage, AskPage, GalleryPage, … one per page type
  Player.module.css     player styles (ported from the old string CSS)
lib/
  templates.ts pages.ts pricing.ts types.ts   ← single source of truth
  sample.ts             demo content for /s/demo-<template>
prisma/schema.prisma    Postgres/Supabase schema (Phase 2)
```

## Run (no database — demo + builder + local preview)

```bash
npm install
npm run dev        # http://localhost:3000
```

- Landing + builder: `http://localhost:3000` → **Create Today**
- Player demos: `http://localhost:3000/s/demo-valentine` (also `-romantic`,
  `-birthday`, `-anniversary`, `-friendship`, `-congrats`, `-sorry`)
- The builder's **Preview** works with no backend (renders via `sessionStorage`).

## Run with a database (publish + payments)

1. Create a Supabase project → copy the Postgres connection string.
2. `cp .env.example .env` and fill in `DATABASE_URL`, `BASE_URL`, and (optionally)
   the Razorpay keys. Leave Razorpay blank to run **TEST_MODE** (no real charge).
3. Create the tables:
   ```bash
   npx prisma migrate dev --name init     # or: npx prisma db push
   ```
4. `npm run dev` — now `/api/orders`, `/api/verify`, `/api/preview`, `/api/qr`
   and published sites at `/s/<slug>` all work. Without `DATABASE_URL` those
   routes return a 500 by design (the demo/preview paths still work).

## Migration phases

- [x] Phase 1 — scaffold, shared config, player as components
- [x] Phase 2 — Prisma + Supabase Postgres schema & data layer (`lib/db.ts`)
- [x] Phase 3 — builder UI (landing, template/plan/form/review, ad, preview)
- [x] Phase 4 — API routes (`/api/orders|verify|webhook|preview|qr|config`) + Razorpay
- [ ] Phase 5 — file uploads to Supabase Storage, deploy to Vercel, cut over
- [ ] Bump `next` to a patched 14.2.x before deploy (current pin has a known advisory)
