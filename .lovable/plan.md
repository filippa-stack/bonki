# Kids Tile Variants — Frame-Color Slot + Universal Hairline Border

Two coordinated changes to the kids tile system that produce visible rhythm via both color contrast (tinted variants) and hairline definition (no-tint variants).

## Files affected

1. `src/lib/productTileVariants.ts` — variant array updates
2. `src/components/KidsTileFrame.tsx` — accept `darkText` for hairline border on inner zone
3. `src/components/ProductCardTile.tsx` — pass `darkText` (already resolved via `productDarkText[productId]`) to `KidsTileFrame`
4. `src/components/ProductLibrary.tsx` — add hairline border to `LibraryKidsTile` inner zone div

No other files touched. `getInteriorForCard`, `getCalmInterior`, permutations, frame colors, and `darkText` palette stay unchanged.

## 1. Variant arrays (productTileVariants.ts)

Replace each product's `variants` array. `permutation` and `calmIndex` unchanged.

| Product | Frame | New variants | Frame-color slot |
|---|---|---|---|
| jag_i_mig | `#E89B6B` | `['#DC8050', '#E89B6B', '#F2B58F', '#FAD2B0']` | idx 1 |
| jag_med_andra | `#CB7AB2` | `['#B05A8C', '#CB7AB2', '#E5B0D0']` | idx 1 |
| jag_i_varlden | `#C6D423` | `['#B0B038', '#C6D423', '#E0EA85']` | idx 1 |
| vardagskort | `#8BDDB0` | `['#62B090', '#8BDDB0', '#B5E2C5', '#DCF5E5']` | idx 1 |
| syskonkort | `#CF8BDD` | `['#A689BD', '#B89BC8', '#CF8BDD', '#DAC4DE', '#ECD5F0']` | idx 2 |
| sexualitetskort | `#B87560` | `['#A56350', '#B87560', '#C89788', '#DBB5A0']` | idx 1 |

calmIndex verified to still point at the lightest variant (highest index) for every product — no changes needed.

## 2. Universal hairline border on inner zones

Apply `border: 1px solid ${darkText}30` (~19% alpha) to the inner-zone div on every kids tile.

### KidsTileFrame.tsx
- Add new required prop `darkText: string` (already passed in via the existing `darkText` prop — confirmed; just thread it onto the inner zone div's style).
- On the inner zone div (the one positioned at `top: 16, left: 16, right: 16, bottom: calc(...)`), add `border: \`1px solid ${darkText}30\``.

### ProductCardTile.tsx
- Already passes `darkText={titleColor}` (resolved from `productDarkText[productId]`). No change needed beyond confirming KidsTileFrame uses it for the border.

### ProductLibrary.tsx — LibraryKidsTile
- On the inner zone div (lines 274–288), add `border: \`1px solid ${darkText}30\``. `darkText` is already in scope from `TILE_COLORS[product.id]`.

Calibration knob: opacity hex suffix. Default `30` (19%). Tune to `20` (12%) if too prominent, `40` (25%) if too subtle. No per-product tuning by default.

## 3. Verification at 390×844 (iPhone 15)

Use `/?devState=browse` to unlock all content, then:

- Visit each kids product home: `/product/jag-i-mig`, `/product/jag-med-andra`, `/product/jag-i-varlden`, `/product/vardagskort`, `/product/syskonkort`, `/product/sexualitetskort`
- Scroll the full grid for each. Confirm every tile shows a perceptible inner zone — defined by either color contrast or hairline.
- Confirm no tile reads as "uniform card with no inner zone."
- Confirm the no-tint variant cards (where interior = frame) have a clearly visible hairline-defined plate.
- Open the library — confirm hairline applies on calm tiles (lightest variant, tinted) and they remain visible.
- Vårt Vi flow regression: confirm Vårt Vi product home, library marquee, portal, session, completion are unchanged (they don't use this system).

## What stays unchanged

- All `permutation` arrays and `calmIndex` values
- Frame colors in product manifests
- `getInteriorForCard` / `getCalmInterior` logic
- `productDarkText` palette
- All non-kids surfaces (Vårt Vi, library marquee, etc.)

## Edge cases to flag during implementation

If the hairline reads too heavy on a specific product (e.g. JmA's strong color contrast), surface for per-product opacity tuning. Otherwise, ship with universal `${darkText}30`.
