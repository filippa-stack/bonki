# Kids tile: show full illustration, never crop

Verified illustration source format: kids card webp files have **transparent backgrounds** (alpha:Blend confirmed on jim-trygg, jim-skam, jma-vanskap). This is **Case A** — figures float on transparent canvas, so contain-with-padding will sit cleanly on the per-product accent color. No card-color clash expected. No content-coordination work surfaces from this change.

## Single file edit: `src/components/ProductCardTile.tsx`

Outer `<button>` unchanged: `aspectRatio: '3 / 4'`, `borderRadius: '22px'`, per-product `tileBg`, existing border/shadow, `.product-card-tile` press class.

### 1. Illustration container — contain with padding

Replace the current cover-with-1.05-scale wrapper:

- Remove `transform: scale(1.05)` and the inner overflow-hidden trick (no longer needed; nothing to crop).
- Container becomes `position: absolute; inset: 16px;` (16px padding on all sides, lives inside the 22px-radius card).
- `<img>` becomes `width: 100%; height: 100%; objectFit: 'contain'; objectPosition: 'center';` — drop the `50% 25%` cover anchor.
- Keep the soft drop-shadow filter on the image for figure lift.

### 2. Title — inside the padded frame, smaller

- Title block moves from `bottom: 0; left: 0; right: 0; padding: 10px 14px` to `bottom: 16px; left: 16px; right: 16px; padding: 0` so it respects the same 16px frame as the illustration.
- Font size: `20px` → `16px`. Serif, weight 600, color `#FFFFFF`, `var(--font-display)`, `'opsz' 24` — all unchanged.
- Keep textShadow for legibility against varied illustration content behind the title.

### 3. Scrim — lighter

- Current scrim: `linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)` over bottom 25%.
- New: reduce peak opacity ~30% → `rgba(0,0,0,0.24)`. Keep height/position. Inset to match the 16px frame (so the scrim doesn't bleed onto the colored matting outside the illustration).

### 4. Completion checkmark — respect padding

- Move from `top: 12; right: 12` → `top: 16; right: 16` so it aligns with the new frame.
- Same 18×18 SVG, same SAFFRON_FLAME stroke, same drop-shadow, same fade-in animation with `skipPillAnimation` first-render guard.

## What stays the same

- `AdultProductCardTile.tsx` — not touched.
- Card outer shape (3:4, 22px), per-product accent colors, navigation, completion logic, press behavior, `useCardImage` source.

## Verification (390×844)

- `/product/jag-i-mig`: bear on Trygg fully visible; Skam silhouette complete; teal frames the illustrations as deliberate matting.
- `/product/jag-med-andra`, `/product/jag-i-varlden`: same — every figure complete, no crop.
- Titles read at 16px in bottom-left of the padded zone, legible.
- `/product/still-us` adult tiles unchanged.
- Completed cards show saffron checkmark in top-right of padded area.
