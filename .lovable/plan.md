

## Investigation: Why `hasCompletedOnboarding` is false + White Patch

### What I found

**`hasCompletedOnboarding` mechanism**: It's purely localStorage-based. `AppContext` reads `localStorage.getItem('vi-som-foraldrar-state')` on mount (line 178). If that key is missing or doesn't contain `hasCompletedOnboarding: true`, it defaults to `false` (line 202). There's no database-backed fallback.

**Why it's false in preview**: The Lovable preview sandbox starts with clean localStorage. The onboarding flag was never set because no one ran through the Onboarding flow in this session. This is a **testing artifact**, not a production bug. Real users who completed onboarding have the flag persisted.

### Plan — 1 change only

**File: `src/App.tsx` (line 96)**
Change the wrapper `div` background from `var(--surface-base, hsl(46 64% 89%))` to `transparent`. Pages already set their own backgrounds; the cream fallback on body/`#root` covers pages that don't.

**No change to BottomNav.tsx.** The `hasCompletedOnboarding` guard is working correctly. In production, users who completed onboarding have the localStorage flag. In Lovable preview, use `?devState=pairedIdle` or similar to bypass the onboarding gate — the `devBypassGates` logic in `Index.tsx` already handles this, but BottomNav doesn't check `devState`. If you want the nav visible in dev preview too, we can add a devState check there, but that's a dev-tooling choice, not a bug fix.

### Files changed: 1
- `src/App.tsx` — wrapper background → `transparent`

