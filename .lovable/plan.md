# Library mock — make tiles vibrant

The tiles look dull because two layers mute the color: (1) the gradient stops are low-chroma desaturated tones, and (2) a heavy bottom scrim covers 70% of the tile and dims the lower half with up to 40% black.

Two surgical changes to `src/components/ProductLibraryMock.tsx`. No other files.

## 1. Boost gradient chroma

Replace the gradient token block with higher-chroma stops. Same hue family per product (so the brand mapping stays intact), but pulled toward saturated/punchier values and with a wider light-to-dark spread so the gradient itself reads as energy rather than a flat wash.

```css
--vartvi-bg-1:#C5D0E2; --vartvi-bg-2:#647892;   /* slate cool — was #A8B5C9 → #7989A0 */
--jim-bg-1:#3A9088;    --jim-bg-2:#175048;      /* teal — was #2A6B65 → #1F5550 */
--jma-bg-1:#D86BA0;    --jma-bg-2:#7A2E5A;      /* magenta — was #B85A8A → #8C3D69 */
--varlden-bg-1:#D8E04A; --varlden-bg-2:#7A8019; /* citron — was #BAC03E → #8E9425 */
--vardag-bg-1:#7FCEAB;  --vardag-bg-2:#3E8868;  /* sage — was #6FB498 → #549478 */
--syskon-bg-1:#D7B5EC;  --syskon-bg-2:#8868A8;  /* lilac — was #C4A5D6 → #9D7FB8 */
```

`PRODUCT_ACCENT` (used for shadow tint and sexualitetskort fallback) stays unchanged — the brand-color mapping the rest of the app reads from is untouched.

## 2. Lighten the bottom scrim

The current scrim is `linear-gradient(to top, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)` over 70% of the tile height. That's what makes the lower half look dirty.

Reduce to:
- height `55%` (was 70%)
- gradient `rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.08) 50%, transparent 100%`

Title and tagline still get their own `textShadow: 0 2px 12px rgba(0,0,0,0.35)` for legibility, so dropping scrim weight doesn't hurt readability.

## What stays unchanged

- Tile structure, illustration positioning, text layout, badges, progress display
- Hover/tap motion
- `PRODUCT_ACCENT` map and shadow logic
- All copy, taglines, navigation
- Live `ProductLibrary.tsx` — completely untouched

## Verification

Open `/library-mock` at 390×844: each tile reads as a saturated brand color with the illustration sitting cleanly on top, no greyish wash across the lower half. Title and tagline still legible against the lighter scrim thanks to text-shadow.
