## Step 4 — Auth race fix in product access hooks

### The bug

Both `useProductAccess` and `useAllProductAccess` read `user` from `useAuth()` but ignore the `loading` flag. On cold start there are two renders:

1. **Render 1**: `AuthContext` is mid-`getSession()`. `user === null`, `auth.loading === true`. The hooks see `!user?.id`, hit the `setLoading(false)` early-return, and report `hasAccess: false, loading: false`.
2. **Render 2** (~50–500 ms later): session resolves, the hook re-runs and eventually returns the real value.

In render 1, any consumer that gates on `loading` is fine — but consumers that don't gate (and even those that do, because `loading: false` arrives prematurely) momentarily render the unauthenticated state. The most damaging consumer is `ProductHome.tsx` line 92, which renders `<ProductPaywall>` for purchased users for one frame on every cold load. Same class hits `CardView.tsx`, `Category.tsx`, `KidsCardPortal.tsx`, `CompletedSessionView.tsx`, `StillUsExplore.tsx`, and `ProductLibrary.tsx`.

### The fix

Make both hooks honor `auth.loading`. New contract:

- While auth is hydrating → `loading: true`, `hasAccess: false` / `purchased: empty Set`.
- After auth resolves with no user → `loading: false`, `hasAccess: false`.
- After auth resolves with a user → `loading: true` until the DB query returns, then real value.

### Files changed (2)

**`src/hooks/useProductAccess.ts`** — pull `loading: authLoading` from `useAuth()`, add to dep array, gate the early-return on `!authLoading`, keep `loading: true` while auth is hydrating, set `loading: true` before each DB fetch.

**`src/hooks/useAllProductAccess.ts`** — same shape.

Both hooks already start with `useState(true)` for loading, so the initial render is already correct. The fix is preventing the premature `setLoading(false)` on the first effect run before auth has resolved.

### Why no consumer files need to change

Every site that uses these hooks falls into one of two categories:

1. **Already gates on the hook's `loading`** (ProductHome, Category, CardView, ProductLibrary): they will now wait through the auth-hydration window automatically and stop flashing.
2. **Doesn't gate on `loading`** (KidsCardPortal, CompletedSessionView, StillUsExplore, Category line 119): these are non-blocking uses (badges, hints, conditional sections). They're fine because `hasAccess` starts `false` and flips at most once to its real value — no transient `true → false → true` sequence visible as a flash.

Result: surgical change, exactly 2 files, ~10 lines each.

### What stays untouched

- `AuthContext.tsx` — already exposes `loading` correctly.
- All 8 consumer files — zero signature changes.
- Bug 2 work (CardView session logic, NormalizedSessionContext, useNormalizedSessionState, activate-session edge function) — fully isolated.
- All other hooks.

### Out of scope (for later)

Lifting to a single `ProductAccessContext` that fetches once per session and serves all consumers — this would also fix the N+1 query pattern on the lobby. Not part of Step 4.

### Verification after shipping

1. Cold-load `/product/jag-i-mig` as the reviewer with cleared localStorage → loading shell → product home directly. No paywall flash.
2. Cold-load `/` (library) as a purchased user → tiles render with correct badges on first paint. No "unpurchased" flash.
3. Cold-load `/product/jag-i-mig` signed out → paywall renders (no regression).
4. Cold-load a deep card link as a purchased user → CardView loading shell holds until real value, no flash.
5. Sign-out then sign-in on a product page → smooth transition.

### Next after Step 4

Stop and report the diff. On approval, proceed to Step 5 (UI guard) and Step 7 (verification walkthrough).
