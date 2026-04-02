

## Fix: Move all content upward so CTA is visible

**File**: `src/components/Onboarding.tsx`

### Problem
The outer container (line 31) has `justifyContent: 'flex-end'`, which pushes all content to the very bottom of the screen. Since all children are now `flex: '0 0 auto'`, there's dead space above the logo and the CTA gets clipped at the bottom edge.

### Fix
**Line 31**: Change `justifyContent: 'flex-end'` → `justifyContent: 'center'`

This vertically centers the entire stack (logo + text + tiles + CTA) within the viewport, eliminating dead space above and ensuring the CTA is fully visible.

### Unchanged
Everything else — all children flex values, tiles, text, logic, tracking.

