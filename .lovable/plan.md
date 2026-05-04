# Library tile titles — white for sharper contrast

Currently the product `<h3>` title in `PastelTile` uses `LANTERN_GLOW` (`#FDF6E3`), a warm cream. Against the now-saturated tile gradients, pure white reads slightly crisper at small sizes.

## Change

In `src/components/ProductLibraryMock.tsx`, `PastelTile` `<h3>`:

- `color: LANTERN_GLOW` → `color: '#FFFFFF'`
- Bump text-shadow slightly for the brighter color: `0 2px 12px rgba(0,0,0,0.35)` → `0 2px 14px rgba(0,0,0,0.45)` so the lift feels intentional and white doesn't float on the lighter gradient stops (varlden citron, vardag sage).

Tagline (`<p>`) below stays at `rgba(253, 246, 227, 0.92)` — keeping the warm cream there preserves the small editorial hierarchy between display and body.

## Unchanged

- Tagline color, sizes, layout, badges
- All other surfaces using `LANTERN_GLOW`
- Live `ProductLibrary.tsx`

## Verification

`/library-mock` at 390×844: titles read noticeably crisper on every tile, especially `Jag i Världen` (citron) and `Vardagskort` (sage) where the warm cream was closest in tone to the background.
