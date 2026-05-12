# Fix Google Sign-In on Android

Two minimal edits, no other files touched.

## Change 1 — `capacitor.config.ts`

Add a `plugins.SocialLogin.google` block so the native Android layer reads `webClientId` at startup (not only via the runtime JS `initialize()` call).

Before:
```ts
const config: CapacitorConfig = {
  appId: 'com.bonkistudio.bonkiapp',
  appName: 'BONKI',
  webDir: 'dist',
  server: {},
};
```

After:
```ts
const config: CapacitorConfig = {
  appId: 'com.bonkistudio.bonkiapp',
  appName: 'BONKI',
  webDir: 'dist',
  server: {},
  plugins: {
    SocialLogin: {
      google: {
        webClientId: '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com',
        mode: 'online'
      }
    }
  }
};
```

## Change 2 — `src/lib/googleSignIn.ts`

In `ensureGoogleInitialized()`, change `mode: 'offline'` → `mode: 'online'`. Keep `GOOGLE_WEB_CLIENT_ID` and everything else identical.

## Out of scope

No changes to auth flows, Apple sign-in, the client ID value, or any other file.
