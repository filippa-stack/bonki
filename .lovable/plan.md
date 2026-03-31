

## Match Still Us Card Padding to Kids Card

### Problem
The Still Us white card has different padding than the Kids card, plus extra internal spacing from `SectionView` and an `alignItems: 'center'` that adds vertical centering space.

| | Kids card | Still Us card |
|---|---|---|
| Card padding | `28px 24px 20px` | `16px 20px 12px` |
| `alignItems` | not set | `center` (adds vertical space) |
| SectionView padding | `16px` top/bottom | `8px` top/bottom |
| **Total top** | 28+16 = 44px | 16+8 = 24px |

The Kids card looks right despite higher padding numbers because it doesn't have `alignItems: 'center'` on the card container — that property stretches the card vertically to center content. The Still Us card also routes through `SectionView` + `PromptItem` which add their own wrapper divs and spacing, unlike the Kids card which renders a simple `<motion.p>`.

### Changes

**`src/pages/CardView.tsx`** — Still Us live session white card (line ~2587):

1. **Remove `alignItems: 'center'`** (line 2595) — this is the main culprit creating extra vertical space
2. **Match padding to Kids**: Change from `16px 20px 12px` to `28px 24px 20px` (matching line 2916)

Two lines changed, no structural or logic modifications. Flickering fixes (`initial={false}`, always-mounted patterns) are untouched.

