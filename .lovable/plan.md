

## Brighten Product Home Tiles + Still Us Home

### Changes

**1. `src/components/CategoryTileGrid.tsx` — Category tiles on all kids/adult product homes**

- **Reduce bottom scrim** (line ~160): `rgba(0,0,0,0.55)` → `0.35`, `rgba(0,0,0,0.25)` → `0.12`
- **Add per-tile colored glow**: Add `boxShadow: \`0 4px 24px ${hexToRgba(tile.bg, 0.25)}\`` to tile button style
- **Soften text shadows** on title (~line 194) and subtitle (~line 210): reduce to `0 1px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)`
- **Add `hexToRgba` helper** alongside existing `hexToRgb`

**2. `src/pages/Home.tsx` — Still Us home page hero scrim**

- **Lighten hero scrim** (~line 328-336): The gradient currently goes from `emberNight` at full opacity through `0.85` and `0.4` mid-tones. Reduce the mid-values so the illustration peeks through more — change `rgba(46,34,51,0.85)` → `0.65` and `rgba(71,52,84,0.4)` → `0.25`
- **Soften title text shadow** (~line 369): reduce from `rgba(0,0,0,0.7)` to `0.5`
- **Boost radial glow** (~line 297): increase `emberMid` opacity from `30` → `40` and `deepSaffron` from `10` → `20` so the warm atmospheric glow is more present

### What stays untouched
- All product home page files (VardagProductHome, SyskonProductHome, etc.) — they consume CategoryTileGrid, no direct changes needed
- Tile colors, illustrations, layout, aspect ratios, progress indicators
- Page backgrounds, ActionCard, JourneyProgress, all other components
- No new files or dependencies

### Result
Category tiles across all six product homes glow with their own accent color against the dark backgrounds. The Still Us home page lets the couple illustration breathe through a lighter scrim with a warmer atmospheric glow.

