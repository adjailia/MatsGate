# Coding Conventions

**Analysis Date:** 2026-08-19

## Language & Comments

**Code Language:** JavaScript ES6 (vanilla, no transpilation)

**Comment Language:** French (with some Arabic mixed in via Unicode characters)

**Comment Style:**
- Section headers use `//` single-line comments in French: `// تحميل المنتجات` (line 40, `script.js`)
- Inline comments use `//` for brief explanations
- No JSDoc or TSDoc anywhere in the codebase
- Comments are sparse and functional rather than descriptive

## Naming Patterns

**Files:**
- Lowercase, short names: `script.js`, `generate.js`, `style.css`, `index.html`
- No prefix/suffix conventions (no `.utils.js`, `.service.js` patterns)
- All source files live at the repository root

**Variables — Global State (module-level in `script.js`):**
- `camelCase` for all variables: `allProducts`, `selectedProducts`, `currentPage`, `productsPerPage`, `filteredProducts`, `saleFilterActive`
- `const` for fixed values: `const productsPerPage = 20;`
- `let` for mutable state: `let currentPage = 1;`, `let filteredProducts = [];`
- `Set` objects for collection state: `selectedProducts`, `wishlist`

**Variables — DOM References:**
- `camelCase` matching the element ID with the suffix removed when obvious, but generally matching the ID exactly in camelCase: `productGrid` ← `#productGrid`, `searchInput` ← `#searchInput`, `brandFilter` ← `#brandFilter`
- All DOM references are declared at module top level using `document.getElementById()`

**Functions:**
- `camelCase`: `loadProducts()`, `showLoading()`, `populateFilters()`, `getNumericPrice()`, `getFilteredProducts()`, `applyFiltersAndRender()`, `renderPage()`, `renderProducts()`, `handleSelectProduct()`, `handleWishlist()`, `updateCompareBar()`, `clearAllSelections()`, `shareComparison()`, `loadCompareFromURL()`, `showComparison()`, `closeModal()`, `toggleDarkMode()`, `updatePriceDisplay()`
- Prefix convention for handlers: `handle` for event handlers (`handleSelectProduct`, `handleWishlist`)
- Prefix convention for updates: `update` for DOM update functions (`updateCompareBar`, `updateResultsCount`, `updatePaginationControls`, `updatePriceDisplay`)
- Prefix convention for rendering: `render` for rendering functions (`renderPage`, `renderProducts`)

**CSS:**
- BEM-like but not strict BEM: `.product-card`, `.price-bar`, `.compare-table`, `.modal-content`
- State classes: `.active`, `.show`, `.dark-mode`
- Descriptive compound names: `.btn-buy`, `.btn-buy-sm`, `.wishlist-btn`, `.sale-badge`, `.price-diff`
- CSS custom properties not used; hardcoded colors: `#008552` (green), `#e74c3c` (red), `#1E3A8A` (blue)

**HTML IDs:**
- `camelCase` for all IDs: `productGrid`, `searchInput`, `brandFilter`, `priceMin`, `compareModal`, `darkModeToggle`
- Buttons use verb or action names: `compareBtn`, `clearFilters`, `saleFilter`, `shareCompareBtn`

## Code Style

**Formatting:**
- No linter configured (no `.eslintrc`, no `eslint.config.js`, no `biome.json`)
- No formatter configured (no `.prettierrc`, no `prettier.config.js`)
- 2-space indentation in JS and CSS
- Single quotes for JS strings
- Semicolons used consistently
- No trailing commas observed
- Opening braces on same line (K&R style)

**Linting:**
- Not configured — no linting tools present in `package.json` or as config files

## Import Organization

**Pattern:** No module system used
- `generate.js` uses CommonJS (`require('fs')`, `require('path')`)
- `script.js` uses no imports/exports — pure browser script loaded via `<script src="script.js">` tag
- `index.html` loads external CSS via `<link>` and JS via `<script src>` at end of `<body>`
- External CDN: Font Awesome loaded from `cdnjs.cloudflare.com` in `index.html` (line 16)

**Path Aliases:** Not applicable — no build tool or bundler

## DOM Manipulation Pattern

**Element References:** All DOM elements are cached at module top level (`script.js` lines 12-37) using `document.getElementById()`. Single element lookup via `document.querySelector()` used once for `.close-btn` (line 29).

**Event Binding:** Events are bound at the bottom of `script.js` (lines 436-494) after function definitions. Pattern:
```javascript
searchBtn.addEventListener('click', () => { currentPage = 1; applyFiltersAndRender(); });
```

**HTML Generation:** Products and comparison tables are rendered via string concatenation into `innerHTML`. See `renderProducts()` (line 177) and `showComparison()` (line 314).

## Error Handling

**Pattern:** Minimal try/catch in `loadProducts()` only:
```javascript
try {
  const response = await fetch('data/products.json');
  if (!response.ok) throw new Error('Erreur de chargement');
  allProducts = await response.json();
  // ...
} catch (error) {
  console.error('Erreur:', error);
  productGrid.innerHTML = '<p class="error">Impossible de charger les produits.</p>';
} finally {
  showLoading(false);
}
```

- No error handling in `generate.js` (synchronous `fs.readFileSync` will throw on missing file with no catch)
- No error boundaries or global error handlers
- User-facing errors are displayed via `innerHTML` with a `.error` class

## State Management

**Approach:** Global module-scope variables in `script.js`

**State Variables:**
| Variable | Type | Purpose | File:Line |
|----------|------|---------|-----------|
| `allProducts` | `Array` | All loaded products | `script.js:3` |
| `selectedProducts` | `Set` | IDs selected for comparison | `script.js:4` |
| `wishlist` | `Set` | IDs in wishlist | `script.js:5` |
| `currentPage` | `Number` | Current pagination page | `script.js:6` |
| `filteredProducts` | `Array` | Currently filtered products | `script.js:8` |
| `saleFilterActive` | `Boolean` | Whether sale filter is on | `script.js:9` |

**Persistence:** `localStorage` for `selectedProducts`, `wishlist`, and `darkMode` state. Serialized with `JSON.stringify([...set])` and restored via `JSON.parse()`.

## CSS Conventions

**Specificity:** Avoids IDs for styling; uses class selectors throughout. ID selectors used only in `#pageInfo` and `#compareTableContainer`.

**Dark Mode:** Achieved via `body.dark-mode` class toggle. All dark mode styles are co-located with their base styles using the descendant selector pattern `body.dark-mode .className`.

**Responsive Breakpoints:**
- `768px` — tablet breakpoint
- `480px` — mobile breakpoint

**Transitions:** Consistent `transition: all 0.2s` or `transition: background 0.2s` on interactive elements.

## JavaScript Patterns

**No Modules:** Everything is in global scope. Two JS files:
- `script.js` — browser application logic (497 lines)
- `generate.js` — Node.js CSV-to-JSON conversion script (135 lines)

**Async Pattern:** Single `async function` (`loadProducts`) with `try/catch/finally`. Other async operations (`navigator.clipboard.writeText`) use `.then()/.catch()`.

**Array Methods:** Functional style used for filtering: `Array.filter()`, `Array.map()`, `Array.forEach()`, `Array.reduce()` not used.

**Template Literals:** Used for HTML generation with backtick strings and `${}` interpolation.

**No Classes or Prototypes:** All functions are standalone; no OOP patterns.

## Project-Specific Conventions

**French UI Text:** All user-facing strings are in French. Developer comments mix French and Arabic.

**Product Data Shape:** Products from `data/products.json` follow this shape (defined in `generate.js` lines 98-118):
```javascript
{
  id: Number,
  title: String,
  description: String,
  link: String,
  image: String,
  affiliate_link: String,
  brand: String,
  price: String,
  sale_price: String,
  category: String,
  product_type: String,
  gtin: String,
  mpn: String,
  availability: String,
  condition: String,
  gender: String,
  color: String,
  size: String
}
```

**External Dependencies:**
- Font Awesome 6.0.0-beta3 (CDN only — no `node_modules` needed at runtime)
- No npm runtime dependencies in `package.json`

---

*Convention analysis: 2026-08-19*
