## Change

In `src/lib/googleSignIn.ts`, remove the `scopes: ['email', 'profile']` line from the options object passed to `SocialLogin.login()`. Keep `nonce`.

### Before
```ts
const loginResult = await SocialLogin.login({
  provider: 'google',
  options: {
    scopes: ['email', 'profile'],
    nonce: hashedNonce,
  },
});
```

### After
```ts
const loginResult = await SocialLogin.login({
  provider: 'google',
  options: {
    nonce: hashedNonce,
  },
});
```

## Why

The Capgo Android plugin throws "You CANNOT use scopes without modifying the main activity" whenever a `scopes` array is passed and `MainActivity` does not implement `ModifiedMainActivityForSocialLoginPlugin`. The plugin already adds `email`, `profile`, and `openid` by default, so removing the explicit array preserves the same scope set without triggering the error.

## Untouched

- `ensureGoogleInitialized()` and all init code
- Nonce generation and `sha256Hex`
- `supabase.auth.signInWithIdToken` call
- Error handling
- `capacitor.config.ts`
- All other files
