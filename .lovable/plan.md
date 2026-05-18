## Change
Edit `src/lib/googleSignIn.ts` lines 13–35:

1. Update JSDoc on `GOOGLE_WEB_CLIENT_ID` ("Web Client IDs are not secret" → "Client IDs are not secret").
2. Add new constant `GOOGLE_IOS_CLIENT_ID = '629196806647-960ga3kinh5v280ft77rpn04artkeqnc.apps.googleusercontent.com'` with full JSDoc explaining iOS-specific plugin requirement.
3. In `ensureGoogleInitialized`, pass `iOSClientId: GOOGLE_IOS_CLIENT_ID` and `iOSServerClientId: GOOGLE_WEB_CLIENT_ID` to the `google` block of `SocialLogin.initialize`.

No other files touched. Android behavior unchanged (extra fields ignored natively). No JS platform branching.

## Verification
- Build clean.
- `initialize` call contains exactly `webClientId`, `iOSClientId`, `iOSServerClientId`, `mode`.
