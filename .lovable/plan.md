

# Product Color & Illustration Opacity Update

## Summary

Three changes: update product color assignments, use light color for home screen backgrounds, and remove all illustration dimming on tiles.

## 1. Update product data — new `tileLight` values

Two products have new light colors. Update in their data files:

### `src/data/products/jag-i-mig.ts`
- `tileLight`: `#CB7AB2` → `#27A69C`
- Also update `ctaButtonColor` and `tileMid` to harmonize with the new teal

### `src/data/products/jag-med-andra.ts`
- `tileLight`: `#A62755` → `#CB7AB2`
- Also update `ctaButtonColor` and `tileMid` to harmonize

All other products already have correct light/dark values.

## 2. Home screen background = light color

### `src/components/KidsProductHome.tsx`
- Change page background from `product.backgroundColor` (dark) to `product.tileLight` (light)
- Line 349: `const bg = product.backgroundColor` → `const bg = product.tileLight ?? product.backgroundColor`
- The scrim gradients and text shadows already reference `bg`, so they'll adapt automatically

## 3. Portal, session & completion pages keep dark color

These already use `product.backgroundColor` — no changes needed:
- `KidsCardPortal.tsx` page bg (line 229) — uses `product.backgroundColor` ✓
- `CardView.tsx` session/completion screens — uses `product.backgroundColor` ✓
- `CompletedSessionView.tsx` — uses `product.backgroundColor` ✓

## 4. Full opacity on all tile illustrations

### `src/components/KidsProductHome.tsx`
- `TILE_ILLUSTRATION_STYLES` (lines 66-72): all `opacity: 0.38` → `1`
- `SQUARE_TILE_ILLUSTRATION_STYLES` (lines 75-81): all `opacity: 0.38` → `1`

### `src/components/CategoryTileGrid.tsx`
- `DEFAULT_TILE_CREATURE_STYLES` (lines 17-23): all opacity values → `1`

## Files touched
1. `src/data/products/jag-i-mig.ts` — tileLight color
2. `src/data/products/jag-med-andra.ts` — tileLight color
3. `src/components/KidsProductHome.tsx` — bg source + tile opacity
4. `src/components/CategoryTileGrid.tsx` — tile opacity

## What stays the same
All copy, links, CTAs, navigation, session logic, animations, portal structure.

