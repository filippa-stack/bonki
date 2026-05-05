# Vårt Vi adult visual register

Establish a parallel "adult product home" treatment used **only** for `still_us`. Kids products (Jag i Mig, Jag med Andra, Jag i Världen, Vardag, Syskon, Sexualitet) keep their current `KidsProductHome` rendering untouched. The shift is compositional: kids cards are full-bleed posters; adult cards are framed portraits with a dedicated typographic title zone.

## 1. Routing branch

`src/pages/ProductHome.tsx` currently routes any product in `KIDS_PRODUCT_IDS` (which includes `still_us`) to `KidsProductHome`. Change the dispatch:

- If `product.id === 'still_us'` → render new `AdultProductHome`.
- Else if in `KIDS_PRODUCT_IDS` → render `KidsProductHome` (unchanged).
- Else → existing fallback (unchanged).

Do **not** remove `still_us` from `KIDS_PRODUCT_IDS` — that constant is consumed by `useKidsProductProgress` and other hooks for progress/session logic. Only the home view diverges.

## 2. New files

- `src/components/AdultProductHome.tsx` — fork of `KidsProductHome` scoped to adult treatment. Reuses `CategoryFilterChips`, `NextActionBanner`, `KontoIcon`/`KontoSheet`, `ProductHomeBackButton`, `useKidsProductProgress`, `useCardImage`. Internal `StickyFilterHeader` and `FilterableCardCell` patterns copied to keep filtering behavior identical.
- `src/components/AdultProductCardTile.tsx` — fork of `ProductCardTile` implementing the two-zone composition.

Forking (rather than branching inside the existing components) keeps both paths simple and prevents regressions to kids tiles.

## 3. Palette additions

Add named tokens to `src/lib/palette.ts` (hex only, no new design-token system):

```ts
export const CORNFLOWER = '#6495ED';
export const DUSTY_ROSE = '#B8868A';
export const STORM_GREY = '#3A4554';
export const SAGE = '#7A8B7A';
export const WARM_GOLD = '#E9C890';
// MIDNIGHT_INK already exported
```

Adult card anchor palette (six colors, used by the distribution algorithm):
`CORNFLOWER`, `MIDNIGHT_INK`, `DUSTY_ROSE`, `WARM_GOLD`, `STORM_GREY`, `SAGE`.

## 4. Hero / background (AdultProductHome)

- Page background: `#0B1026` (Deep Dusk). Verify in preview against the new card palette; if the deeper `MIDNIGHT_INK` (#1A1A2E) reads better, switch — pick whichever sits behind cards without competing.
- Atmospheric glow: keep the existing radial/scrim layering pattern, but recolor stops to cool tones — drop greens, blend `CORNFLOWER` and a deeper indigo (#1B2A6B) at low opacity. Evening-sky feel.
- Hero illustration: render the existing `product.heroImage` (couple peering in) at the same crop as today (`top:5% left:-15% width:110% opacity:0.38`). Add an optional soft backlight behind the figures: a `radial-gradient(ellipse at 30% 35%, rgba(100,149,237,0.30), transparent 60%)` layer behind the image, opacity ~0.30. Verify legibility; remove the glow if not needed.
- Bottom multi-stop scrim: skip (matches current still_us branch).

Title `Vårt Vi` and subtitle stay; subtitle color → `LANTERN_GLOW` at 0.85 opacity.

## 5. Resume banner (`NextActionBanner`)

`NextActionBanner` already takes the `product` and reads `tileLight` for tinting. To avoid touching its internals, set the new `AdultProductHome` to pass `product.tileLight` overridden to `CORNFLOWER` for the banner context. Cleanest path:

- Inspect `NextActionBanner` to see how it picks accent. If it reads from product, fork the props locally by cloning the manifest with `tileLight: CORNFLOWER` for use inside `AdultProductHome` only (does **not** mutate the imported manifest). Same clone is passed to the chips.

Visual rules per spec:
- BG: `color-mix(in srgb, #6495ED 18%, rgba(255,255,255,0.04))`
- Border: `1px solid color-mix(in srgb, #6495ED 35%, transparent)`
- Eyebrow + name text: `LANTERN_GLOW`
- "Öppna" pill: `color-mix(in srgb, #6495ED 30%, rgba(255,255,255,0.06))`
- Eyebrow: keep ALL CAPS, weight slightly heavier (600 → 700).

If `NextActionBanner` hardcodes its own colors and adapting it requires intrusive edits, take the smaller alternative: add an optional `accentHex` prop with a default that preserves current behavior, and pass `CORNFLOWER` from `AdultProductHome`. Kids call sites omit the prop.

## 6. Filter chips

`CategoryFilterChips` already accepts `accentHex`. In `AdultProductHome`, pass `CORNFLOWER`. To get the "outline-only unselected" treatment without breaking kids, add an optional `variant?: 'kids' | 'adult'` prop to `CategoryFilterChips` (default `'kids'`):

- `adult`: unselected chip BG `transparent`, border `color-mix(in srgb, #6495ED 25%, rgba(255,255,255,0.10))`. Selected: `color-mix(in srgb, #6495ED 30%, rgba(255,255,255,0.06))` + `color-mix(in srgb, #6495ED 55%, transparent)` border.
- `kids`: unchanged.

Mask-fade and typography tokens stay identical.

## 7. Card grid

`AdultProductHome` grid:
- 2 columns, `gap: 16px` (kids uses 8px — adult is ~2× as airy per spec intent of "30% more"; match the 16px target).
- Each cell renders `AdultProductCardTile` with a per-card resolved `cardColor`.

## 8. AdultProductCardTile composition

Aspect ratio: `3 / 4` (portrait, taller than kids' `2/3`).
Outer border-radius: `22px` (matches kids visual weight without poster feel).
Outer container background: solid `cardColor`.

Two stacked zones, no overlap:

```text
┌─────────────────────────┐
│                         │
│   Zone A (top 65%)      │  background: cardColor
│   illustration centered │  6px inset on all sides
│   object-fit: contain   │  bottom inner-shadow 1px @15% black
│                         │
├─────────────────────────┤  ← 1px horizontal accent line (full width)
│                         │     color-mix(in srgb, #E9C890 60%, transparent)
│   Zone B (bottom 35%)   │  background: color-mix(cardColor 88%, #000 12%)
│   serif title           │  padding: 16px 18px
│   white, left, vcenter  │  font-size: 18–20px, line-height 1.25
│                         │
└─────────────────────────┘
```

- Use `flexDirection: column` with explicit `flex-basis: 65%` / `35%` so zones align consistently across cards.
- Zone A inner content: `<img>` with `width:100%; height:100%; object-fit:contain; padding:6px;`. Source from `useCardImage(card.id)`.
- Zone A bottom inner shadow: a 2px tall absolutely-positioned div at the bottom edge with `background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))`, sitting just above the accent line.
- Accent line: 1px tall div, full width, `WARM_GOLD` mixed; straight (no rounding).
- Zone B title: `font-family: var(--font-display)`, weight 600, color `#FDF6E3`, left-aligned, vertically centered via flex. Allow up to 2 lines (`line-clamp:2` + `display:-webkit-box; -webkit-box-orient:vertical;`).
- Saffron checkmark: keep current SVG pinned `top:12 right:12` of Zone A (z-index 4).
- Press state: keep `.product-card-tile` class so existing CSS press behavior applies.

## 9. Card-color distribution

Per-card resolution order:
1. `card.cardColor` if set (optional override).
2. Otherwise, deterministic distribution computed in `AdultProductHome`:
   - Sort cards by stable order (the manifest order).
   - Assign anchor colors in a 6-cycle (`palette[i % 6]`), then run a one-pass adjustment: for each card whose color equals the previous card's color in the visible/sorted list, swap with the next non-conflicting anchor. Guarantees no two adjacent cards share a color and stable assignment across renders.

Add an optional `cardColor?: string` field to the `Card` type in `src/types/index.ts` (or `src/types/product.ts` if that's where the kids `Card` type lives — verify and place it in the right file). Optional, no migrations.

## 10. Title rewrites — Vårt Vi data

In `src/data/content.ts` (the source of Still Us cards consumed by `still-us-mock.ts`), update:

- `"När ert vi blir Familjen AB"` → title `"Familjen AB"`. Original phrasing moves to `subtitle` if a subtitle field exists on that card; otherwise dropped.
- `"Rollerna ni tar (och får)"` → title `"Rollerna ni tar"`. Same subtitle handling.

Do **not** preemptively rename `"Identitetsskifte"`. Verify in preview after layout lands; only rewrite to `"Vem ni blir"` if it visibly truncates in the new title zone.

## 11. What stays the same

- Hero illustration asset, completion checkmark SVG/animation, press state CSS, autosave/session/routing logic, sticky header behavior, mask-fade on chips, kids product home rendering and all kids tiles.
- `KIDS_PRODUCT_IDS` membership for `still_us` (progress hook depends on it).

## 12. Implementation order

1. Add palette tokens.
2. Add optional `Card.cardColor` field.
3. Add `variant` prop to `CategoryFilterChips`.
4. Add `accentHex` prop to `NextActionBanner` (only if its current internals require it).
5. Build `AdultProductCardTile`.
6. Build `AdultProductHome` (clone kids hero scaffolding, swap background + scrims, mount sticky header + grid with the new tile).
7. Branch in `ProductHome.tsx` to render `AdultProductHome` for `still_us`.
8. Apply title rewrites in `src/data/content.ts`.
9. Verify in preview at 390×844: kids products unchanged; Vårt Vi shows distinct adult register; no truncation; ≥4 of 6 anchor colors visible across two scrolled viewports; no adjacent-color clashes.

## 13. Files affected

- New: `src/components/AdultProductHome.tsx`, `src/components/AdultProductCardTile.tsx`
- Edited: `src/pages/ProductHome.tsx` (dispatch branch)
- Edited: `src/lib/palette.ts` (new tokens)
- Edited: `src/components/CategoryFilterChips.tsx` (variant prop)
- Edited: `src/components/NextActionBanner.tsx` (optional accent prop, only if needed)
- Edited: `src/types/product.ts` or `src/types/index.ts` (`cardColor?: string` on `Card`)
- Edited: `src/data/content.ts` (two title rewrites)

No DB, edge function, or auth changes.
