

## Resolve App Store rejection — Apple Sign In + reviewer demo account

Apple flagged two blockers. Both are root-cause issues in the current build, not just config tweaks.

---

### Issue 1: "Fortsätt med Apple" throws an error on iPhone 17 Pro Max

**Root cause:** The Capgo plugin we swapped to (`@capgo/capacitor-social-login`) requires the iOS native side to register the plugin in `AppDelegate.swift` AND to have **"Sign in with Apple" added as an Xcode capability** on the app target. Without the entitlement, the system call fails the moment the user taps the button and Apple's review device sees an error toast.

A second contributing problem: the JS-only `SocialLogin.initialize({ apple: { clientId } })` call passes `com.bonkistudio.bonkiapp` as the client ID. On native iOS, Apple expects the **bundle ID** (which it picks up from the app itself) — passing the Services ID here is fine for web but on iOS the plugin documents that `clientId` should match the iOS bundle identifier exactly, which it does. So the entitlement is the actual blocker.

**Fix (code changes I can make):**

1. **`src/lib/appleSignIn.ts`** — wrap the entire flow with explicit error surfacing so the user sees a real Swedish message instead of a silent failure, and log the underlying native error code so the next TestFlight build is easier to diagnose if Apple rejects again. Also: stop returning `error: 'Not a native platform'` as a "failure" — it's a no-op, not an error.

2. **`src/pages/Login.tsx`** — when `result.success === false && !result.cancelled`, show the actual error message from the plugin (not the generic "Kunde inte logga in med Apple. Försök igen.") so we and Apple can see what went wrong.

**Fix (manual, outside Lovable — must be done in Xcode before re-submitting):**

3. **In Xcode → Signing & Capabilities → `+ Capability` → add "Sign in with Apple"** on the BONKI target. This generates the `BONKI.entitlements` file with `com.apple.developer.applesignin = ["Default"]`. Without this, the native call will keep failing on every device.

4. **In Apple Developer Console → Identifiers → `com.bonkistudio.bonkiapp` (iOS App ID)** → enable the "Sign In with Apple" capability and re-download the provisioning profile.

5. **`npx cap sync ios`** then archive and re-upload.

I will document steps 3–5 in a follow-up message with exact click paths so you can do them in Xcode in ~3 minutes.

---

### Issue 2: Reviewer can't sign in with `apple.review@bonkistudio.com` / `BonkiReview2026!`

**Root cause:** The reviewer login form is hidden behind `?review=1` in the URL. Apple's reviewer opens the app from the home screen on a device — they will **never** hit `/login?review=1`. They land on `/login` and see only Apple / Google / e-post buttons. There's no place to enter the password you gave them in App Store Connect, so the credentials are effectively unusable.

A second problem: even if the form were visible, I can't verify the account exists in the Live Supabase project from here (auth schema is locked from direct query). It's possible the account was created in Test, not Live, or with a different password.

**Fix:**

1. **`src/pages/Login.tsx`** — show the reviewer email/password form **always on native iOS builds** (not gated behind `?review=1`), styled as a small, low-emphasis "Recensentinloggning" section below the OAuth buttons. On web it stays hidden behind `?review=1` to avoid cluttering the public login. Apple's reviewer can then log in with the provided credentials directly.

   Alternative if you don't want a visible reviewer field in the App Store build: keep the gate, but tell App Store Connect the reviewer must open `https://bonkiapp.com/login?review=1` in Safari first to sign in, then return to the app. This is fragile — Apple often rejects flows that require leaving the app. **Recommendation: show the form on native.**

2. **Verify the demo account exists in the Live backend.** I'll need to either:
   - Have you confirm in Lovable Cloud → Users that `apple.review@bonkistudio.com` exists, has `email_confirmed_at` set, and the password is `BonkiReview2026!`, OR
   - Create a one-shot edge function (or a migration with `auth.users` insert via the admin API) to provision the account idempotently on Live.

   Easiest path: you create it manually in Cloud → Users (Add user → email + password + auto-confirm). Takes 30 seconds and avoids touching auth schema with code.

3. **Grant the reviewer account beta/full product access** so they actually see the app's features after login (otherwise they hit the paywall and reject again under guideline 2.1). I'll add a migration that inserts the reviewer's `user_id` into whatever beta/access table grants all products.

---

### Files I will change

- `src/lib/appleSignIn.ts` — better error propagation, log native error code.
- `src/pages/Login.tsx` — show reviewer form on native iOS always; surface real Apple error message.
- One migration — grant beta/full access to the reviewer account once it exists.

### Files / actions you must handle outside Lovable

- Xcode: add "Sign in with Apple" capability on the BONKI target.
- Apple Developer Console: enable "Sign In with Apple" on the App ID, regenerate provisioning profile.
- Lovable Cloud → Users: confirm `apple.review@bonkistudio.com` / `BonkiReview2026!` exists with email confirmed.
- `npx cap sync ios` → archive → upload new build → reply to Apple.

### Verification before resubmitting

1. On a physical iPhone with the new build: tap "Fortsätt med Apple" → native Apple sheet opens → sign in completes → lands authenticated.
2. On a physical iPhone with the new build: enter `apple.review@bonkistudio.com` / `BonkiReview2026!` in the reviewer field → lands authenticated → sees full library (no paywall).

### Rollback

Revert the three files. No data loss; the migration is additive (grants access only).

