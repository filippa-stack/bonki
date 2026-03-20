

## Remove Mobile-Only Gate for Desktop Preview

**What**: Make `MobileOnlyGate` a pass-through so the app renders on desktop without the blocker screen or phone simulator iframe.

**How**: One-line change in `src/components/MobileOnlyGate.tsx` — return `children` immediately at the top of the component, bypassing all gate logic. This preserves the component and all its code for when you want to re-enable it later (just remove the early return).

**File**: `src/components/MobileOnlyGate.tsx`
- Add `return <>{children}</>` as the first line of the component body (line ~22)

No other files need changes.

