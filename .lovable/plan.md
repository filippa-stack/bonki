# Vårt Vi Marquee — Structural Refinement

Single-component change to `StillUsMarquee` in `src/components/ProductLibrary.tsx`. No other files touched. No prop, data, or routing changes.

## Changes

### 1. Container (button)
- `align-items: stretch` → `align-items: center`
- `padding: 16px` (uniform)
- Add `min-height: 150px`
- Keep: `display: flex`, `gap: 16`, `border-radius: 14`, `background: #6495ED`, box-shadow, cursor, tap-highlight

### 2. Left zone (medallion wrapper)
Replace `flex: 0 0 105px` with:
- `flex: 0 0 40%`
- `display: flex; align-items: center; justify-content: center`

### 3. Medallion (circle)
- `width: 100%`, `aspect-ratio: 1 / 1`
- `max-width: 130px`, `max-height: 130px`
- `border-radius: 50%`
- `background: #5A85D5`
- `border: 1px solid rgba(245, 232, 204, 0.30)` — NEW hairline ring (LANTERN_GLOW @ 30%)
- `overflow: hidden`
- `display: flex; align-items: center; justify-content: center`

### 4. Illustration — direct child of medallion
No inner 78% wrapper. The medallion IS the inner zone (circular equivalent of kids tile inner zone).
- `width: 100%; height: 100%; object-fit: contain; object-position: center`
- Illustration's natural transparent margin provides breathing room (matches kids tile pattern)

### 5. Right zone (text content wrapper)
Container properties only — children unchanged:
- `flex: 1`
- `padding-left: 16px`
- `border-left: 1px solid rgba(245, 232, 204, 0.30)` — NEW vertical hairline divider
- `display: flex; flex-direction: column; justify-content: center`
- Remove old `paddingTop: 2; gap: 4`

Children (title "Vårt Vi", italic subtitle, progress pill + "21 SAMTAL" row) stay as currently rendered.

## Unchanged
- Navigation to `/product/still-us`
- Tagline, title, progress pill, eyebrow text
- Cornflower background `#6495ED`, medallion `#5A85D5`
- Illustration source
- Kids tiles, resume banner, header, everything else

## Verification (390×844)
1. Marquee min-height 150px; clear 40/60 split
2. Medallion ~130px circle with subtle hairline ring
3. Illustration fills medallion at 100% with contain-sizing (natural transparent padding)
4. Vertical hairline divider visible between medallion zone and text zone
5. Title/subtitle/pill/eyebrow all render with comfortable spacing
6. Marquee reads as structurally balanced with kids grid below

Calibration knobs if needed: hairline opacity (20–40%), medallion max-height (120–140px), min-height (140–160px).
