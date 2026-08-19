# Codebase Structure

**Analysis Date:** 2026-08-19

## Directory Layout

```
metagete/
├── index.html              # Main page — single HTML entry point
├── script.js               # ALL application logic (497 lines)
├── style.css               # ALL styling (910 lines)
├── generate.js             # Build tool: CSV → JSON converter (135 lines)
├── run.sh                  # Dev convenience: generate + serve
├── package.json            # Project metadata (no dependencies)
├── wrangler.json           # Cloudflare Pages config
├── CNAME                   # Custom domain: metsgate.com
├── .gitignore              # Ignores node_modules/, .DS_Store, errer/
├── data/
│   ├── products.csv        # Source data: AWIN product feed (7,430 lines)
│   ├── products.json       # Generated data: structured product catalog (148,582 lines)
│   └── metsgate.com.txt    # DNS zone export (archival)
├── images/
│   └── LOGO_150.png        # Site logo
├── doc/
│   ├── README.md           # French documentation
│   └── README_AR.md        # Arabic documentation
├── errer/                  # Build logs (gitignored)
│   └── *.build.log
└── .planning/
    └── codebase/           # GSD codebase mapping documents
        ├── STACK.md
        ├── INTEGRATIONS.md
        ├── ARCHITECTURE.md
        └── STRUCTURE.md
```

## Directory Purposes

**`/` (project root):**
- Purpose: All source files live directly in root — no `src/`, `lib/`, or `app/` subdirectories
- Contains: `index.html`, `script.js`, `style.css`, `generate.js`, config files
- Key files: `index.html` (entry), `script.js` (logic), `style.css` (styles)

**`data/`:**
- Purpose: Product data — both source CSV and generated JSON
- Contains: `products.csv`, `products.json`, DNS zone export
- Key files: `data/products.json` (runtime data, 14MB), `data/products.csv` (source feed, 7,430 lines)

**`images/`:**
- Purpose: Static image assets
- Contains: Site logo only
- Key files: `images/LOGO_150.png`

**`doc/`:**
- Purpose: Project documentation in multiple languages
- Contains: French and Arabic README files
- Key files: `doc/README.md`, `doc/README_AR.md`

**`errer/`:**
- Purpose: Build error logs from Cloudflare Pages deployments
- Contains: `.build.log` files (gitignored)
- Key files: `matsgate.production.*.build.log`

**`.planning/`:**
- Purpose: GSD workflow state and codebase mapping documents
- Contains: `codebase/` subdirectory with analysis documents
- Key files: `STACK.md`, `INTEGRATIONS.md`, `ARCHITECTURE.md`, `STRUCTURE.md`

## Key File Locations

**Entry Points:**
- `index.html`: Browser entry — the only HTML page, loaded by navigating to `metsgate.com`
- `generate.js`: Build entry — run via `node generate.js` or `npm run generate`
- `run.sh`: Dev entry — runs generate then starts local server

**Configuration:**
- `package.json`: Project metadata, npm scripts (`generate`, `start`)
- `wrangler.json`: Cloudflare Pages deployment config (`name`, `compatibility_date`, `assets`)
- `CNAME`: Custom domain mapping (`metsgate.com`)
- `.gitignore`: Excludes `node_modules/`, `.DS_Store`, `errer/`

**Core Logic:**
- `script.js`: ALL application logic — data loading, filtering, rendering, comparison, state management (497 lines, single file)
- `generate.js`: CSV parser and JSON generator (135 lines)

**Styling:**
- `style.css`: ALL styles — layout, components, responsive breakpoints, dark mode (910 lines)

**Data:**
- `data/products.csv`: Raw AWIN product feed (7,429 products, 62 CSV columns)
- `data/products.json`: Normalized product catalog (7,429 products, 17 fields each)

## Naming Conventions

**Files:**
- Lowercase with dots for multi-word: `generate.js`, `wrangler.json`
- Single word preferred: `script.js`, `style.css`, `index.html`
- Data files use descriptive names: `products.csv`, `products.json`
- No prefix/suffix patterns (no `app.`, no `.min.`, no `.config.`)

**Functions:**
- camelCase: `loadProducts`, `applyFiltersAndRender`, `getFilteredProducts`, `renderProducts`, `showComparison`, `toggleDarkMode`
- Event handlers prefixed with `handle`: `handleSelectProduct`, `handleWishlist`
- Boolean getters prefixed with `is` or descriptive: `saleFilterActive`
- DOM update functions prefixed with `update`: `updateCompareBar`, `updatePaginationControls`, `updateResultsCount`, `updatePriceDisplay`

**Variables:**
- camelCase for all: `allProducts`, `selectedProducts`, `currentPage`, `productsPerPage`, `filteredProducts`, `saleFilterActive`
- DOM element references stored as module-level constants: `productGrid`, `loadingSpinner`, `searchInput`, etc. (`script.js:12-37`)

**CSS Classes:**
- kebab-case: `product-card`, `price-filter`, `compare-bar`, `dark-mode`, `sale-badge`
- State classes: `.active`, `.show`, `.dark-mode`
- Component prefix pattern: `.product-card`, `.product-grid`, `.product-img`
- BEM is NOT used — flat class naming throughout

**HTML IDs:**
- camelCase: `searchInput`, `brandFilter`, `categoryFilter`, `priceMin`, `priceMax`, `compareBtn`, `compareModal`, `productGrid`, `darkModeToggle`
- Used for `getElementById` lookups in `script.js:12-37`

## Where to Add New Code

**New Feature (client-side):**
- Add HTML structure to `index.html` in the appropriate `<section>` or `<div>`
- Add logic to `script.js` as new functions, attach event listeners at bottom
- Add styles to `style.css` at the end of the relevant section (or end of file)
- Add any new DOM element references to the variable declarations at top of `script.js:12-37`

**New Data Field:**
- Add field mapping in `generate.js:98-118` (the `product` object construction)
- Reference field in `script.js` rendering functions as needed
- Regenerate `data/products.json` via `node generate.js`

**New Filter Type:**
- Add HTML control to `index.html` inside `<div class="filter-options">`
- Add filter logic to `getFilteredProducts()` in `script.js:123-145`
- Add event listener at bottom of `script.js` (lines 436-494)
- Style new control in `style.css`

**New Styling:**
- Add to `style.css` — follow existing section comments (/* Header */, /* Filters */, /* Product Grid */, etc.)
- Dark mode variants: add `body.dark-mode .new-class { ... }` rules after the light-mode rules
- Responsive: add to existing `@media (max-width: 768px)` and `@media (max-width: 480px)` blocks

**Documentation:**
- Update `doc/README.md` (French) and `doc/README_AR.md` (Arabic) in parallel
- Follow existing emoji + bold heading format

## Special Directories

**`errer/`:**
- Purpose: Cloudflare Pages build error logs
- Generated: Yes (by Cloudflare build pipeline)
- Committed: No (gitignored)
- Note: Directory name is a typo for "erreurs" (French for "errors")

**`data/`:**
- Purpose: Product data files
- Generated: `products.json` is generated; `products.csv` is the source feed
- Committed: Yes (both CSV and JSON are in git)
- Note: `products.json` at 148,582 lines is very large for a git repo

**`.planning/`:**
- Purpose: GSD workflow state and codebase analysis documents
- Generated: Yes (by GSD tooling)
- Committed: Depends on project policy (typically excluded from PRs)

---

*Structure analysis: 2026-08-19*
