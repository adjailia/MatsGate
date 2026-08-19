# External Integrations

**Analysis Date:** 2026-08-19

## APIs & External Services

**Affiliate Network:**
- AWIN (Awin) — affiliate marketing platform providing product feeds and tracking links
  - Advertiser ID: `105475` (Perfumeria Comas FR)
  - Affiliate ID: `3039511`
  - Link format: `https://www.awin1.com/cread.php?awinmid=105475&awinaffid=3039511&ued=<encoded_product_url>`
  - SDK/Client: None — links are pre-generated in the CSV product feed
  - Auth: Embedded in affiliate link URLs (no API key needed client-side)
  - Usage: All 7,429 products have `affiliate_link` fields generated from AWIN tracking URLs

**CDN / Static Assets:**
- Cloudflare cdnjs — Font Awesome icon library
  - URL: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css`
  - Referenced in: `index.html` line 16
  - No API key required

**Placeholder Images:**
- via.placeholder.com — fallback images when product images fail to load
  - URL pattern: `https://via.placeholder.com/200x200?text=No+Image`
  - URL pattern: `https://via.placeholder.com/200x200?text=Image+indisponible`
  - URL pattern: `https://via.placeholder.com/100x100`
  - Referenced in: `script.js` lines 203, 206, 401

**Product Image CDN:**
- Perfumeria Comas CDN — product images served from merchant CDN
  - URL pattern: `https://perfumeriacomas.com/cdnassets/products/{id}_1_m.webp`
  - Referenced in: `data/products.json` (image field per product)

## Data Storage

**Databases:**
- None — no server-side database

**Client-Side Storage (localStorage):**
- `selectedProductIds` — JSON array of product IDs selected for comparison
- `wishlist` — JSON array of product IDs in user's wishlist
- `darkMode` — boolean string (`"true"` / `"false"`) for theme preference
- Referenced in: `script.js` lines 48-58, 247, 261, 277, 425

**File Storage:**
- Local filesystem only — `data/products.json` is a static JSON file served by Cloudflare Pages
- No file uploads, no cloud storage

**Caching:**
- Cloudflare Pages CDN — static asset caching (implicit, no custom cache headers configured)
- No application-level caching layer

## Authentication & Identity

**Auth Provider:**
- None — no authentication system
- No user accounts, no login, no session management
- All state is stored in browser localStorage (anonymous, per-device)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, LogRocket, or similar error tracking service
- Basic `console.error()` in `script.js` line 66 for fetch failures

**Logs:**
- Cloudflare Pages build logs only (stored in `errer/` directory as build artifacts)
- No runtime logging or analytics service

**Analytics:**
- None — no Google Analytics, Plausible, or similar tracking detected

## CDN & Hosting

**Hosting:**
- Cloudflare Pages — primary hosting platform
  - Custom domain: `metsgate.com` (via `CNAME` file)
  - DNS zone exported to `data/metsgate.com.txt`
  - Deploy command: `npx wrangler deploy`
  - Build environment: Bun 1.2.15 + Node.js 24.18.0

**Build Pipeline:**
- Cloudflare Pages automatic builds triggered on git push
- Build steps:
  1. `bun install` (no packages to install)
  2. `npx wrangler deploy` (currently failing — see Build Issues below)

## Environment Configuration

**Required env vars:**
- None — the application requires no environment variables
- All configuration is static (affiliate IDs embedded in product data)

**Secrets location:**
- None needed — no API keys, tokens, or secrets required
- Affiliate tracking parameters are embedded in product feed URLs

## Webhooks & Callbacks

**Incoming:**
- None — no server-side endpoints or webhook receivers

**Outgoing:**
- None — no outgoing webhook calls
- External links are standard `<a href>` navigation (affiliate links open in new tabs)

## Build Issues

**Cloudflare Pages Deploy Failure:**
- Error: `Cannot use assets with a binding in an assets-only Worker`
- File: `wrangler.json`
- Cause: The `wrangler.json` config has `assets.directory` set but no `main` entry point, and wrangler v4.x requires either a Worker script or a pure assets config — not both
- Current state: Build log captured in `errer/matsgate.production.e10003b1-c34b-4405-b130-7b5f60c7d498.build.log`
- Fix: Either remove the `assets` block and add a Worker script, or simplify to a pure static site configuration. For a static-only site, Cloudflare Pages dashboard configuration may be needed instead of `wrangler.json`

---

*Integration audit: 2026-08-19*
