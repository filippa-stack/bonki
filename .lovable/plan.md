

# Fix Illustration Opacity — Library = Full, Home Tiles = Keep 0.38

The 0.38 opacity was incorrectly applied to library tiles. It should only be on product home screen background illustrations. Library tiles should show illustrations at full intensity.

## Changes

### `src/components/ProductLibrary.tsx`

1. **`ILLUSTRATION_OPACITY` constant** (lines 95-101): Set all values to `1`
2. **Still Us custom tile** (line 743): Change `opacity: 0.38` → `opacity: 1`

### No changes to `KidsProductHome.tsx`

The 0.38 opacity on home screen tiles stays as-is — that's the intended behavior.

