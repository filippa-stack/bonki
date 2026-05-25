## Why nothing changed

`/product/jag-i-mig` (and the other kids products) are not rendered by `JagIMigProductHome.tsx` etc. — those files are dead code. `src/pages/ProductHome.tsx` routes all six kids products through the shared `KidsProductHome.tsx`. The only file I edited last turn that was actually live was `AdultProductHome.tsx` (Vårt Vi). That's why your screen didn't change.

## Fix

Apply the same treatment to `src/components/KidsProductHome.tsx`, keyed by `product.id`. Leave `product.backgroundColor` in the manifests alone (it's referenced from other surfaces — paywall, library, themes — and re-coloring those is out of scope).

### Color map (hardcoded in `KidsProductHome.tsx`)

```ts
const PAGE_BG: Record<string, string> = {
  jag_i_mig:       '#F2BC97',
  jag_med_andra:   '#E59FCF',
  jag_i_varlden:   '#D8E145',
  vardagskort:     '#A8E5C0',
  syskonkort:      '#E0BFEA',
  sexualitetskort: '#CFA08D',
  still_us:        '#E9C890', // unused here (routes to AdultProductHome) — kept for safety
};
const INK = '#2A1F1A';
```

### Edits to `src/components/KidsProductHome.tsx`

1. Add `PAGE_BG` + `INK` constants near the existing palette imports.
2. Compute `const pageBg = PAGE_BG[product.id] ?? product.backgroundColor;` near `const bg = product.backgroundColor;` (line 368).
3. Line 378 loading skeleton: `backgroundColor: MIDNIGHT_INK` → `backgroundColor: pageBg`.
4. Line 386 root `<div>`: `backgroundColor: MIDNIGHT_INK` → `backgroundColor: pageBg`.
5. Line 388: `<ProductHomeBackButton color={LANTERN_GLOW} />` → `color={INK}`.
6. **Delete** the atmospheric radial glow `<div>` (lines 392–405).
7. **Delete** the entire hero illustration block — the `{product.heroImage && (<motion.div …>…</motion.div>)}` from line 408 through its closing `)}` on line 561, including all per-product `<img>` branches and the scrim.
8. **Delete** the top scrim `<div>` (lines 563–575).
9. Title `<h1>` (lines 598–612):
   - `color: LANTERN_GLOW` → `color: INK`
   - remove the `textShadow` line entirely.
10. Subtitle `<p>` (lines 613–631):
    - `color: 'rgba(255, 255, 255, 0.85)'` → `color: INK` with `opacity: 0.7`
    - remove the `textShadow` array entirely.
11. Leave untouched: tiles, `tileLight`, sticky filter header, `NextActionBanner`, `CategoryFilterChips`, card grid, `ProductCardTile`, animations, layout/spacing, `KontoIcon`, prefetch effect for `product.heroImage` (harmless — just network prefetch; removing the `<img>` is enough to satisfy the request).

### Cleanup

Delete the now-confirmed-dead per-product home files so future edits don't waste turns:
- `src/components/JagIMigProductHome.tsx`
- `src/components/JagMedAndraProductHome.tsx`
- `src/components/JagIVarldenProductHome.tsx`
- `src/components/VardagProductHome.tsx`
- `src/components/SyskonProductHome.tsx`
- `src/components/SexualitetProductHome.tsx`

(Verified via `rg`: none of these are imported anywhere except their own file.)

## Out of scope

- Product manifest `backgroundColor` / `tileLight` (untouched; would ripple to paywall, library, themes).
- Tile contents, illustrations, banners, card grid.
- `AdultProductHome.tsx` — already correctly updated in the previous turn.