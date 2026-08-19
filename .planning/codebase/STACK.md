# Technology Stack

**Analysis Date:** 2026-08-19

## Languages

**Primary:**
- JavaScript ES6 (vanilla) — Client-side application logic (`script.js`, 497 lines)
- HTML5 — Semantic page structure (`index.html`, 124 lines)
- CSS3 — Styling with Flexbox, Grid, and dark mode (`style.css`, 910 lines)

**Secondary:**
- Node.js — Build tooling only (`generate.js`, 135 lines); CSV-to-JSON data pipeline

## Runtime

**Environment:**
- No server-side runtime for production — this is a fully static site
- Node.js v26.7.0 (development only, for `generate.js` CSV-to-JSON conversion)
- Python 3.13.5 (development only, for local HTTP server via `python3 -m http.server 8000`)

**Package Manager:**
- No package manager used in production (zero npm dependencies)
- Bun 1.2.15 available in Cloudflare build environment (detected in build log)
- Lockfile: None (no `package-lock.json`, `yarn.lock`, or `bun.lockb`)
- `package.json` exists but has zero `dependencies` or `devDependencies`

## Frameworks

**Core:**
- None — vanilla HTML/CSS/JavaScript with no UI framework (no React, Vue, Angular, Svelte)

**Testing:**
- None — no test framework configured

**Build/Dev:**
- `generate.js` — custom Node.js script to parse `data/products.csv` → `data/products.json`
- `run.sh` — shell script that runs `node generate.js` then starts Python HTTP server

## Key Dependencies

**Critical:**
- None — the application has zero runtime npm dependencies

**Infrastructure:**
- Cloudflare Pages — hosting and deployment (configured via `wrangler.json`)
- Wrangler CLI v4.124.0 — used in Cloudflare build pipeline (`npx wrangler deploy`)

**Client-Side CDN:**
- Font Awesome 6.0.0-beta3 — icon library loaded from CDN
  - URL: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css`
  - Referenced in: `index.html` line 16

## Configuration

**Environment:**
- No `.env` file — no server-side environment variables required
- No API keys needed client-side (all affiliate links are embedded in product data)

**Build:**
- `wrangler.json` — Cloudflare Pages configuration
  - **Current state:** Has a build error: "Cannot use assets with a binding in an assets-only Worker"
  - `name`: `"matsgate"`
  - `compatibility_date`: `"2026-08-15"`
  - `assets.directory`: `"."` — serves the entire project root as static assets
  - The `main` entry is missing; the `assets` config alone is insufficient for `wrangler deploy`
- `package.json` — project metadata; `scripts.generate` runs `node generate.js`; `scripts.start` launches local server
- `CNAME` — contains `metsgate.com` for custom domain on Cloudflare Pages

## Platform Requirements

**Development:**
- Git
- Node.js (for running `generate.js` to convert CSV data)
- Python 3 (alternative for local dev server; or `npx serve .`)

**Production:**
- Cloudflare Pages — static site hosting
- Custom domain: `metsgate.com` (configured via `CNAME` file)
- No server-side compute required

## Data Pipeline

**Source Format:**
- `data/products.csv` — 7,430 lines; AWIN product feed export (Google Shopping format)
- Contains 7,429 products from advertiser "Perfumeria Comas FR" (AWIN advertiser ID 105475)

**Build Step:**
```bash
node generate.js  # Reads data/products.csv → writes data/products.json
```

**Output:**
- `data/products.json` — 148,582 lines (~14 MB); structured JSON array of product objects
- Fields: `id`, `title`, `description`, `link`, `image`, `affiliate_link`, `brand`, `price`, `sale_price`, `category`, `product_type`, `gtin`, `mpn`, `availability`, `condition`, `gender`, `color`, `size`

**Statistics:**
- 7,429 products total
- 245 unique brands (BIODERMA, CLARINS, CHLOÉ, CALVIN KLEIN, etc.)
- 5,881 products with sale prices (79%)
- 100% have affiliate links

---

*Stack analysis: 2026-08-19*
