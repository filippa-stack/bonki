## Goal

Kids product home tiles read as a single solid plate the same color as the page background, lifted off the page by a true neumorphic dual-shadow. No inner-plate color, no border, no drop shadow.

## Scope

`KidsProductHome` grid tiles only (the `ProductCardTile` cells). `KidsTileFrame` is shared with the library and the card portal — I'll add an opt-in `neumorphic` mode keyed off a new `pageBg` prop, so existing callers (library, portal) stay pixel-identical.

## Edits

### 1. `src/components/KidsTileFrame.tsx`

Add optional prop `pageBg?: string`. When provided, render in neumorphic mode:

- **Outer wrapper**: `backgroundColor = pageBg`, remove the `1px rgba(255,255,255,0.10)` border, replace `boxShadow` with a raised dual-shadow derived from `pageBg`:
  ```
  boxShadow: `8px 8px 18px ${darken(pageBg, 0.12)}, -8px -8px 18px ${lighten(pageBg, 0.10)}`
  ```
  (light source top-left). Add small darken/lighten helpers inside the file.
- **Inner zone**: also `backgroundColor = pageBg`, remove its `border: 1px ${darkText}30`. Keep position/inset/radius unchanged so the illustration crop is identical.
- **Title strip**: `backgroundColor = pageBg` (already keyed off `frame`, which we'll keep passing — but in neumorphic mode just override to pageBg too). Hairline separator at top: keep it (uses `darkText` @ 18%) so the title still has a visual anchor against the illustration.
- **Title color**: keep `darkText` (`productDarkText[productId]`) — already INK-family per product, reads cleanly on the pastel pageBg.
- **Checkmark**: unchanged.
- Tap feedback: add subtle `:active` inset shadow swap via inline style only if trivial; otherwise leave (out of scope to add motion).

When `pageBg` is **not** provided, behavior is byte-identical to today (default branch wraps current style object).

### 2. `src/components/ProductCardTile.tsx`

Accept a new optional prop `pageBg?: string` and forward it to `KidsTileFrame`. `interior` and `frame` props become inert in neumorphic mode but stay passed (harmless; future-proof).

### 3. `src/components/KidsProductHome.tsx`

In the grid `map` (around line 540s in current file), pass `pageBg={pageBg}` to `ProductCardTile`. `pageBg` is already computed at the top of the component.

## Out of scope

- `ProductLibrary` tiles (already neumorphic from earlier turn).
- `KidsCardPortal` big card preview (different surface, different bg).
- `productTileVariants.ts` — left as-is; unused in neumorphic mode but kept for the other consumers.
- `AdultProductHome` / Still Us — uses its own composition, not `KidsTileFrame`.
- Manifest colors, illustrations, completed-check icon, layout, spacing, animations, title typography.

## Risk / verification

- The pastel page bg darken/lighten amounts (12% / 10%) are conservative — confirmed visually after.
- After the edit I'll reload `/product/jag-i-mig` and screenshot to confirm: tile = peach, raised lift visible, no flat-card look. If any product's bg is so close to white that the light shadow disappears, I'll bump the darken amount for that one — but unlikely with the 7 chosen colors.