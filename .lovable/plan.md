## Fix iOS Google Sign-In nonce mismatch (cached-token retry)

Refactor `src/lib/googleSignIn.ts` to retry once after clearing Google's iOS SDK cache when Supabase rejects an id_token with a nonce mismatch.

### Edit: `src/lib/googleSignIn.ts`

1. **Add helper `attemptGoogleSignIn()`** — one pass: fresh nonce → `SocialLogin.login({ provider: 'google', options: { nonce: hashedNonce } })` → `supabase.auth.signInWithIdToken(...)`. Returns `{ success, error?, nonceError? }`. Detects nonce mismatch by lowercasing `error.message` and checking for substring `"nonce"` plus one of `"id_token"`/`"id token"`/`"mismatch"`.

2. **Rewrite `signInWithGoogle()`** body (keeping the `!Capacitor.isNativePlatform()` guard and the outer `catch` block unchanged):
   - `await ensureGoogleInitialized()`
   - Call `attemptGoogleSignIn()`; return success if successful.
   - If failure and not a nonce error → return the error.
   - If nonce error → `await SocialLogin.logout({ provider: 'google' })` (wrapped in try/catch logging only), then call `attemptGoogleSignIn()` once more and return its result.

3. **Preserved unchanged**: `ensureGoogleInitialized` (incl. all three iOS fields), `randomString`, `sha256Hex`, `GoogleSignInResult`, web guard, and the outer catch (12501 / canceled / cancelled detection).

### Out of scope
`capacitor.config.ts`, `Login.tsx`, `appleSignIn.ts`, `AuthContext.tsx`, RevenueCat — untouched.

### Verification
- TS build clean.
- `signInWithGoogle` calls `SocialLogin.logout({ provider: 'google' })` on detected nonce mismatch and retries once.
- Outer catch cancellation detection unchanged.
- Only `src/lib/googleSignIn.ts` modified.
