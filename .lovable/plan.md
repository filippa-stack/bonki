

## Onboarding: Tile Text + Spacing Fix

**File**: `src/components/Onboarding.tsx` — visual-only

### Fix 1: Kill expanding dead space
**Line 41**: Change `flex: '1 1 auto'` → `flex: '0 0 auto'`
**Line 43**: Change `marginBottom: 0` → `marginBottom: 0, paddingBottom: '12px'`

This stops the illustration wrapper from absorbing all leftover vertical space. The 12px paddingBottom creates a controlled gap to the credential text.

### Fix 2: Center and strengthen tile text
**Lines 174–194** — each tile button:
- Change `alignItems: 'flex-end'` → `alignItems: 'center'`
- Add `justifyContent: 'center'` and `textAlign: 'center'` to the button style

**Lines 189–193** — the label `<span>`:
- `fontSize: '16px'` → `fontSize: '17px'`
- `fontWeight: 600` → `fontWeight: 700`
- Add `width: '100%'` and `textAlign: 'center'`

### Unchanged
All tile dimensions (22px radius, 80px height, 12px gap), colors, shadows, selection logic, CTA, text content, tracking, routing.

