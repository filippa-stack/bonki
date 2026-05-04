# Product home mock — iteration 3

Restructure card composition in `src/components/ProductHomeMock.tsx` only. Cards become illustration-dominant tiles with overlaid title and a thin progress bar at the bottom edge.

## Per-card illustration sourcing

Real per-card illustrations are served as standalone files at `/card-images/{cardId}.webp` (see `src/hooks/useCardImage.ts`, which exposes `hasCardImage(cardId)` and the URL pattern). Card manifests do not carry an `illustration` field.

Approach in the mock:
- For each card, build URL `/card-images/${card.id}.webp` when `hasCardImage(card.id)` is true.
- Fallback: product-level hero illustration (already imported per product, e.g. `illustration-jag-i-mig.png`). Keep the existing top-level imports for the hero fallbacks; map `productId → heroImage`.
- Remove the `PLACEHOLDER_POOL` cycling entirely.
- Add an inline comment listing that fallbacks apply only to cards missing from `CARD_IDS_WITH_IMAGES` (in practice all current product cards have entries, so fallback is defensive).

## Card composition

Container:
- `aspectRatio: '1 / 1.05'`, `background: DEEP_DUSK`, `border: 0.5px solid rgba(255,255,255,0.06)`, `borderRadius: 14`, `position: relative`, `overflow: hidden`.
- Drop the flex-column structure.

Illustration (full-bleed):
- `<img>` absolute, `inset: 0`, `width/height: 100%`, `objectFit: 'contain'`, `objectPosition: 'center'`. No scrim, no padding.

Title (overlaid, lower-left):
- Absolute, `bottom: 14, left: 14, maxWidth: '75%'`.
- Fraunces 18 / weight 500, color `#FFFFFF`, `textShadow: '0 1px 10px rgba(0,0,0,0.7)'`, `lineHeight: 1.15`, `margin: 0`.

Progress bar (bottom edge):
- Absolute `bottom: 0, left: 0, right: 0`, `height: 3`, no border-radius.
- Track `rgba(255,255,255,0.12)`, fill width `${pct}%` with `meta.progressColor`.

Removed:
- `{done}/{total} samtal` caption.
- Dedicated bottom progress block.

## Unchanged

Page background, top title/subtitle, resume/start banner, category dividers, 2-col grid + 12px gap, dev panel, MOCK badge, three states, real data via `getProductById`. Live `ProductHome.tsx` untouched.

## Files

- `src/components/ProductHomeMock.tsx` (only)
