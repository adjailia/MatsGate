# Testing Patterns

**Analysis Date:** 2026-08-19

## Test Framework

**Runner:** Not detected — no test framework is configured or installed.

**Assertion Library:** Not detected.

**Run Commands:** None. The `package.json` scripts section contains only:
```json
{
  "generate": "node generate.js",
  "start": "python3 -m http.server 8000 || npx serve ."
}
```

**No test-related files exist:**
- No `jest.config.*`
- No `vitest.config.*`
- No `.mocharc.*`
- No `*.test.*` files
- No `*.spec.*` files
- No `__tests__/` directories
- No `test/` directories
- No testing libraries in `package.json` (no `devDependencies` section at all)

## Current State

**Coverage:** 0% — no tests exist in the codebase.

**What is tested:** Nothing. There is no automated testing of any kind.

## What Would Need Testing

Given the codebase structure, the following areas are candidates for testing:

### `script.js` — Client-Side Logic (497 lines)

**Pure Functions (testable without DOM):**
- `getNumericPrice(priceStr)` (line 116) — parses price strings like `"29,90€"` into floats
- `getFilteredProducts()` (line 123) — requires DOM mocks for filter inputs
- `loadCompareFromURL()` (line 300) — requires URL mocking

**State Management:**
- `handleSelectProduct(e)` (line 240) — toggles `selectedProducts` Set
- `handleWishlist(e)` (line 251) — toggles `wishlist` Set
- `clearAllSelections()` (line 275) — clears `selectedProducts`

**DOM Manipulation:**
- `renderProducts(products)` (line 177) — generates HTML string and sets `innerHTML`
- `showComparison()` (line 314) — builds comparison table HTML
- `showLoading(show)` (line 73) — toggles spinner visibility
- `updatePaginationControls(totalPages)` (line 171) — updates button states

### `generate.js` — CSV Parser (135 lines)

**Pure Functions (testable):**
- `parseCSV(csv)` (line 32) — custom CSV parser with quote handling
- Handles BOM removal, quoted fields, HTML entity replacement

**Integration:**
- File I/O: reads `data/products.csv`, writes `data/products.json`

## Recommended Test Setup

If tests were to be added, the following would be appropriate for this vanilla JS project:

**For `script.js` (browser logic):**
- Framework: Vitest or Jest with jsdom environment
- Pattern: Co-located test files (`script.test.js`)
- Challenge: Heavy DOM coupling — most functions depend on global DOM elements accessed via `document.getElementById()`. Testing would require either refactoring to dependency injection or extensive DOM mocking.

**For `generate.js` (Node.js script):**
- Framework: Node.js built-in test runner (`node --test`) or Vitest
- Pattern: Co-located (`generate.test.js`)
- `parseCSV()` is a pure function and easily testable
- File I/O can be tested with `tmp` fixtures

## Recommended Refactoring for Testability

To enable testing, the following changes would be needed:

1. **Extract `parseCSV()` from `generate.js`** into a separate module so it can be imported and tested independently.

2. **Refactor `script.js` to avoid global state:**
   - Wrap in an IIFE or module pattern
   - Pass DOM references as parameters rather than accessing globals
   - Separate pure logic (filtering, price parsing) from DOM manipulation

3. **Add a build step** (Vite, esbuild, or similar) to enable ES module imports and testing.

## Barriers to Testing

| Barrier | Location | Impact |
|---------|----------|--------|
| No module system | `script.js` global scope | Cannot import functions for unit testing |
| DOM coupling | All functions in `script.js` | Requires jsdom or browser environment for any test |
| No `devDependencies` | `package.json` | No test runner available without adding packages |
| No build tool | Root project | Cannot use import/export syntax |
| Custom CSV parser | `generate.js:parseCSV()` | Would benefit from tests but is self-contained |

---

*Testing analysis: 2026-08-19*
