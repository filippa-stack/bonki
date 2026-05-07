## 5 surgical edits to `src/components/ProductLibrary.tsx`

Only this file. No copy changes. No imports added/removed.

### 1. Title strip taller (20% → 24%)
In `LibraryKidsTile`:
- Inner plate `<div>` (`backgroundColor: interior`): `bottom: '20%'` → `bottom: '24%'`
- Hairline `<div>` (`aria-hidden`, `height: 1`): `bottom: '20%'` → `bottom: '24%'`
- Title strip wrapper `<div>`: `height: '20%'` → `height: '24%'`

### 2. Locked TILE_COLORS map
Add at module scope, just above `PRODUCT_ACCENT`:
```tsx
const TILE_COLORS: Record<string, { frame: string; interior: string; text: string }> = {
  jag_i_mig:       { frame: '#E89B6B', interior: '#F2BC97', text: '#5A3A1F' },
  jag_med_andra:   { frame: '#CB7AB2', interior: '#DCA1C8', text: '#FAEDF2' },
  jag_i_varlden:   { frame: '#C6D423', interior: '#D4DE48', text: '#2E2D08' },
  vardagskort:     { frame: '#8BDDB0', interior: '#C4F0DA', text: '#0E2E22' },
  syskonkort:      { frame: '#CF8BDD', interior: '#EAC8EE', text: '#2A1F40' },
  sexualitetskort: { frame: '#B87560', interior: '#CFA08D', text: '#FAEDE5' },
};
```
Inside `LibraryKidsTile`, replace the three lines that currently declare `frame`, `interior`, and `darkText` (using `PRODUCT_ACCENT`, `color-mix`, and `productDarkText`) with a single destructuring statement that:
- Reads from `TILE_COLORS` indexed by the product id
- Renames the `text` field to `darkText` via destructure
- Falls back to `{ frame: '#2A2D3A', interior: '#3A3D4A', text: '#5A3A1F' }` when the product id is not in the map

Variable names must remain `frame`, `interior`, `darkText`. `PRODUCT_ACCENT` and `productDarkText` imports stay (still used by `StillUsMarquee`).

### 3. Tagline single-line
On the italic `{TAGLINES.still_us}` `<p>`: `fontSize: 12` → `11`. Keep `lineHeight: 1.3`.

### 4. Darker medallion
On the circle `<div>` (`borderRadius: '50%'`): replace the current `background` (a `color-mix(... 75%, white)` lighter tint) with `background: '#5A85D5'`. Keep `overflow: 'hidden'`, `aspectRatio`, flex centering.

### 5. Larger circle, uncropped illustration
- Circle `<div>`: `flex: '0 0 95px'` → `flex: '0 0 105px'`
- `<img src={illustrationStillUs}>`: `width: '115%', height: '115%'` → `width: '100%', height: '100%'`. Keep other style props.

### Verification
Screenshot `/?devState=browse` at 390×844:
- Kids meta lines no longer clip
- Frame/interior colors match locked spec exactly
- Jag med Andra title in `#FAEDF2`; Närhet & Intimitet in `#FAEDE5`
- Other kids titles in their dark spec colors
- Vårt Vi medallion is `#5A85D5` (darker than banner), illustration fully visible
- Vårt Vi tagline on a single line
