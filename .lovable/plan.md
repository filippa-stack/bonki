
# Apply: Native Android Google Sign-In (4 changes)

Approved as-is. Labeling correction (Web Google = your credentials via Lovable broker; Web Apple = Lovable-managed; iOS Apple + Android Google = your credentials, native) baked into the memory file for future handover.

## Changes to apply

1. **NEW** `src/lib/googleSignIn.ts` — native Google handler mirroring `appleSignIn.ts` (Web Client ID `629196806647-m2r1g9m73n79bbbdvm7524fc5t48frmk.apps.googleusercontent.com`, raw + SHA-256 nonce, `signInWithIdToken`, cancellation handling for code 12501).

2. **MODIFIED** `src/pages/Login.tsx` — three surgical edits:
   - Add import + `googleLoading` state + `handleNativeGoogleSignIn` handler.
   - Delete native reviewer block (lines 671–765); simplify spacer `marginTop: isNative ? 16 : 40` → `marginTop: 40`.
   - Split native CTA: iOS shows Apple button (unchanged), Android shows new Google button. Web buttons + email button untouched.

3. **NEW** `mem://auth/native-google-android.md` — records implementation + credential ownership matrix.

4. **MODIFIED** `mem://index.md` — add reference line for the new memory.

## Untouched (verified)

`clearTimeout(pendingSave.current)`, `prevServerStepRef.current`, `AnimatePresence mode="wait"`, `--surface-base`, `suppressUntilRef`, `hasSyncedRef`. Files: `CardView.tsx`, `useNormalizedSessionState.ts`, `useSessionReflections.ts`, `SessionStepReflection.tsx`, `useCardTakeaway.ts`, `capacitor.config.ts`, `AuthContext.tsx`, `src/integrations/supabase/client.ts`, `src/integrations/lovable/index.ts`, `src/lib/appleSignIn.ts`. Web `handleGoogleSignIn` (line 183) and web `?review=1` reviewer block (lines 1012–1085) + `handleReviewerSignIn` kept intact.

## After apply

Lovable auto-deploys to the preview URL. The frontend changes also need a **Publish → Update** click in the Lovable editor to push to `bonkiapp.com`. I'll confirm preview deploy; you'll need to hit Publish for the Live cutover.
