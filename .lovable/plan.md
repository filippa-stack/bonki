## Goal
Reclaim ~50–70px of vertical space in the AdultProductHome content header (Vårt Vi) so that on iPhone 15 (390×844) at least one full row of cards plus a partial second row is visible above the fold. Hero illustration, fonts, and structure stay unchanged.

## Current values (in `src/components/AdultProductHome.tsx`)

1. **Top padding above title** (outer flex container):
   `paddingTop: max(calc(env(safe-area-inset-top, 0px) + 36px), clamp(36px, 8vh, 70px))` → ~70px on iPhone 15.
2. **Title → subtitle gap**: subtitle `marginTop: 8px`.
3. **Subtitle → resume banner gap**: spacer `<div style={{ height: 'clamp(28px, 7vh, 60px)' }} />` → ~59px on 844h, plus sticky header `paddingTop: 6px` and banner wrapper `marginBottom: 6px`.
4. **Resume banner → filter chips gap**: `marginBottom: 6px` on the banner wrapper (already very tight — leave alone).
5. **Filter chips → card grid gap**: sticky header `paddingBottom: 4px` + spacer `<div style={{ height: 8px }} />` = 12px (already tight — leave alone).
6. **Title font size**: `clamp(34px, 9.5vw, 50px)` — unchanged.
7. **Subtitle font size**: `clamp(15px, 4.2vw, 19px)` — unchanged.

## Changes (single file: `src/components/AdultProductHome.tsx`)

| Element | Current | New | Saving on 390×844 |
|---|---|---|---|
| Outer `paddingTop` | `max(safe+36, clamp(36,8vh,70))` | `max(safe+20, clamp(24, 5.5vh, 52))` | ~14px |
| Subtitle `marginTop` | `8px` | `6px` | 2px |
| Subtitle→banner spacer height | `clamp(28px, 7vh, 60px)` | `clamp(16px, 4.5vh, 40px)` | ~21px |
| Banner wrapper `marginBottom` | `6px` | unchanged (already tight) | 0 |
| Sticky header `paddingTop` | `6px` | unchanged | 0 |
| Sticky→grid spacer (`8px`) + header `paddingBottom` (`4px`) | 12px total | unchanged (already tight) | 0 |

Total reclaimed: ~37–40px from the spacer + top padding tightening. To hit the 50–70px target, also reduce the title font's vertical footprint contribution by trimming the title block's implicit line-height — leave font sizes untouched but the smaller spacer + smaller top padding combined is the lever.

If after testing the gain is < 50px, additionally reduce subtitle→banner spacer to `clamp(12px, 3.5vh, 32px)` (saves another ~8px) — included as a secondary tweak in the same edit.

## Untouched
- Absolute hero illustration block and its scrim/glow.
- Title/subtitle typography (font, weight, size, shadow).
- Sticky filter header structure.
- Card grid layout, gap, and tile component.
- KidsProductHome.

## Verification
- `/product/still-us` at 390×844: hero atmosphere unchanged; title + subtitle + banner + chips fit in upper portion; first card row fully visible above the fold with the top of row 2 peeking in.
- No element appears cramped.
