# Enable Google Sign-In on iOS (native)

Scope is intentionally narrow: two files, no new logic, no auth/cloud changes. The Capgo SocialLogin plugin is given the iOS credentials it needs to initialize, and the Android-only gate on the Google button in `Login.tsx` is broadened to all native platforms.

## Defensive precheck (do this before any edits)

1. Confirm `capacitor.config.ts` already contains a `plugins.SocialLogin.google` block with `webClientId` set to `629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com` (added in Handover 29 / Lovable Prompt 4). If this block is missing, stop and report — this prompt is shaped around extending it, not creating it.

2. Read `src/lib/googleSignIn.ts` end-to-end. The platform gate at line 66 is `if (!Capacitor.isNativePlatform())`, which already accepts both iOS and Android. If you find **any** other iOS-blocking check anywhere in this file (e.g. `Capacitor.getPlatform() !== 'android'`, `isAndroid` flags, conditional imports, `ensureGoogleInitialized` internals), stop and report. Do not silently "fix" or remove them — flag them so we can decide together. The audit says they don't exist, but the audit may have missed something.

## Changes

### 1. `capacitor.config.ts`

Extend the existing `SocialLogin.google` block. Android keys stay unchanged.

**FROM:**
```ts
SocialLogin: {
  google: {
    webClientId: '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com',
    mode: 'online',
  },
},
```

**TO:**
```ts
SocialLogin: {
  google: {
    webClientId: '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com',
    iOSClientId: '629196806647-960ga3kinh5v280ft77rpn04artkeqnc.apps.googleusercontent.com',
    // iOSServerClientId MUST equal webClientId — this is the audience Supabase
    // verifies against when signInWithIdToken is called on iOS. Without it,
    // sign-ins succeed at Google but fail at Supabase verify (aud mismatch).
    // Do not "simplify" away.
    iOSServerClientId: '629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com',
    mode: 'online',
  },
},
```

Note: The new iOS Client ID is `629196806647-960ga3kinh5v280ft77rpn04artkeqnc...` — same Google Cloud project as the Web Client (same `629196806647` prefix).

### 2. `src/lib/googleSignIn.ts`

**No change.** Audit confirms the platform gate at line 66 already accepts both iOS and Android, and the init/login/`signInWithIdToken` sequence is platform-agnostic. Return shape unchanged.

(The Handover-26 Android gating lives in `Login.tsx`, not here.)

If the precheck above turns up any iOS-blocking checks anywhere in this file, stop and report instead of editing.

### 3. `src/pages/Login.tsx`

Today (per Handover 26 §5.2): Apple button is gated to iOS, Google button is gated to Android via `Capacitor.getPlatform() === 'android'`. Change: broaden the Google button's gate to `isNative` so it renders on both iOS and Android.

**FROM (the Google native button block, near line 805):**
```tsx
{isNative && Capacitor.getPlatform() === 'android' && (
  <button onClick={handleNativeGoogleSignIn} ...>
    ...Fortsätt med Google
  </button>
)}
```

**TO:**
```tsx
{isNative && (
  <button onClick={handleNativeGoogleSignIn} ...>
    ...Fortsätt med Google
  </button>
)}
```

`handleNativeGoogleSignIn` (lines 171–194) and all its state are reused verbatim. No new state, no new handler, no new imports.

### Apple-first button order on iOS (load-bearing)

On iOS, the Apple button MUST render visually above the Google button. Apple Sign-In is the platform-expected primary option on iOS (Apple App Store Guideline 4.8 expects Apple Sign-In to be at least as prominent as other social logins).

The Apple block (gated to iOS, near line 779) already comes before the Google block in source order — keep it that way. Do not reorder. After applying, describe the final iOS button order in your response so I can verify before publishing.

## Explicitly out of scope (untouched)

- `AuthContext.tsx`, RevenueCat init, `initRevenueCat` coupling
- Apple Sign-In path (`handleNativeAppleSignIn`, `appleSignIn.ts`)
- Lovable Cloud / Supabase Google provider settings
- Web reviewer block (`?review=1`)
- `link-purchases` / Hämta webbköp flow
- Protected patterns from project memory: `suppressUntilRef`, `prevServerStepRef`, `clearTimeout(pendingSave.current)`, `hasSyncedRef`, resume logic, `AnimatePresence mode="sync"`, no `key={location.pathname}` on Routes, no `100dvh`

## Verification after applying

In the implementation response, confirm:

1. TypeScript build is clean (no new errors).
2. Apple button renders **above** Google button on iOS Login screen. Describe the final iOS Login screen vertical order of buttons.
3. Android Login screen is unchanged (Google button still appears, no Apple).
4. `googleSignIn.ts` was not modified (or, if it had to be modified, explain why).
5. `capacitor.config.ts` shows the new `iOSClientId` and `iOSServerClientId` under `plugins.SocialLogin.google`.

After verification, the user will Publish to Live and pull on Göran's Mac for the native iOS build (Info.plist URL scheme registration with the reversed Client ID happens on the native side, not here).
