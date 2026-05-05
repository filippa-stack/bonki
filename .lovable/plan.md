Change the Still Us tile accent color on the Library page from `#005696` to `#6495ED` (Cornflower Blue).

### Change
- `src/components/ProductLibrary.tsx` (line 60): update `PRODUCT_ACCENT.still_us` to `#6495ED`.

This affects the tile background and the tinted progress pill (which is derived from `PRODUCT_ACCENT[productId]`). No other files need changes — `palette.ts` `productTileColors.still_us` is used elsewhere and remains untouched.