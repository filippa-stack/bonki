## Goal

Each product home page gets its product-specific solid color as the page background, hero illustrations and atmospheric glows are removed, and title/subtitle/back-button text switches to dark ink so it reads on the lighter backgrounds.

## Color → product mapping

Derived from the user's 7 colors, mapped by hue to match each product's existing library-tile inner-plate identity:

| Product | New BG |
|---|---|
| Jag i mig | `#F2BC97` |
| Jag med andra | `#E59FCF` |
| Jag i världen | `#D8E145` |
| Vardag | `#A8E5C0` |
| Syskon | `#E0BFEA` |
| Sexualitet | `#CFA08D` |
| Vårt Vi (Still Us) | `#E9C890` |

## Shared changes (all 7 home components)

1. Replace `BG` (or `DEEP_DUSK_BG` in `AdultProductHome.tsx`) with the new hex above.
2. Delete the hero illustration block (`<motion.div>` wrapping `heroImage` / `product.heroImage`, the `img`, and its scrim/backlight divs). Remove the now-unused `heroImage` import.
3. Delete the atmospheric radial-glow background `<div>` (the one using `TILE_LIGHT` / `CORNFLOWER` `radial-gradient`).
4. Delete the top scrim div (`AdultProductHome` only) — no longer needed without hero.
5. Text color swap to dark ink `#2A1F1A`:
   - `<ProductHomeBackButton color="#FDF6E3" />` → `color="#2A1F1A"`
   - `<h1>` `color: '#FDF6E3'` → `color: '#2A1F1A'`
   - Remove the heavy `textShadow` halos on `<h1>` and the subtitle `<p>` (they bake the old dark BG color and would look like dark blobs on a light background).
   - Subtitle `<p>` `color: ACCENT_COLOR` → `color: '#2A1F1A'` with `opacity: 0.7` so it still reads as secondary.
6. Leave untouched: `CategoryTileGrid` (tiles keep their own bg colors), `UnifiedResumeBanner`, `NextConversationCard`, `accentColor` prop passed to those (kept as is — affects child component theming, not page chrome), tile order, illustration assets used inside tiles, layout/spacing.

## Files to edit

- `src/components/JagIMigProductHome.tsx` — `BG` → `#F2BC97`
- `src/components/JagMedAndraProductHome.tsx` — `BG` → `#E59FCF`
- `src/components/JagIVarldenProductHome.tsx` — `BG` → `#D8E145`
- `src/components/VardagProductHome.tsx` — `BG` → `#A8E5C0`
- `src/components/SyskonProductHome.tsx` — `BG` → `#E0BFEA`
- `src/components/SexualitetProductHome.tsx` — `BG` → `#CFA08D`
- `src/components/AdultProductHome.tsx` (Vårt Vi) — `DEEP_DUSK_BG` → `#E9C890`

## Out of scope

- Library tile interior colors (`ProductLibrary.tsx` `TILE_COLORS`) — not touched, even though some user-supplied hexes differ slightly from current tile interiors. Tell me if you want those synced too.
- Tile illustrations, CategoryTileGrid styling, banners, paywall, child components.
- Session screens, portals, completion ceremonies.

## Risk note

Some title/subtitle elements rely on the dark BG + glow halo for legibility. With heavy `textShadow` removed and dark ink on lighter pastels, contrast should be fine on all 7 colors (all are light enough that `#2A1F1A` clears WCAG AA for large text). No new contrast helpers added — flag if any specific page needs a tweak after build.