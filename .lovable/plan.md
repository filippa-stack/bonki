## Product Home Refinements — Round 3

Two scoped visual edits. No structural/behavioral changes.

### 1. `src/components/ProductCardTile.tsx` — Replace Klart pill with floating checkmark

Replace the entire `{isCompleted && (<motion.div role="status" ...>...Klart...</motion.div>)}` block with a single saffron stroke checkmark SVG (18×18) at top:12 right:12, zIndex 4, with a subtle drop-shadow for legibility. No background, no border, no text label.

- Keep: `isFirstRenderRef` pattern (rename usage to match existing `skipPillAnimation` logic — already present), `role="status"`, 240ms opacity transition with `[0.32, 0.72, 0, 1]` easing.
- Add: `aria-label="Klart"` on the motion div (replaces the visible text as accessible label).
- Remove: pill background, border, padding, border-radius, font styling, leading ✓ span, "Klart" text node.
- Imports: remove `LANTERN_GLOW` import (no longer used in this file). Keep `SAFFRON_FLAME`, `motion`, `useRef`, `useEffect`.

SVG path: `M3.5 9.5 L7.5 13.5 L14.5 5.5`, stroke `SAFFRON_FLAME`, strokeWidth 2.5, round caps/joins. Filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))`.

### 2. `src/components/CategoryFilterChips.tsx` — Widen right-edge fade

In the right-edge fade overlay (single element after the chips container):
- `width`: `24px` → `40px`
- gradient end stop: `rgba(0,0,0,0.25)` → `rgba(0,0,0,0.35)`
- Direction stays `to right` (transparent left → dark right). Verified: only one overlay element exists, no second sibling to remove.

### Preserved

Hero, sticky header, NextActionBanner, filter mount-everything pattern, easing/durations/stagger, ARIA live region, chip padding, all `ProductCardTile` styling (illustration, 25% scrim, title, aspect ratio, routing).

### Files

- `src/components/ProductCardTile.tsx` — issue 1
- `src/components/CategoryFilterChips.tsx` — issue 2
