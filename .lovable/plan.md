## Refine locked Vårt Vi medallion row

Three scoped visual changes inside `VartViPreviewStrip`'s `!isPurchased` branch in `src/components/ProductLibrary.tsx` (lines ~326–408). No other surfaces, state, or logic touched.

### 1. Bigger, bolder quote glyph
The `motion.span` rendering `&ldquo;` (line 376–388) currently uses `fontSize: 36` with no opacity/transform overrides. Update its style to:
- `fontSize: 52`
- `opacity: 1`
- `transform: 'translateY(6px)'`

### 2. Remove "En fråga" captions
Delete the entire `<span>` caption block (lines 392–405) below each medallion. Then on the outer `motion.button` style (lines 338–349), remove the `gap: 10` property. Keep `flexDirection: 'column'` and the rest.

### 3. Inverse inner-circle contrast for Storm Grey only
Replace the single `innerBg` line (330) with:
```ts
const isStormGrey = bgColor === STORM_GREY;
const innerBg = isStormGrey
  ? `color-mix(in srgb, ${bgColor} 75%, #FFFFFF 25%)`
  : `color-mix(in srgb, ${bgColor} 78%, #000000)`;
```
(Using the safe ≤100% variant since color-mix percentages >100% aren't widely supported.)

`STORM_GREY` is already imported at line 18.

### Untouched
Purchased branch, expansion overlay, `layoutId` values, `PREVIEW_QUESTIONS`, `PREVIEW_TILE_COLORS`, `onUnpurchasedTileTap`, eyebrow label above the row.

### Verification
- TS build clean.
- Glyph noticeably larger and fully opaque.
- No per-medallion captions; eyebrow remains.
- Storm Grey medallion's inner circle is lighter than its outer ring; other three keep darker-inner pattern.
- Tap → expansion overlay unchanged.
