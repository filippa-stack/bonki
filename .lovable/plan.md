# Add temporary diagnostic logs to googleSignIn.ts

Add two `console.log` lines inside `attemptGoogleSignIn()` in `src/lib/googleSignIn.ts`, immediately after `SocialLogin.login(...)` returns and before the existing `signInWithIdToken` call.

## Change

In `src/lib/googleSignIn.ts`, after the `const loginResult = await SocialLogin.login({...})` block and before extracting `idToken`, insert:

```ts
console.log('[GoogleSignIn DEBUG] idToken:', (loginResult as any)?.result?.idToken?.substring(0, 100));
console.log('[GoogleSignIn DEBUG] result keys:', Object.keys((loginResult as any)?.result || {}));
```

## Scope

- Only `src/lib/googleSignIn.ts` modified.
- Temporary — to be reverted after diagnosis.
- No other logic changes.
