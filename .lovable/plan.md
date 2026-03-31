

## Fix: BottomNav Not Showing for Authenticated Users

### Root cause

`BottomNav` (line 77) returns `null` when `hasCompletedOnboarding` is false. But `Index.tsx` (line 125) has **three bypass paths** that skip onboarding: demo mode, devState, and the normal `hasCompletedOnboarding` flag. BottomNav only checks one of them.

This means any user who:
- Signed up before onboarding was added
- Had their localStorage cleared (e.g. Safari storage pressure)
- Uses demo/devState mode

...sees the full library content but no navigation bar.

### Fix — 1 file

**`src/components/BottomNav.tsx`** — Mirror the same bypass logic that `Index.tsx` uses:

```tsx
// Current (line 77):
if (!hasCompletedOnboarding) return null;

// Replace with:
const demoActive = isDemoMode();
const devBypass = new URLSearchParams(search).get('devState');
if (!hasCompletedOnboarding && !demoActive && !devBypass) return null;
```

Add import:
```tsx
import { isDemoMode } from '@/lib/demoMode';
```

This aligns BottomNav's visibility with Index.tsx's gate logic — if you can see the library, you can see the nav.

### Files changed: 1
- `src/components/BottomNav.tsx`

