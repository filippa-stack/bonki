# App Store Review Resubmission Fixes

Three changes to ship together so the next TestFlight build clears Apple review.

## 1. Apple Sign-In nonce fix

**File:** `src/lib/appleSignIn.ts`

Add a `sha256Hex` helper using `crypto.subtle.digest('SHA-256', ...)`. In `signInWithApple`:

- Generate `rawNonce = randomString()` (UUID).
- Compute `hashedNonce = await sha256Hex(rawNonce)`.
- Pass `hashedNonce` as the `nonce` option to `SocialLogin.login(...)` (Capgo passes verbatim → Apple → embedded as `nonce` claim in id_token, hashed).
- Pass `rawNonce` (unhashed) to `supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce: rawNonce })` — Supabase re-hashes internally to compare against the id_token claim.

This resolves the "Nonces mismatch" error the reviewer hit.

## 2. Hide Google on native iOS

**File:** `src/pages/Login.tsx`

The Google "Fortsätt med Google" button (lines 563–583) currently shows on both web and native. On native iOS the OAuth web redirect never makes it back to the app, so the button does nothing visible to the reviewer.

- Wrap the Google button in `{!isNative && (...)}`.
- The "eller" / divider already only appears in the email sub-flow, so no additional divider work needed.
- Web/PWA flow unchanged — Google stays visible there.
- Apple + email + reviewer login remain on native. This is sufficient for review.

## 3. Reset reviewer password (Live)

The `reset-reviewer-password` edge function already exists and is hardcoded to `apple.review@bonkistudio.com` / `BonkiReview2026` with `email_confirm: true`.

- Deploy the edge function to Live (in case it isn't already).
- Invoke it on **Live** via curl with the hardcoded `?token=bonki-reviewer-reset-9f4e2a1c-2026`.
- Paste the JSON response (`{ ok: true, userId: ..., email: ... }`) back to the user before they ship the next build.

Reviewer access status (already verified):
- All 7 products unlocked for UID `f05b6b17-d7b6-48f1-ae6d-77fe2ff28711` ✅
- Account exists in Live ✅
- Password just needs (re)setting to `BonkiReview2026` ✅

## App Store Connect review-notes wording (for the user to paste)

> Use the section labeled **"RECENSENTINLOGGNING — APP STORE REVIEW"** at the **top** of the login screen.
> Email: `apple.review@bonkistudio.com`
> Password: `BonkiReview2026`
> Tap **"Fyll i granskningsuppgifter"** to autofill, then **"Logga in"**.

## Verification after merge

1. Edge function returns `{ ok: true, userId: "f05b6b17-...", email: "apple.review@bonkistudio.com" }` against Live — paste to user.
2. Code review of `appleSignIn.ts` confirms hashed→Capgo, raw→Supabase.
3. Code review of `Login.tsx` confirms Google button gated by `!isNative`.

## Rollback

- Apple: revert `appleSignIn.ts` (single file, ~25 lines changed).
- Google: remove the `!isNative &&` wrapper.
- Password: re-invoke the edge function with a new password if needed.

No DB migrations, no schema changes, no routing changes.
