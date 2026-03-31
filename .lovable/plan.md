

## Tighten White Question Card Around Content

### Problem
The white card has generous padding (`28px 24px 20px`) plus `justifyContent: 'center'` on both the card itself and the parent content area. Combined with `SectionView`'s own internal padding (`16px` top/bottom), this creates excessive empty space inside the white frame.

### Changes

**`src/pages/CardView.tsx`** — Still Us live session block, two edits:

1. **White card padding** (line 2599): Reduce from `28px 24px 20px` to `16px 20px 12px`
2. **White card justifyContent** (line 2596): Remove `justifyContent: 'center'` — content should just flow naturally from the top
3. **Content area justifyContent** (line 2561): Change from `'center'` to `'flex-end'` — pushes the card toward the CTA instead of floating in the middle

**`src/components/SectionView.tsx`** — When in `stillUsMode`:

4. **SectionView padding** (line 84-90): For Still Us live sessions (`isLive && !backgroundImageUrl && !isExerciseStep`), the `paddingTop: '16px'` is fine but we should check if `paddingBottom: '16px'` (line 90) can be reduced. Since `stillUsMode` prop exists, reduce SectionView's padding to `8px` top and `8px` bottom when `stillUsMode` is true.

### Net effect
- Card padding: 28+16 = 44px top → 16+8 = 24px top (roughly halved)
- Card padding: 20+16 = 36px bottom → 12+8 = 20px bottom
- Card no longer vertically centers its content — text starts at top
- Card sits near the CTA instead of floating in the middle of the screen

### Risk: minimal
Pure CSS adjustments. No structural or logic changes.

