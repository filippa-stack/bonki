## Goal
Tint each library tile's progress pill with a faint version of that product's signature accent color, instead of the uniform translucent grey used today.

## Change
In `src/components/ProductLibrary.tsx` (`PastelTile`, lines ~232–252) update the pill's `background` and `border`:

- Background: `color-mix(in srgb, ${PRODUCT_ACCENT[productId] ?? '#FFFFFF'} 18%, rgba(255, 255, 255, 0.14))` — keeps the frosted glass feel, adds a ~15% accent hint.
- Border: `color-mix(in srgb, ${PRODUCT_ACCENT[productId] ?? '#FFFFFF'} 25%, rgba(255, 255, 255, 0.22))` — picks up the same accent at the edge.
- Keep `backdropFilter`, text color (`LANTERN_GLOW`), padding, radius, and font unchanged.

`PRODUCT_ACCENT[productId]` is already imported and used for the tile background, so no new lookups or imports are needed. `color-mix` is supported on all current iOS/Android WebViews and modern browsers we ship to.

No other files affected.