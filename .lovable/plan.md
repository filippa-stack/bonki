

## Why Vårt Vi gets cropped on desktop — and the fix

### Root cause

The Vårt Vi tile uses a custom illustration block (not the shared `PastelTile` used by the kids tiles). Two things in that block break on wide viewports:

1. **`width: '92%'`** on the illustration wrapper is a percentage of the **tile width**. On mobile (~350 px wide) that's ~322 px — fine. On desktop (~1400 px wide) it becomes ~1290 px, but the tile is only 260 px tall.
2. The wrapper is anchored `right: -12%` and stretches the full height. Combined with `objectFit: contain`, the image scales to fit the wrapper's **height** (260 px), then `objectPosition: 'right bottom'` pins it to the wrapper's right edge — which sits ~170 px **outside** the tile. `overflow: hidden` on the tile then clips the character in half.

The kids tiles don't have this problem because `PastelTile` sets a `max-width` constraint via the `ILLUSTRATION_SCALE` map per product, and the illustrations are designed to bleed only a bit past the right edge.

### Fix

Treat Vårt Vi the same way the kids tiles are treated — pin the illustration to a height-based size so it stays inside the tile regardless of viewport width.

Change the wrapper in `ProductLibrary.tsx` (the Vårt Vi block, lines 986–1009):

- Replace `width: '92%'` with a **height-anchored** sizing model:
  - `height: '120%'` (slightly taller than the tile so it can bleed top/bottom),
  - `width: 'auto'` on the wrapper,
  - `aspectRatio` matched to the source PNG so `objectFit: contain` doesn't waste space.
- Keep `right: -12%` but cap the visual bleed: change `right` to a fixed pixel value (e.g. `right: '-40px'`) so the character peeks consistently at any width instead of scaling its offset with the tile.
- Optional: add `maxWidth: '320px'` to the wrapper so on ultra-wide screens the character stays the same size as on mobile rather than ballooning.

Net effect on desktop: the character renders at its mobile size, anchored to the right edge of the tile with a consistent `~40 px` bleed — same composition as on phone.

### Files changed

- `src/components/ProductLibrary.tsx` — only the Vårt Vi illustration wrapper (lines 986–1009).

### Untouched

- Kids tiles (already correct).
- Vårt Vi text block, scrim, badge, resume indicator.
- The illustration asset itself.
- Any other product or layout.

### Verification

- Mobile (390 px): character peeks from the right exactly as today.
- Tablet / desktop (≥768 px): character stays anchored right with the same visual size, no clipping through the body.
- Bibliotek scroll, badges, and "Fortsätt" indicator unchanged.

### Rollback

Revert the wrapper style block in `ProductLibrary.tsx`.

