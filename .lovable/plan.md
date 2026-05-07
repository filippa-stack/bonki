## Goal

Visual A/B test: swap Jag i Mig from saturated teal to muted warm honey, and apply dark brown text to both JIM and Jag i Världen library tiles (their lighter backgrounds can't carry white text).

## Color changes

- JIM library tile accent: `#27A69C` → `#E0B374`
- JIM palette `tileLight`: `#27A69C` → `#E8C593`
- JIM manifest `ctaButtonColor`: `#27A69C` → `#E0B374`
- Dark text on tile (`#5A3A1F` for both title and subtitle): JIM + JIV
- All other JIM tokens (deep teal `backgroundColor`, `tileMid`, `tileDeep`, `accentColor` HSL) — unchanged
- All other JIV tokens — unchanged (only adding the dark-text flag)

## Approach for the dark text

Add `darkTextOnTile?: boolean` to `ProductManifest`, default false. Set `true` on `jag_i_mig` and `jag_i_varlden` manifests. Both `ProductLibrary.tsx` and `ProductLibraryMock.tsx` read the flag at render time and conditionally use `#5A3A1F` for `<h3>` and the subtitle `<p>` (full opacity, not the translucent white). Pill stays as-is.

This keeps the rule co-located with each product's palette — future palette swaps just flip the flag.

## Files to edit

1. **`src/types/product.ts`** — add `/** When true, library tile renders dark brown text instead of white (for light backgrounds) */ darkTextOnTile?: boolean;`

2. **`src/data/products/jag-i-mig.ts`** (manifest, ~line 519+):
   - `ctaButtonColor: '#E0B374'`
   - `tileLight: '#E8C593'`
   - add `darkTextOnTile: true`

3. **`src/data/products/jag-i-varlden.ts`** (manifest):
   - add `darkTextOnTile: true`

4. **`src/lib/palette.ts`** (`productTileColors.jag_i_mig`):
   - `tileLight: '#E8C593'`

5. **`src/components/ProductLibrary.tsx`**:
   - Line 61: `PRODUCT_ACCENT.jag_i_mig: '#27A69C'` → `'#E0B374'`
   - Tile component (lines 177-203): accept/derive `darkTextOnTile` from the product manifest passed in; when true, set `<h3>` color = `#5A3A1F` and subtitle `<p>` color = `#5A3A1F` (drop the translucent white).

6. **`src/components/ProductLibraryMock.tsx`**:
   - Mirror PRODUCT_ACCENT update for JIM (`#2A6B65` → `#E0B374`)
   - Mirror conditional dark text rendering using the same manifest flag.

## Out of scope (confirmed)

- JIM product home page background (`#115D57`), `tileMid`, `tileDeep`, `accentColor` HSL tokens
- Any JIV color changes beyond the text flag
- Any redesign of dependent surfaces beyond what `ctaButtonColor` propagates automatically

## Review surfaces

- `/bibliotek` → JIM tile honey + dark brown text; JIV tile olive + dark brown text; all other tiles unchanged
- JIM product home → resume banner / CTAs pick up honey via `useProductTheme`; deep teal background remains
- Mock library page (same dark text treatment for parity)

## Rollback

Revert the five color values to original; remove `darkTextOnTile: true` from both manifests; remove the conditional in both library files. The interface field can stay (no-op when no manifest sets it).
