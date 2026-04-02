

## Plan: Fix Onboarding Routing + Returning User Detection + Intro Flash

Two files, three fixes applied together.

---

### File 1: `src/pages/Index.tsx`

**Fix A — DB-backed onboarding bypass for returning users:**
- Add `completeOnboarding` to the existing `useApp()` destructure
- Add `useState(false)` for `dbOnboardingChecked`
- Add `useEffect` after the migration effect that queries `couple_sessions` for any completed session; if found, calls `completeOnboarding()`; always sets `dbOnboardingChecked(true)`
- Update the onboarding gate to show `<BonkiLoadingScreen />` while `dbOnboardingChecked` is false
- Add import for `BonkiLoadingScreen`

**Fix B — Module-level audience routing (StrictMode-safe):**
- Add `let audienceRouteConsumed = false` at module level (above the component)
- Delete the `useEffect` cleanup block (lines 93–100)
- Replace the audience routing block with a guarded version that sets `audienceRouteConsumed = true`, removes the localStorage key, and sets the guard key — all synchronously in render

### File 2: `src/pages/ProductHome.tsx`

**Fix C — Tri-state showIntro to eliminate flash:**
- Change `useState` initializer to return `null` (undecided) when no localStorage key exists, `false` when key exists
- Update the reconciliation `useEffect` to set `true` or `false` based on `needsIntro`
- Change the intro render gate from `showIntro && product` to `showIntro === true && product`
- Add a loading gate: when `showIntro === null`, render a plain div matching the product background — **not** `BonkiLoadingScreen` (wrong background color would cause a visible flash):
```tsx
if (showIntro === null) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: product?.backgroundColor ?? 'var(--surface-base)',
    }} />
  );
}
```
- No `BonkiLoadingScreen` import needed in this file

### Files NOT changed
No changes to `ProductIntro.tsx`, `Onboarding.tsx`, `App.tsx`, `BottomNav`, or any protected patterns.

