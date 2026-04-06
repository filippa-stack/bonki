

## Post-Launch Quick Fixes (3 items)

### Fix 1: PWA name "Still Us" → "BONKI"

**File:** `vite.config.ts` (lines 27–28)

The PWA manifest is defined inline in the Vite config (no separate `manifest.webmanifest` file). Change:
- `name: "Still Us"` → `name: "BONKI"`
- `short_name: "Still Us"` → `short_name: "BONKI"`

### Fix 2: Illustration fade-in on portal navigation

**File:** `src/pages/KidsCardPortal.tsx`

The image rendering happens inside the `PortalCardImage` render-prop pattern (line 438–455). The fix needs to live in the parent component that renders the `<img>`, not inside `PortalCardImage` itself.

1. Add `imageLoaded` state and reset it when card changes
2. Add `onLoad` handler and opacity transition to the `<img>` at line 440–453

Since the image is rendered inside a render-prop callback `{(imageSrc) => ...}`, the state must live in the parent component scope. The `card.id` used for reset will come from the current card in the carousel.

### Fix 3: Loading screen flash — already fixed ✓

Both guards are confirmed present in `src/App.tsx`:
- `ProtectedRoutes`: `if (loading && !hasProtectedRendered.current)` 
- `AppRoutes`: `if (loading && !hasAppRendered.current)`

No changes needed.

### Summary

| # | File | Change |
|---|---|---|
| 1 | `vite.config.ts` | Update `name` and `short_name` to "BONKI" |
| 2 | `src/pages/KidsCardPortal.tsx` | Add `imageLoaded` state + fade-in on card illustration |
| 3 | `src/App.tsx` | No change needed (already implemented) |

### Not changed
Auth logic, route definitions, session logic, BonkiButton, portal design.

