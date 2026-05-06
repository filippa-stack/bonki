# Kids tile + nav refinements

Three small edits across three files. No structural change.

## 1. `src/components/ProductCardTile.tsx`

- Line 103: title `fontSize: '16px'` → `'18px'`.
- Checkmark block (lines ~129–152):
  - Container `width/height: 18` → `16`.
  - SVG `width="18" height="18"` → `width="16" height="16"` (keep `viewBox="0 0 18 18"`).
  - SVG filter drop-shadow alpha `0.5` → `0.3`.
  - Path `strokeWidth="2.5"` → `"2"`.
  - `stroke={SAFFRON_FLAME}` unchanged. Position (`top: 16, right: 16`) and animation unchanged.

## 2. `src/components/AdultProductCardTile.tsx`

Apply identical checkmark refinement (lines ~117–140): container 18→16, SVG width/height 18→16 (keep viewBox 0 0 18 18), drop-shadow alpha 0.5→0.3, strokeWidth 2.5→2. Color, position, animation unchanged. Card title size unchanged.

## 3. `src/components/CategoryFilterChips.tsx`

Line 171: `opacity: isSelected ? 1 : 0.65` → `opacity: isSelected ? 1 : 0.78`. Selected stays at 1.0; underline marker, typography, transitions unchanged. Applies to both kids and adult product homes.

## Verification (390×844)

- `/product/jag-i-mig`: tile titles read at 18px; chip row's unselected labels clearly tappable; checkmarks read as elegant ticks.
- `/product/still-us`: same chip readability; checkmarks refined; adult tile titles unchanged.
