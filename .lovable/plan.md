# Remove kids tile bottom scrim

## Edit: `src/components/ProductCardTile.tsx`

Delete the scrim element at lines 88–101 (the `{/* Bottom scrim — inset to match the 16px frame */}` block and the `<div>` immediately following it). Nothing else changes.

Title's `textShadow` already provides legibility — kept as-is. Illustration container, title block, completion checkmark, press state, outer shape all unchanged. `AdultProductCardTile.tsx` not touched.

## Verification (390×844)

Open `/product/jag-i-mig` and other kids product homes — no darkening band at card bottoms; per-product color frame reads as a clean continuous matte; titles remain legible from text-shadow alone.
