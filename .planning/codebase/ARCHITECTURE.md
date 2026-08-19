<!-- refreshed: 2026-08-19 -->
# Architecture

**Analysis Date:** 2026-08-19

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    BUILD TIME (Node.js)                      │
│                                                             │
│  data/products.csv  ──→  generate.js  ──→  data/products.json│
│  (AWIN feed, 7429    (CSV parser)         (148K lines,       │
│   products, 7430      custom parseCSV()    structured JSON)  │
│   lines)                                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  RUNTIME (Browser)                           │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ index.html│──→│  script.js   │──→│  DOM Rendering     │  │
│  │ (entry)   │    │ (497 lines) │    │  (innerHTML-based) │  │
│  └──────────┘    └──────┬───────┘    └───────────────────┘  │
│                         │                                    │
│  ┌──────────┐           │          ┌───────────────────┐    │
│  │ style.css│───────────┘          │  localStorage     │    │
│  │ (910 ln) │                     │  (state persist)  │    │
│  └──────────┘                     └───────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                              │
│                                                             │
│  Cloudflare Pages (host)    AWIN (affiliate links)          │
│  Font Awesome (icons CDN)   via.placeholder.com (fallback)  │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `index.html` | Page structure, semantic HTML, SEO meta tags, CDN links | `index.html` |
| `style.css` | All styling: layout, responsive design, dark mode, animations | `style.css` |
| `script.js` | ALL application logic: data loading, filtering, rendering, comparison, state | `script.js` |
| `generate.js` | Build-time CSV-to-JSON data pipeline | `generate.js` |
| `wrangler.json` | Cloudflare Pages deployment configuration | `wrangler.json` |
| `CNAME` | Custom domain mapping for Cloudflare Pages | `CNAME` |

## Pattern Overview

**Overall:** Static Single-Page Application (SPA) — Vanilla HTML/CSS/JS with no framework

**Key Characteristics:**
- Zero runtime dependencies — no npm packages, no framework, no bundler
- All application state lives in module-level variables in `script.js`
- All rendering is done via `innerHTML` string concatenation (no virtual DOM, no template engine)
- Client-side filtering and pagination — entire dataset loaded on page load
- Build step is a single Node.js script converting CSV to JSON (run once, not on each request)
- Deployed as pure static files to Cloudflare Pages

## Layers

**Build Layer (Node.js):**
- Purpose: Convert raw AWIN CSV product feed into structured JSON
- Location: `generate.js`
- Contains: Custom CSV parser with quoted-field handling and HTML entity decoding
- Depends on: Node.js `fs` and `path` modules only
- Used by: Developer runs manually via `node generate.js` or `npm run generate`

**Presentation Layer (Browser):**
- Purpose: Render product catalog, filters, comparison UI, and dark mode
- Location: `index.html`, `style.css`, `script.js`
- Contains: Single HTML page, single CSS file, single JS file with all logic
- Depends on: Font Awesome CDN for icons
- Used by: End users visiting `metsgate.com`

**Data Layer (Static File):**
- Purpose: Serve pre-built product catalog to the browser
- Location: `data/products.json` (148,582 lines, ~14MB)
- Contains: Array of 7,429 product objects with normalized fields
- Depends on: `generate.js` to produce it from `data/products.csv`
- Used by: `script.js` via `fetch('data/products.json')`

## Data Flow

### Primary Request Path (Page Load)

1. Browser requests `index.html` from Cloudflare Pages CDN (`index.html:1`)
2. HTML loads `style.css` and Font Awesome CDN stylesheet (`index.html:15-16`)
3. HTML loads `script.js` at bottom of `<body>` (`index.html:122`)
4. `script.js` executes `loadProducts()` immediately (`script.js:497`)
5. `loadProducts()` fetches `data/products.json` via `fetch()` (`script.js:43`)
6. Response parsed into `allProducts` global array (`script.js:45`)
7. localStorage state restored: selection, wishlist, dark mode (`script.js:48-58`)
8. `populateFilters()` extracts unique brands and categories from data (`script.js:60`)
9. `applyFiltersAndRender()` applies current filters and calls `renderPage()` (`script.js:61`)
10. `renderPage()` slices paginated subset and calls `renderProducts()` (`script.js:159-168`)
11. `renderProducts()` builds HTML string and sets `productGrid.innerHTML` (`script.js:177-238`)

### Filter/Search Flow

1. User interacts with filter UI (search input, brand select, category select, price sliders, sale toggle)
2. Event listener fires → calls `applyFiltersAndRender()` (e.g., `script.js:436-476`)
3. `getFilteredProducts()` filters `allProducts` by all active criteria (`script.js:123-145`)
4. `filteredProducts` global is updated, page reset to 1 (`script.js:148-149`)
5. `renderPage()` → `renderProducts()` re-renders the grid (`script.js:159-168`)

### Product Comparison Flow

1. User checks "Comparer" checkboxes on product cards (`script.js:231-233`)
2. `handleSelectProduct()` adds/removes IDs from `selectedProducts` Set (`script.js:240-249`)
3. Selection persisted to `localStorage.selectedProductIds` (`script.js:247`)
4. `updateCompareBar()` updates fixed bottom bar count and button state (`script.js:264-273`)
5. When ≥2 selected, "Comparer" button enabled → click calls `showComparison()` (`script.js:314-415`)
6. Comparison modal shows price bar chart + attribute table (`script.js:329-413`)
7. Share feature generates URL with `?compare=id1,id2,id3` query param (`script.js:285-297`)
8. On page load, `loadCompareFromURL()` reads `?compare=` param and auto-opens comparison (`script.js:300-311`)

**State Management:**
- All state is in module-level variables in `script.js` (no state management library)
- `allProducts` — full dataset from JSON (read-only after load)
- `filteredProducts` — current filter results (rebuilt on every filter change)
- `selectedProducts` — `Set` of product IDs for comparison (persisted to localStorage)
- `wishlist` — `Set` of product IDs for favorites (persisted to localStorage)
- `currentPage` — current pagination page number
- `saleFilterActive` — boolean toggle for sale-only filter
- UI state (dark mode) persisted to `localStorage.darkMode`

## Key Abstractions

**Product Object:**
- Purpose: Normalized product representation from AWIN feed
- Source fields mapped in `generate.js:98-118`
- Fields: `id`, `title`, `description`, `link`, `image`, `affiliate_link`, `brand`, `price`, `sale_price`, `category`, `product_type`, `gtin`, `mpn`, `availability`, `condition`, `gender`, `color`, `size`
- Price format: String like `"16.95 EUR"` — parsed by `getNumericPrice()` (`script.js:116-121`)

**Filter Criteria:**
- Purpose: Encapsulates all active filter parameters
- Not a formal type — evaluated inline in `getFilteredProducts()` (`script.js:123-145`)
- Criteria: search text, brand, category, price range, sale-only toggle
- Category hierarchy: Uses `>` separator (e.g., `"Cheveux > Shampoings > ..."`) — filters on root category only

**Comparison Selection:**
- Purpose: Track which products are selected for side-by-side comparison
- Implementation: `selectedProducts` — `Set<number>` of product IDs (`script.js:4`)
- Minimum 2 required to trigger comparison
- Shareable via URL query parameter `?compare=id1,id2,...`

## Entry Points

**Browser Entry:**
- Location: `index.html` → loads `script.js` at line 122
- Triggers: Browser navigation to `metsgate.com` or localhost
- Responsibilities: Renders full product catalog with filters, search, comparison, dark mode

**Build Entry:**
- Location: `generate.js`
- Triggers: `node generate.js` or `npm run generate`
- Responsibilities: Reads `data/products.csv`, parses CSV, writes `data/products.json`
- CLI: No arguments — reads from fixed path `data/products.csv`, writes to `data/products.json`

**Shell Entry:**
- Location: `run.sh`
- Triggers: `bash run.sh`
- Responsibilities: Runs `node generate.js` then starts Python HTTP server on port 8000

## Architectural Constraints

- **Threading:** Single-threaded browser main thread — no Web Workers, no async beyond the initial `fetch()` call. All filtering/sorting runs synchronously on the main thread with 7,429 products.
- **Global state:** All state is in module-level `let`/`const` variables in `script.js` (lines 3-9). There are 8 global variables: `allProducts`, `selectedProducts`, `wishlist`, `currentPage`, `productsPerPage`, `filteredProducts`, `saleFilterActive`.
- **No module system:** Everything is in a single file scope — no ES modules, no CommonJS, no bundling. All functions are global.
- **No type safety:** Pure vanilla JavaScript with no TypeScript, no JSDoc type annotations, no type checking.
- **innerHTML-based rendering:** All UI updates use `innerHTML` string concatenation (`script.js:183-228`, `script.js:369-413`). This rebuilds the entire DOM subtree on each render.
- **Data size constraint:** The entire product catalog (14MB JSON) is loaded into memory on page load. No lazy loading, no virtual scrolling, no server-side pagination.

## Anti-Patterns

### innerHTML String Concatenation for UI Rendering

**What happens:** Product cards and comparison tables are built by concatenating HTML strings with template literals (`script.js:196-226`, `script.js:338-345`)
**Why it's wrong:** XSS risk if product data contains malicious content (though data is from trusted CSV). More practically, it destroys and recreates all DOM nodes on every filter/page change, losing scroll position and causing unnecessary reflows.
**Do this instead:** Use `document.createElement()` for individual elements, or adopt a lightweight template approach. At minimum, use `DocumentFragment` to batch DOM updates.

### Full Dataset Load Into Memory

**What happens:** All 7,429 products (~14MB JSON) are fetched and parsed into `allProducts` on page load (`script.js:43-45`)
**Why it's wrong:** Blocks main thread during JSON parse.浪费 bandwidth on mobile. Scales poorly as product count grows.
**Do this instead:** Implement server-side pagination via Cloudflare Workers, or use lazy loading with intersection observer. At minimum, compress the JSON (gzipped transfer encoding helps but parse time remains).

### Synchronous Filtering on Every Keystroke

**What happens:** `getFilteredProducts()` runs a full `Array.filter()` over 7,429 products on every filter change, including price slider `input` events (`script.js:443-457`)
**Why it's wrong:** Price slider `input` events fire rapidly during drag, causing multiple synchronous filter+render cycles per second.
**Do this instead:** Debounce filter operations (especially price slider). Use `requestAnimationFrame` to batch renders. Cache filtered results when filter inputs haven't changed.

### No Separation of Concerns in script.js

**What happens:** A single 497-line file contains data loading, filtering logic, DOM rendering, event handling, URL parsing, comparison logic, dark mode toggling, and localStorage management.
**Why it's wrong:** Makes the codebase difficult to modify, test, or reason about. Any change risks breaking unrelated features.
**Do this instead:** Split into logical modules: `data.js` (loading/filtering), `ui.js` (rendering), `comparison.js` (comparison logic), `storage.js` (localStorage). Even without a bundler, multiple `<script>` tags with IIFE patterns can provide separation.

### Re-attaching Event Listeners After Every Render

**What happens:** After `renderProducts()` sets `innerHTML`, new event listeners are attached to the fresh DOM nodes (`script.js:231-237`)
**Why it's wrong:** Old listeners are implicitly cleaned up (since innerHTML destroys old nodes), but this pattern is fragile and wasteful. Event delegation would be cleaner.
**Do this instead:** Use event delegation on `productGrid` — attach one listener that checks `e.target.closest('.select-product')` or `e.target.closest('.wishlist-btn')`. This survives innerHTML replacements without re-attachment.

## Error Handling

**Strategy:** Minimal — basic try/catch around the initial fetch, with `console.error` logging

**Patterns:**
- Fetch failure: `try/catch` in `loadProducts()` with `console.error` and user-facing error message (`script.js:44-68`)
- Price parsing: `getNumericPrice()` returns `0` for unparseable strings — no error thrown (`script.js:116-121`)
- Image loading: `onerror` attribute on `<img>` tags swaps to placeholder URL (`script.js:206`)
- No global error handler (`window.onerror` or `addEventListener('error')`) — uncaught errors are silent
- No validation of JSON structure after fetch — assumes correct format

## Cross-Cutting Concerns

**Logging:** `console.error` only for fetch failures (`script.js:66`). No `console.log` in production code. No logging framework.

**Validation:** None — no input validation on search, no validation that product JSON has expected fields, no sanitization of product data before HTML insertion.

**Authentication:** None — fully public site, no user accounts, no access control.

**SEO:** Meta tags in `index.html` (`<title>`, `<meta description>`, `<meta robots>`, Open Graph tags). Single-page app means search engines can index the static HTML shell but not dynamically rendered product content.

**Internationalization:** UI is in French only (`lang="fr"` in `index.html`). No i18n framework. Product data from CSV is also in French.

**Accessibility:** No ARIA attributes, no keyboard navigation support beyond default browser behavior, no focus management for modal, no skip-to-content link.

---

*Architecture analysis: 2026-08-19*
