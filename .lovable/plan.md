## Replace locked Vårt Vi preview tiles with a medallion row

Scope: visual swap of the `!isPurchased` branch in `VartViPreviewStrip` (`src/components/ProductLibrary.tsx`, lines 296–342). Everything else — purchased branch, expansion overlay, state wiring, data, routing — stays untouched.

### Change

Replace the 2×2 italic-serif tile grid with:

1. Small-caps eyebrow `"Börja med en fråga"` above the row (white, low opacity, centered, letter-spaced).
2. A horizontal `flex` row of 4 circular medallions filling the strip width, sourced from `PREVIEW_QUESTIONS.still_us` (up to 4 entries) and `PREVIEW_TILE_COLORS` (cornflower / dusty rose / warm gold / storm grey).
3. Each medallion = outer circle in the tile color + inner darker circle (via `color-mix(in srgb, <bg> 78%, #000)`) + a large italic-serif quote glyph (`"`) centered inside.
4. Foreground rule: white glyph on cornflower / dusty rose / storm grey; `#5F4114` on warm gold for contrast.
5. Small-caps caption `"En fråga"` below each medallion (white, low opacity).
6. Outer button stays `motion.button` with `layoutId={`preview-tile-${i}`}` so the existing shared-layout expansion overlay still morphs correctly. The inner glyph keeps `layoutId={`preview-text-${i}`}`. `onClick={() => onUnpurchasedTileTap(i)}`.

### Untouched

- Purchased branch (lines 344+): `Nästa` / `Era samtal` eyebrow and `PreviewCardPurchased` 2×2 grid.
- Expansion overlay (around line 959) — already reads `PREVIEW_QUESTIONS.still_us` by `expandedTileIndex`.
- `setExpandedTileIndex`, `onUnpurchasedTileTap`, `PREVIEW_QUESTIONS`, `PREVIEW_TILE_COLORS`, `CARD_SEQUENCE`.
- All other components, hooks, routing, data fetching.

### Notes

- `WARM_GOLD`, `CORNFLOWER`, `DUSTY_ROSE`, `STORM_GREY` are already imported at line 18 — no new imports needed.
- `PREVIEW_QUESTIONS` already imported at line 7.
- Pure presentation diff, ~60 lines replacing ~46 lines in one file.

### Verification

- TypeScript build clean.
- Vi tab unpurchased: eyebrow visible, 4 medallions horizontal, correct fg/bg per color, captions below.
- Tap a medallion → shared-layout expansion overlay opens with full question text + close button (unchanged behavior).
- Vi tab purchased state: unchanged.