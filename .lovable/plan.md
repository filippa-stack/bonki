

## Hide InstallGuideBanner on native (Capacitor) platforms

**File:** `src/components/InstallGuideBanner.tsx` (only file touched)

### Changes
1. Add import at the top of the file:
   ```ts
   import { Capacitor } from '@capacitor/core';
   ```
2. As the first statement inside the `InstallGuideBanner` component (before `useState`/`useEffect`), add:
   ```ts
   if (Capacitor.isNativePlatform()) {
     return null;
   }
   ```
   Placed before the hooks because `Capacitor.isNativePlatform()` returns a stable value for the lifetime of the runtime (web vs native is fixed at load), so it does not violate the rules-of-hooks invariant — the same branch is taken on every render in any given environment.

### Explicitly NOT touched
- All existing web behavior: platform detection (`detectPlatform`), `isStandalone()` check, `localStorage` dismissal, 1.5s delay, expandable steps, styling, animations.
- Any other file. `CardView.tsx`, `useSessionReflections.ts`, `useNormalizedSessionState.ts`, and everything else stay as-is.
- `App.tsx` — `<InstallGuideBanner />` stays mounted unconditionally; the component self-suppresses on native.

### Verification
- Web (bonkiapp.com, Safari/Chrome on iOS/Android, desktop): banner appears after 1.5s as before, dismissible, expandable steps unchanged.
- Native iOS app (Capacitor): no banner, no DOM node, no overlap with status bar/notch.
- Native Android app (Capacitor): no banner, no DOM node.

