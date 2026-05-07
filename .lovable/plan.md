# JIM Tile Color Calibration — Switch to #F5B82E

Replace the current JIM honey accent with a brighter saffron-amber `#F5B82E`. Dark text treatment on JIM and JIV stays unchanged.

## Color changes

- JIM library tile accent (`PRODUCT_ACCENT.jag_i_mig`): `#E0B374` → `#F5B82E`
- JIM palette `tileLight`: `#E8C593` → `#F5B82E`
- JIM manifest `ctaButtonColor`: `#E0B374` → `#F5B82E`

(Using a single value across accent/tileLight/CTA for a flat, saturated read. If we want a lighter palette `tileLight` for gradients, we can split later.)

## Files to edit

1. **`src/data/products/jag-i-mig.ts`** — `ctaButtonColor: '#F5B82E'`, `tileLight: '#F5B82E'`
2. **`src/lib/palette.ts`** — `productTileColors.jag_i_mig.tileLight: '#F5B82E'`
3. **`src/components/ProductLibrary.tsx`** — `PRODUCT_ACCENT.jag_i_mig: '#F5B82E'`
4. **`src/components/ProductLibraryMock.tsx`** — `PRODUCT_ACCENT.jag_i_mig: '#F5B82E'` and `--jim-bg-1: #F5B82E`

## Out of scope (unchanged)

- `darkTextOnTile: true` and `#5A3A1F` text color on JIM + JIV
- JIM product home background `#115D57`, `tileMid`, `tileDeep`, `accentColor` HSL tokens
- JIV everything

## Verification

- `/bibliotek` → JIM tile shows saturated amber with dark brown text

## Rollback

Revert the four values to the previous honey (`#E0B374` / `#E8C593`).
