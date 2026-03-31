

## Fix: Remove Stacked Padding in Still Us Question Card

### Root cause
The Still Us card renders through three nested components, each adding its own padding:

| Layer | Padding |
|---|---|
| White card (CardView) | `28px` top, `24px` sides, `20px` bottom |
| SectionView wrapper | `16px` top, `16px` bottom |
| PromptItem `div.px-6.py-4` | `16px` top/bottom, `24px` sides |
| **Total top padding** | **60px** |

The Kids card renders a `<motion.p>` directly — only the white card's `28px` top padding applies.

### Fix

**`src/pages/CardView.tsx`** — Reduce the white card padding since SectionView+PromptItem add their own:

Change `padding: '28px 24px 20px'` → `padding: '12px 0 4px'` on the Still Us white card (~line 2597).

This accounts for the inner layers:
- Top: 12 + 16 (SectionView) + 16 (PromptItem) = 44px ≈ Kids' 28px + 16px
- Sides: 0 + 0 (SectionView) + 24px (PromptItem) = 24px = Kids' 24px
- Bottom: 4 + 16 + 16 = 36px → close to Kids' 20px + note area

**`src/components/SectionView.tsx`** — Reduce SectionView padding for `stillUsMode`:

Lines 85-90: When `stillUsMode` is true and not exercise/scenario/backArrow, use `paddingTop: '0px'` and `paddingBottom: '0px'`. Also set `paddingRight: '0'` (remove the 24px right padding that only makes sense for bookmark icons).

This gives us:
- Top: 12 (card) + 0 (SectionView) + 16 (PromptItem py-4) = 28px — matches Kids
- Sides: 0 (card) + 0 (SectionView) + 24 (PromptItem px-6) = 24px — matches Kids
- Bottom: 4 (card) + 0 (SectionView) + 16 (PromptItem) = 20px — matches Kids

Two files, pure padding values. No structural changes, no flickering logic touched.

