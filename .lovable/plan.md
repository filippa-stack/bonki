# Diagnostic logging for `useProductAccess` 0/7 failure on real device

## Context recap

- **Confirmed on Live DB (`spgknasuinxmvyrlpztx`)**: Reviewer `apple.review@bonkistudio.com` has all 7 `user_product_access` rows.
- **RLS policy on `user_product_access`**: single SELECT policy `(auth.uid() = user_id)`. Symmetric — cannot allow "list all" and deny "select one" for the same authenticated request.
- **Real-device behavior**: Library tile grid shows all 7 as purchased (`useAllProductAccess` returns the full Set). Tapping into ANY product page paywall-locks (`useProductAccess` returns `hasAccess: false`).
- **Hook code**: Both hooks share the same Supabase client, same `useAuth()` source, same table, same `auth.uid() = user_id` predicate path. They diverge only in mount timing and filter shape.

Because the DB is symmetric and both hooks are functionally identical, the divergence has to be one of:
1. The request from `useProductAccess` is sent without a valid Authorization header (RLS returns 0 rows silently → `data === null` → `hasAccess: false`).
2. `user.id` passed to `.eq('user_id', …)` at query time doesn't match the JWT `sub` of that request (RLS denies → `data === null`).
3. `authLoading` flips `false → true → false` across the route transition and the hook commits the `!user?.id` early-return branch on the wrong frame.

We can't tell which one without runtime evidence from the affected device. The simulator masked the real bug because of cached state — we need fresh data from the actual iPhone.

## Step 1 — Add diagnostic logging (TEMPORARY)

### `src/hooks/useProductAccess.ts`

Inside the effect, capture every relevant signal at the moment of the query and at the moment of the response. Use a stable tag prefix for easy filtering.

Log entries to add:

- **On every effect run**: `[ACCESS-DIAG] useProductAccess effect`, with `{ productId, authLoading, userId: user?.id, hasSession: !!session, jwtSub }` where `jwtSub` is read from `supabase.auth.getSession()`'s session.user.id at the moment the effect fires.
- **Just before the query**: `[ACCESS-DIAG] useProductAccess query`, with `{ productId, userId, jwtSub, ts }`.
- **Right after the query**: `[ACCESS-DIAG] useProductAccess result`, with `{ productId, userId, jwtSub, data, error, status, statusText }` — use `.maybeSingle()` but destructure `error`, `status`, `statusText` from the response (they're all available on PostgrestSingleResponse).
- **In the early-return branches**: `[ACCESS-DIAG] useProductAccess early-return`, with `{ reason: 'authLoading' | 'noUser' | 'noProductId', productId, userId }`.

### `src/hooks/useAllProductAccess.ts`

Mirror the same instrumentation with prefix `[ACCESS-DIAG] useAllProductAccess`. We want both side-by-side to see whether `user.id` and `jwtSub` differ across the two hooks at the same wall-clock moment.

### `src/contexts/AuthContext.tsx`

Add `[ACCESS-DIAG] AuthContext` entries on:
- `onAuthStateChange` fire: `{ event, hasSession: !!session, userId: session?.user?.id }`
- `getSession()` resolve: `{ hasSession: !!session, userId: session?.user?.id }`
- Loading flag transitions: `{ from, to }`

This lets us correlate session lifecycle with the hook's view of `user`.

### `src/pages/ProductHome.tsx`

Add one line at the top of the render: `[ACCESS-DIAG] ProductHome render`, with `{ productId: product?.id, slug, hasProductAccess, paywallAccessLoading }`. This tells us what the consumer actually saw at the frame the paywall was shown.

All log lines stay behind `console.info(...)` (not `console.log`) so they're easy to filter and distinct from the noisy `console.warn/error` channels. No conditional gating — we need them to fire on every mount during reproduction.

## Step 2 — Build & ship to TestFlight / preview

The build pipeline already auto-deploys on commit. No script changes needed. The user will rebuild the iOS simulator/TestFlight bundle from the new commit.

## Step 3 — Capture instructions for the real iPhone

Hand these to the colleague verbatim. Safari Web Inspector is the only reliable way to read iOS console output from a real device, and it requires a Mac.

### Setup (one-time, on the iPhone)

1. Open **Settings → Apps → Safari → Advanced** (on iOS 18; on older iOS it's **Settings → Safari → Advanced**).
2. Toggle **Web Inspector** ON.
3. Connect the iPhone to a Mac via USB-C/Lightning cable. **Trust the computer** when prompted on the phone.

### Setup (one-time, on the Mac)

1. Open Safari.
2. **Safari → Settings → Advanced** → tick **Show features for web developers** (older macOS: "Show Develop menu in menu bar").
3. The **Develop** menu now appears in Safari's menu bar.

### Capture procedure (every time)

1. **Fully kill the app on the iPhone** (swipe up from app switcher) so we get a true cold start.
2. Optionally, in iPhone Settings → Safari → Clear History and Website Data, to wipe any cached session. Then sign back into the app.
3. Open the app on the iPhone — land on the library page.
4. On the Mac, go to **Safari → Develop → [iPhone Name] → [App's web view]**. The web view will be named something like `id-preview--…lovable.app` or `bonkiapp.com`.
5. The Web Inspector window opens. Click the **Console** tab.
6. In the console filter box (top right of the Console tab), type `ACCESS-DIAG` to isolate our logs.
7. **Clear the console** (the 🚫 icon) so the capture starts clean.
8. On the iPhone, tap into one of the broken products (e.g. `jag_i_varlden`). Wait for the paywall to appear.
9. On the Mac, **right-click anywhere in the console output → Save Selected** (or select all → ⌘C → paste into a text file).
10. Repeat steps 7–9 for at least two more products to confirm the pattern.

### What to send back

The full text of the console log from step 9, for at least 2 product taps. Specifically we want to see, per tap:
- Did `[ACCESS-DIAG] AuthContext` show a session change between the lobby and the product page?
- Did `useProductAccess effect` see a non-null `userId` and `jwtSub` at the moment of the query?
- Did `useProductAccess result` come back with `data: null, error: null, status: 200` (RLS silent denial), `data: null, error: …` (real failure), or `data: {…}, hasAccess: true` (in which case the bug is in the consumer, not the hook)?

That set of three signals will conclusively identify which of the three hypotheses is correct, and we can write a targeted fix from there.

## Step 4 — After capture: targeted fix + log removal

Once the log evidence is in, we will:
1. Apply the minimal fix that addresses the actual root cause (not a guess).
2. Remove every `[ACCESS-DIAG]` line — they're temporary instrumentation only.
3. Re-test on the real device to confirm.

## Files modified in this plan

- `src/hooks/useProductAccess.ts` — add logging, no logic change
- `src/hooks/useAllProductAccess.ts` — add logging, no logic change
- `src/contexts/AuthContext.tsx` — add logging, no logic change
- `src/pages/ProductHome.tsx` — add one render-time log, no logic change

Zero behavior changes. Pure observability. Safe to ship and revert in a follow-up commit.
