

# Product Home Screen Overhaul — Revised Plan

Combines the previously approved color/tile changes with correct hero illustration placement per mockups. Strictly aesthetic — no UX changes.

## 1. Hero illustration placement (`KidsProductHome.tsx`)

The mockups show each product's hero illustration at a specific vertical position and crop. Currently only `jag_i_varlden` and `jag_i_mig` have custom positions — all others fall back to defaults.

**Update `HERO_OBJECT_POSITION`** (controls which part of the illustration is visible):
```text
Product          objectPosition   (rationale from mockup)
─────────────────────────────────────────────────────────
jag_i_mig        50% 18%          creature centered high (keep)
jag_i_varlden    50% 35%          creature mid-frame (keep)
jag_med_andra    50% 30%          creature face visible
vardagskort      50% 20%          creature upper body
syskonkort       50% 25%          creature pair centered
sexualitetskort  50% 25%          creature face/ears visible
still_us         50% 40%          couple illustration mid
```

**Update `HERO_TOP_OFFSET`** (how far the illustration bleeds above viewport):
```text
Product          top offset
──────────────────────────
jag_i_mig        -14vh (keep)
jag_i_varlden    -20vh (keep)
jag_med_andra    -12vh
vardagskort      -14vh
syskonkort       -12vh
sexualitetskort  -10vh
still_us         -8vh
```

**Remove hero illustration filters**: Change `filter: 'saturate(1.2) brightness(1.1)'` → `filter: 'none'` (line ~486)

## 2. Category tile illustration filters (`KidsProductHome.tsx`)

Remove `saturate` and `brightness` from tile illustration `filter` (line ~274-276). Replace with just `drop-shadow(0 4px 12px rgba(0,0,0,0.10))` — no color manipulation, matching library tiles.

## 3. Category tile styling → bright opaque (`KidsProductHome.tsx`)

- **Background**: `rgba(15, 15, 15, 0.7)` → `tileBg` (opaque product color)
- **Remove**: `backdropFilter`, `backgroundImage` gradient overlay
- **Simplify boxShadow**: clean elevation only
- **Remove**: chromatic inner glow div (lines 283-294)
- **Update gradient shield**: use `tileBg` rgb values instead of dark `rgba(10, 6, 2, ...)`
- **Border**: `rgba(255,255,255,0.12)` → `rgba(255,255,255,0.18)` for visibility on bright bg
- Set tile illustration opacity to `0.38`

## 4. Product manifest color updates (7 files in `src/data/products/`)

Per the approved color spec:

| File | backgroundColor | tileLight | tileMid | tileDeep |
|------|----------------|-----------|---------|----------|
| `jag-i-mig.ts` | `#115D57` | `#CB7AB2` | `#A85E94` | `#115D57` |
| `jag-med-andra.ts` | `#721B3A` | `#A62755` | `#8C1F47` | `#721B3A` |
| `jag-i-varlden.ts` | `#606613` | `#C6D423` | `#A3AF1C` | `#606613` |
| `vardagskort.ts` | `#48A873` | `#8BDDB0` | `#68C494` | `#48A873` |
| `syskonkort.ts` | `#8E459D` | `#CF8BDD` | `#B56CC4` | `#8E459D` |
| `sexualitetskort.ts` | `#AF685E` | `#DD958B` | `#C87D73` | `#AF685E` |
| `still-us-mock.ts` | `#4B759B` | `#94BCE1` | `#6F9CC5` | `#4B759B` |

## 5. Cleanup

- Remove `VARDAG_TILE_COLORS` constant (no longer needed with bright uniform tiles)
- Remove Vardag-specific ghost glow div (lines 444-459)

## Files touched

1. `src/components/KidsProductHome.tsx` — hero positions, tile styling, filter removal
2. `src/data/products/jag-i-mig.ts` — colors
3. `src/data/products/jag-med-andra.ts` — colors
4. `src/data/products/jag-i-varlden.ts` — colors
5. `src/data/products/vardagskort.ts` — colors
6. `src/data/products/syskonkort.ts` — colors
7. `src/data/products/sexualitetskort.ts` — colors
8. `src/data/products/still-us-mock.ts` — colors

## What stays the same

All routing, navigation, progress tracking, resume pill, intro session logic, animation variants, tile click handlers, back button.

