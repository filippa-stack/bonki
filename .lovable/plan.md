# Library Mock — sandboxed design playground

A disposable, isolated copy of the lobby at `/library-mock` so you can prototype a new layout without risking the live `ProductLibrary`. Uses real account data so it reflects your actual purchases, paused sessions, and couple space.

## What gets created

1. **`src/components/ProductLibraryMock.tsx`** — a verbatim copy of `src/components/ProductLibrary.tsx` to start. Same imports, same data hooks, same behavior. This is your sandbox; edit freely.

2. **`src/pages/LibraryMock.tsx`** — thin page wrapper, mirrors `src/pages/Index.tsx` but renders `<ProductLibraryMock />`. Skips the post-purchase / skip-to-product / par-first-visit redirects so the mock always lands on the mock layout.

3. **Route registration in `src/App.tsx`** — add `<Route path="/library-mock" element={<LibraryMock />} />` inside `ProtectedRoutes` (so auth still applies, real data still loads). Lazy-imported like the other pages.

4. **Subtle dev badge** — small fixed pill in the corner of the mock page reading "MOCK · /library-mock" so it's never confused with the real lobby in screenshots. Includes a tiny link back to `/` for A/B comparison.

## What stays untouched

- `ProductLibrary.tsx`, `Index.tsx`, bottom nav, `BottomNav` library tab redirect logic — none of them know the mock exists.
- No changes to data hooks, `useAllProductAccess`, `useCoupleSpaceContext`, `LibraryResumeCard`, palette tokens, or product manifests.
- No new DB tables, no edge functions, no migrations.

## Access

- Direct URL only: `https://...lovable.app/library-mock` (and same path on prod). Not linked from any nav.
- Honors auth (must be logged in) and works with the existing `?devState=...` debug params, since data hooks are reused as-is.

## Promotion / cleanup path

When a mock design wins:
- Port the chosen layout into `ProductLibrary.tsx`.
- Delete `ProductLibraryMock.tsx`, `LibraryMock.tsx`, and the route line in `App.tsx`.

## Technical notes

- `ProductLibraryMock` keeps the same prop signature as `ProductLibrary` (currently none) so promotion is a straight copy-paste.
- Page wrapper still calls `useThemeSwitcher()` and `usePartnerNotifications()` so the mock matches the real shell exactly.
- No memory updates needed — the mock is explicitly disposable and outside the locked design surface.
