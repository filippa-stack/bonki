

## Stop Loading Screen Flash Between Pages

### What
Add `hasRenderedContent` ref gates to both `AppRoutes` and `ProtectedRoutes` in `src/App.tsx` so `BonkiLoadingScreen` only appears on cold start, not during page navigation.

### Changes — `src/App.tsx` only

1. Add `useRef` to the existing React import
2. In `ProtectedRoutes`: add `const hasProtectedRendered = useRef(false)`, change loading gate to `if (loading && !hasProtectedRendered.current)`, set `hasProtectedRendered.current = true` before the main return
3. In `AppRoutes`: add `const hasAppRendered = useRef(false)`, change loading gate to `if (loading && !hasAppRendered.current)`, set `hasAppRendered.current = true` before the main return

### Not changed
- AuthContext loading logic
- Redirect-to-login logic
- Route definitions
- Any other file

