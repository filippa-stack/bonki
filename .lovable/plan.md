## Apple compliance hardening — Account deletion + Privacy Manifest

Build target: 1.0 (7). All four Apple secrets are confirmed in Lovable Cloud (`APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_CLIENT_ID`, `APPLE_PRIVATE_KEY`).

### A. Account deletion end-to-end (Guideline 5.1.1(v))

**A1. Edge function — `supabase/functions/delete-account/index.ts`**

Authenticated, server-side deletion. Flow:

1. Validate JWT via `getClaims()` → resolve `userId`.
2. Mint Apple `client_secret` JWT (ES256) using `APPLE_TEAM_ID` (iss), `APPLE_KEY_ID` (kid), `APPLE_CLIENT_ID` (sub), `APPLE_PRIVATE_KEY` (p8). 5-minute expiry, `aud: https://appleid.apple.com`. Use `npm:jose@5` for stable signing.
3. Best-effort Apple revocation:
   - Look up `auth.identities` for `provider='apple'` for this user.
   - If a token is available in `identity_data` (rare for native `signInWithIdToken` flow), `POST https://appleid.apple.com/auth/revoke` with `client_id`, `client_secret`, `token`, `token_type_hint`.
   - If no token is available, log to `system_events` with reason `apple_revoke_skipped_no_token` and proceed.
   - Any non-200 from Apple is logged but does not block deletion.
4. Call existing `public.delete_user_account(p_user_id)` RPC (service-role client) — wipes all 30+ tables.
5. Call `supabase.auth.admin.deleteUser(userId)` — removes the auth row.
6. Return `{ success: true }` (or 500 with reason on hard failure).

CORS headers on every response. `verify_jwt = false` in `supabase/config.toml` (we validate the JWT in code via `getClaims`, matching the rest of the project's edge functions).

**Why best-effort revoke is compliant:** Apple requires the *attempt*, not guaranteed success. Native `signInWithIdToken` (our Capgo flow) doesn't receive an Apple refresh token — only the OAuth code-exchange flow does. We log the attempt for audit and proceed with full data deletion. Users can manually revoke at appleid.apple.com → Sign in with Apple → Bonki.

**A2. UI — `src/components/KontoSheet.tsx`**

Replace the disabled "Radera konto" button with an active flow:

- Active state: `color: '#8B3A3A'`, no opacity dimming.
- Tap → opens a Radix `Dialog` (`@/components/ui/dialog`) styled to match the sheet (cream `#F7F2EB`, serif title, Swedish copy):
  - Title: "Radera konto"
  - Body: "Detta tar bort ditt konto och all din data permanent. Det går inte att ångra."
  - Confirmation input: user must type `RADERA` exactly to enable the destructive button.
  - Buttons: "Avbryt" (secondary) + "Radera permanent" (destructive, disabled until input matches).
- Dismissal (accessibility): Escape key, click on overlay, "Avbryt" button, and the auto-rendered close (X) all close the dialog via `onOpenChange`. Dismissal is blocked only while the delete request is in flight.
- On confirm:
  - `supabase.functions.invoke('delete-account')` with auth header.
  - Success: `toast.success('Ditt konto har raderats.')`, `signOut()`, `navigate('/login')`.
  - Error: `toast.error('Kunde inte radera kontot. Försök igen eller kontakta support.')`, dialog stays open.
- Disable the destructive button + show `Loader2` spinner while in flight.

### B. Privacy Manifest template (ITMS-91053)

**B1.** Generate `/mnt/documents/PrivacyInfo.xcprivacy` covering Capacitor's required-reason API usage:

- `NSPrivacyAccessedAPICategoryUserDefaults` → `CA92.1`
- `NSPrivacyAccessedAPICategoryFileTimestamp` → `C617.1`
- `NSPrivacyAccessedAPICategorySystemBootTime` → `35F9.1`
- `NSPrivacyAccessedAPICategoryDiskSpace` → `E174.1`
- `NSPrivacyTracking` = `false`
- `NSPrivacyTrackingDomains` = empty array
- `NSPrivacyCollectedDataTypes` = empty array (data collection is declared in App Store Connect, not the manifest)

**B2.** Placement instructions for Göran:

- Drop `PrivacyInfo.xcprivacy` into `ios/App/App/` in Xcode.
- Add to the `App` target via "Target Membership" in the file inspector.
- RevenueCat (≥ 4.43.0) and `@capgo/capacitor-social-login` (≥ 7.x) ship their own `PrivacyInfo.xcprivacy` inside their SDKs — verify post-archive by searching the built `.app` bundle for `*.xcprivacy`.

### C. Verification

- `bunx tsc --noEmit` — must pass clean.
- Deploy `delete-account` via the deploy tool.
- Smoke-test on web: confirm `RADERA` gating, spinner, sign-out + redirect.
- Sandbox test on TestFlight pre-submission: throwaway Apple ID → Sign in with Apple → delete → confirm `auth.users` row gone + revoke attempt logged.

### Out of scope (already verified or post-launch)

- Restore Purchases — already wired in `KontoSheet.tsx` via `restorePurchases()`.
- Xcode 26 — Göran verifies locally via `xcodebuild -version`.
- RevenueCat → `user_product_access` real-purchase test — post-launch monitoring.

### Technical details

- **Apple revoke endpoint**: `POST https://appleid.apple.com/auth/revoke`, `Content-Type: application/x-www-form-urlencoded`. Returns 200 with empty body on success.
- **client_secret JWT**: ES256, header `{ alg: 'ES256', kid: APPLE_KEY_ID }`, payload `{ iss: APPLE_TEAM_ID, iat, exp: iat+300, aud: 'https://appleid.apple.com', sub: APPLE_CLIENT_ID }`. Signed with `jose@5` `SignJWT` + `importPKCS8`.
- **Order matters**: revoke Apple → delete app data → delete auth user. Deleting auth first would lose the identity record needed for revoke lookup.

### Files touched

- `supabase/config.toml` — add `[functions.delete-account]` block (`verify_jwt = false`).
- `supabase/functions/delete-account/index.ts` — new.
- `src/components/KontoSheet.tsx` — wire confirmation dialog + delete call.
- `/mnt/documents/PrivacyInfo.xcprivacy` — generated artifact for Göran.
