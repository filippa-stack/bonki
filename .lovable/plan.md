

## Resolve Apple Sign In dependency conflict — swap to `@capgo/capacitor-social-login`

`@capacitor-community/apple-sign-in@7.1.0` is locked to `capacitor-swift-pm 7.x` and the maintainer has not shipped a Capacitor 8 release. The clean fix is to swap to `@capgo/capacitor-social-login@^8.3.17`, which officially supports Capacitor 8 (`v8.*` plugin = `v8.*` Capacitor per their compatibility matrix) and has Apple Sign In built in.

### Changes

**1. `package.json`** — swap dependency
- Remove: `"@capacitor-community/apple-sign-in": "^7.1.0"`
- Add: `"@capgo/capacitor-social-login": "^8.3.17"`

**2. `src/lib/appleSignIn.ts`** — adapt to new plugin API
The wiring (nonce/state generation, `supabase.auth.signInWithIdToken`, error/cancel handling, return shape) stays identical. Only the plugin call changes:

| Old (`@capacitor-community/apple-sign-in`) | New (`@capgo/capacitor-social-login`) |
|---|---|
| `import { SignInWithApple } from '@capacitor-community/apple-sign-in'` | `import { SocialLogin } from '@capgo/capacitor-social-login'` |
| `SignInWithApple.authorize({ clientId, redirectURI, scopes: 'email name', state, nonce })` | `SocialLogin.initialize({ apple: { clientId: 'com.bonkistudio.bonkiapp' } })` (idempotent, called once per invocation) then `SocialLogin.login({ provider: 'apple', options: { scopes: ['email', 'name'], nonce, state } })` |
| `result.response.identityToken` | `result.result.idToken` (per `AppleProviderResponse` typedef) |

Cancel detection (`code 1001` / "cancelled") stays the same — Apple's native error codes are surfaced identically.

**3. `Login.tsx`** — untouched. The exported `signInWithApple()` keeps the same signature and `AppleSignInResult` return shape, so the call site needs zero changes.

**4. `capacitor.config.ts`** — untouched. Per Capgo docs, Apple uses system APIs on iOS and needs no extra config block (defaults to enabled). Adding an explicit `plugins.SocialLogin.providers.apple: true` is optional and not needed for the fix.

### What stays exactly the same

- Prompt 5 UI in `Login.tsx`
- `signInWithApple()` public API (`Promise<AppleSignInResult>`)
- Nonce/state generation
- Supabase ID-token exchange
- Cancel/error detection logic
- `clientId` (`com.bonkistudio.bonkiapp`)
- `redirectURI` (handled by Supabase callback; not needed in the iOS init for the new plugin)

### Verification

1. `npx cap sync ios` runs cleanly with no `capacitor-swift-pm` version warnings.
2. Xcode → Product → Archive completes with no SwiftPM resolution errors.
3. On a physical device: tapping "Fortsätt med Apple" opens the native Apple sheet, completes sign-in, and lands the user authenticated via Supabase — same UX as Prompt 5.

### Rollback

Revert `package.json` and `src/lib/appleSignIn.ts` to previous versions. No other files touched.

