

## Install and initialize RevenueCat (Capacitor) — infrastructure only

Pure additive change. No purchase logic, no UI, no edits to Stripe, `/buy`, or protected session files. App behaves identically on web; on native iOS, RevenueCat boots silently after login.

### Changes (4 total)

**1. Add dependency**
- `@revenuecat/purchases-capacitor` (latest 9.x). Compatible with the project's Capacitor 8.x core.

**2. New file — `src/lib/revenueCat.ts`**
Exports `initRevenueCat(userId)` and `logOutRevenueCat()` exactly as specified in the prompt:
- Web / non-native → no-op (Stripe path unchanged).
- iOS → `Purchases.setLogLevel(INFO)` then `Purchases.configure({ apiKey: 'appl_nPPbYisknZGlswxGmwZZzMUjgWl', appUserID: userId })`.
- Re-entry safe via `initialized` flag; subsequent calls with a different user → `Purchases.logIn({ appUserID })`.
- Android branch intentionally left for a later prompt.
- All errors caught and logged, never thrown (cannot break auth).

**3. Wire into `src/contexts/AuthContext.tsx`** — the only place that owns Supabase auth state. Two surgical edits:

- **Init on authenticated session.** Inside the existing `onAuthStateChange` handler, in the `SIGNED_IN` branch (right next to the existing `trackPixelEvent('CompleteRegistration')` and `savePendingLegalConsent` calls), add `initRevenueCat(session.user.id)`. Also call it from the `getSession()` `.then(...)` resolver when a session already exists (covers cold-start where the user is already logged in and `SIGNED_IN` won't fire). Both calls are fire-and-forget (no `await` needed inside the listener; errors are swallowed inside `initRevenueCat`).

- **Log out before Supabase.** In the existing `signOut` method, call `await logOutRevenueCat()` **before** `await supabase.auth.signOut()`. Because both `KontoSheet.handleSignOut` and `Header.handleSignOut` go through this single context method, this one edit covers every logout entry point in the app — no edits needed in those components.

**4. Do not touch**
- `/buy`, `BuyPage.tsx`, `ClaimPage.tsx`, `create-checkout` edge function, `stripe-webhook`, `Paywall.tsx`, `PaywallFullScreen.tsx`, `PaywallBottomSheet.tsx`, `ProductPaywall.tsx`.
- `CardView.tsx`, `useSessionReflections.ts`, `useNormalizedSessionState.ts`.
- `KontoSheet.tsx`, `Header.tsx` (already covered transitively via `AuthContext.signOut`).
- `capacitor.config.ts`, `package.json` scripts.

### Verification

- **Web (bonkiapp.com)** — `Capacitor.isNativePlatform()` returns `false`; `initRevenueCat` early-returns. Stripe checkout flow unchanged. No console noise.
- **iOS native** (after `git pull` → `npm install` → `npx cap sync ios` → run in Xcode):
  - App launches normally.
  - After login (Google or magic-link), Xcode console shows `[Purchases]` INFO logs confirming SDK configuration with the Supabase user ID as `appUserID`.
  - Logout → `[Purchases]` log for the logOut call, then Supabase signs out, navigation to `/login` works.
  - Cold start with existing session → `[Purchases]` configures via the `getSession()` path.
- **No UI changes anywhere.**

### Notes on scope

- Bundle impact on web is ~0 — the plugin's web layer is tiny and never invoked because of the `isNativePlatform()` guard.
- The Apple API key (`appl_…`) is a publishable RevenueCat client key, safe to commit (same pattern as the Supabase publishable key already in `client.ts`).
- The next three prompts (offerings fetch, purchase flow, restore + entitlement sync) will build on this foundation without further touching `AuthContext`.

