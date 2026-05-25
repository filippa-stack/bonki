## Why nothing visibly changed

The prior turn only deleted the `inset` shadow from the inner plate. Tile frames still use the brand color, so they read as flat colored cards on the mint page — not as raised neumorphic elements lifting off the surface.

For true neumorphism the frame must be the **same color as the page background** (`#e9f6f4`, confirmed at `src/components/ProductLibrary.tsx:787`). The brand color moves into a recessed inner plate.

## Edits — `src/components/ProductLibrary.tsx`

### 1. Shared constants (near line 37)

```ts
const PAGE_BG = '#e9f6f4';
const LABEL_INK = '#33403d';
const NEU_SHADOW_OUT    = '8px 8px 20px rgba(166,195,192,0.65), -8px -8px 20px rgba(255,255,255,0.95)';
const NEU_SHADOW_OUT_SM = '5px 5px 14px rgba(166,195,192,0.55), -5px -5px 14px rgba(255,255,255,0.95)';
const NEU_SHADOW_INSET  = 'inset 5px 5px 11px rgba(0,0,0,0.28), inset -4px -4px 9px rgba(255,255,255,0.22)';
```

### 2. `LibraryKidsTile` (lines 606–end of component)

- Outer `<button>` (line 617): `backgroundColor: PAGE_BG` (was `frame`). Keep `borderRadius: 22`, keep `NEU_SHADOW_OUT`.
- Inner plate (line 628): keep `backgroundColor: interior`, add `boxShadow: NEU_SHADOW_INSET`, drop `borderRadius` from 14 → 12 so the mint frame reads as a continuous raised lip.
- Remove the hairline seam at line 719 (no longer needed — the recessed plate creates the separation).
- Title strip background → `PAGE_BG`; title text `color: LABEL_INK` (instead of `darkText`). Product label now sits on the frame, not on the colored plate.

### 3. Vårt Vi hero tile (around line 182)

- Outer `<button>`: `backgroundColor: PAGE_BG`, `borderRadius: 24`, `NEU_SHADOW_OUT`.
- Wrap the illustration in a recessed inner plate: `backgroundColor: VI_TAB_HERO_COLOR` (whatever it is currently using), `borderRadius: 20`, `boxShadow: NEU_SHADOW_INSET`.
- Move the eyebrow, title, and progress line out of the colored plate and onto the frame area below it. Text color → `LABEL_INK`.

### 4. Out of scope (untouched)

`PreviewCardPurchased` medallions, illustration assets, age pill states, tile order, modal shadow at line 1046.

## Critical constraint

Frame color must be **exactly** `#e9f6f4`. Any drift breaks the neumorphic illusion and the tiles read as flat cards again. Light source is top-left on every shadow declaration.

## Verification

- `rg "backgroundColor: frame" src/components/ProductLibrary.tsx` returns nothing.
- Visual: each tile reads as a mint pillow pushing up out of the page, with a sunken brand-colored window holding the illustration.
