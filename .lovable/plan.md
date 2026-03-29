

## Fix: Transparent Header & CTA in Kids Sessions

### Root Cause

The illustration background image inside the content area uses `position: absolute; inset: -32%; width: 164%; height: 164%` with `overflow: visible` on its parent. This causes the illustration to bleed **upward over the header** and **downward over the CTA button**, partially obscuring both with a 70%-opacity image layer.

The header and CTA are flex siblings of the content area and have no explicit `z-index` or `position: relative`, so they lose the stacking battle against the overflowing illustration.

### Fix

In `src/pages/CardView.tsx`, add `position: relative` and `zIndex: 2` to:
1. The **header bar** div (line ~2652)
2. The **CTA wrapper** div (line ~2928)

This ensures both render above the bleeding illustration without changing the visual overflow effect.

### Files changed

| File | Change |
|---|---|
| `src/pages/CardView.tsx` | Add `position: 'relative', zIndex: 2` to header div and CTA wrapper div in the kids live session block |

### Not touched
- Illustration sizing/overflow (the bleed effect is intentional)
- Still Us rendering blocks
- Protected ref patterns (`suppressUntilRef`, `prevServerStepRef`, `pendingSave`, `hasSyncedRef`)

