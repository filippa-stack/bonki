

## Bonki Performance & Flicker Elimination — Root-Level Fix

### Summary
3 changes: new `useRouteTheme` hook (useLayoutEffect-based background sync), unified loading gate in `ProtectedRoutes`, and inline style on `<html>` in index.html.

### Critical scoping rule
- `useRouteTheme()` → called in `AppRoutes` (inside `BrowserRouter`, outside providers)
- Unified loading gate → inside `ProtectedRoutes` (inside `CoupleSpaceProvider` + `NormalizedSessionProvider`)
- These are two different levels. Do NOT hoist space/session loading checks into `AppRoutes`.

```text
BrowserRouter
  └── AppRoutes
        ├── useRouteTheme()              ← HERE (no provider needed)
        └── Routes
             └── /* → ProtectedRoutes
                    ├── CoupleSpaceProvider
                    │   └── NormalizedSessionProvider
                    │       └── AppProvider
                    │           ├── unified gate   ← HERE (contexts available)
                    │           └── ActiveSessionGuard → Routes
```

### Change 1: Create `src/hooks/useRouteTheme.ts`
New file. Uses `useLocation().pathname` + `useLayoutEffect` to set `--surface-base`, `--page-bg`, `--color-bg`, `--color-bg-base`, and `document.body.style.backgroundColor` synchronously before paint. Resolves colors from static product manifests (`allProducts`, `getProductForCard`). Defaults to `#0B1026`.

Route matching:
- `/product/:slug` → `product.backgroundColor`
- `/card/:cardId` → product-for-card backgroundColor
- `/shared`, `/diary` → `#1A1A2E`
- Everything else → `#0B1026`

### Change 2: Unified loading gate in `ProtectedRoutes` (App.tsx)
**In `AppRoutes`**: Add `useRouteTheme()` call only — no loading gate here.

**In `ProtectedRoutes`**: After the existing auth check, before rendering children, add a combined gate:
```typescript
const { loading: spaceLoading } = useCoupleSpaceContext();
const { loading: sessionLoading } = useNormalizedSessionContext();

if (!hasProtectedRendered.current && (spaceLoading || sessionLoading)) {
  return <BonkiLoadingScreen />;
}
```
This replaces the sequential cascade (auth loader → saffron dot → skeleton) with one screen. The `hasProtectedRendered` ref prevents re-engagement after first render.

### Change 3: `index.html` — inline style on `<html>`
Add `style="background-color: #0B1026;"` to the `<html lang="sv">` tag.

### Files modified
| File | Action |
|---|---|
| `src/hooks/useRouteTheme.ts` | Create |
| `src/App.tsx` | Edit (~8 lines) |
| `index.html` | Edit (1 attribute) |

### Not changed
All DO NOT CHANGE items. No removal of `hasRenderedContent` refs, `usePageBackground`, `useProductTheme`, `ActiveSessionGuard`, or any autosave/session machinery.

