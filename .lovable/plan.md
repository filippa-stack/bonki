

## Sign in with Apple — native iOS flow

Apple Guideline 4.8 requires Sign in with Apple as a peer option to Google on native iOS. Prompt 5 asks for the **native Capacitor** flow (ASAuthorization via `@capacitor-community/apple-sign-in` → `supabase.auth.signInWithIdToken`), which is the right choice for App Store submission: web OAuth popups inside a native app get rejected.

### Important: reconciling with the previous turn

The previous message already added a **web Apple OAuth button** via `lovable.auth.signInWithOAuth('apple')`. That flow is correct for the browser but **wrong on native iOS** (Apple requires the native sheet, not a web redirect). This plan keeps both, gated by platform:

- **Web browsers** (including mobile Safari on bonkiapp.com): the existing Lovable-managed Apple OAuth button stays as-is.
- **Native iOS (Capacitor)**: a new button using the native Apple plugin replaces the web one. The platform gate (`Capacitor.isNativePlatform()`) decides which renders — only one is ever visible.

This matches how RevenueCat vs Stripe are split in this codebase (native uses IAP, web uses Stripe Checkout).

### Supabase Auth config (manual, done by you before deploy)

In **Live** project `spgknasuinxmvyrlpztx` → Authentication → Providers → Apple:
- Services ID: `com.bonkistudio.bonkiapp.signin`
- Team ID: `459423SKW4`
- Key ID: `Y37T9LJYAL`
- Private key: paste `.p8` contents — Supabase generates the client secret JWT.
- **Additional allowed client IDs**: add `com.bonkistudio.bonkiapp` (the App Bundle ID — required because the native plugin sends the bundle ID as the audience, not the Services ID).
- Enable provider.

Repeat the same for **Test** project `wcienwozdurwhswaarjy` if you want to test the native flow against preview before publishing.

### Changes (3 total)

**1. Add dependency** — `@capacitor-community/apple-sign-in` to `package.json`. Lovable will install; `npx cap sync` happens locally after pull.

**2. Create `src/lib/appleSignIn.ts`**
- Exports `signInWithApple(): Promise<{ success: boolean; cancelled?: boolean; error?: string }>`.
- Web guard: `if (!Capacitor.isNativePlatform()) return { success: false, error: 'Not a native platform' }`.
- Generates random `state` and `nonce` (crypto.randomUUID or a short random helper). Stores original nonce locally so it can be passed to Supabase.
- Calls `SignInWithApple.authorize({ clientId: 'com.bonkistudio.bonkiapp', redirectURI: 'https://spgknasuinxmvyrlpztx.supabase.co/auth/v1/callback', scopes: 'email name', state, nonce })`.
  - `redirectURI` is required by the plugin's API but **not actually used** on native (Apple returns the identityToken directly to the app). We point it at Live's callback so the value is a valid registered return URL regardless.
- On response, extracts `identityToken` from `result.response`. If missing → returns `{ success: false, error: 'No identity token' }`.
- Calls `supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken, nonce })`. Supabase verifies the JWT against Apple's JWKS and the `nonce` claim; because we added `com.bonkistudio.bonkiapp` to "Additional allowed client IDs", the audience check passes.
- Error mapping: if the plugin throws with a code/message containing `1001` or `canceled` / `cancelled` → `{ success: false, cancelled: true }`; otherwise `{ success: false, error: message }`. Never throws.

**3. Update `src/pages/Login.tsx`**
- New imports: `Capacitor` from `@capacitor/core`, `signInWithApple` from `@/lib/appleSignIn`, `toast` from `sonner`.
- New local state: `const [appleLoading, setAppleLoading] = useState(false)`.
- New handler `handleNativeAppleSignIn`:
  - Early-return if `appleLoading`.
  - `setAppleLoading(true)`, call `saveConsent()` (same posture as Google/email), call `signInWithApple()`.
  - `cancelled` → silent reset (no toast, no error), remove pending consent.
  - `!success` → `toast.error('Kunde inte logga in med Apple. Försök igen.')`, remove pending consent.
  - `success` → do nothing; existing `AuthContext` `onAuthStateChange` listener handles the `SIGNED_IN` event and navigation (identical to how Google OAuth return is handled).
  - `finally` resets `appleLoading`.
- Render logic in the "main" motion.div (line 348), around the existing Apple button at lines 377–391:
  - **If `Capacitor.isNativePlatform()`**: render a **new black native Apple button** (Apple HIG: black background `#000`, white text, Apple glyph left-aligned, same 56px height / `rounded-xl` / full width as the Google button). Placed **above** the Google button (Apple requires Sign in with Apple at least as prominent; placing it first is the safest reading). While `appleLoading` → `<Loader2 className="animate-spin" /> Loggar in...`. Uses `handleNativeAppleSignIn`.
  - **If web**: render the existing Apple button (the one currently at 377–391 calling `handleAppleSignIn` → `lovable.auth.signInWithOAuth('apple')`), unchanged.
- The web Google button and the "Fortsätt med e-post" button stay exactly as they are.

Ordering in the main view on **native iOS**: Apple (black) → Google (orange) → e-post.
Ordering on **web**: Google (orange) → Apple (existing muted style) → e-post (unchanged).

### Not touching

- `CardView.tsx`, `useSessionReflections.ts`, `useNormalizedSessionState.ts`
- `--surface-base`
- `AuthContext.tsx` — `onAuthStateChange` already handles post-sign-in routing
- Existing OTP flow, existing Google handler
- `BuyPage.tsx`, paywalls, `revenueCat.ts`, webhook functions
- `capacitor.config.ts` — Bundle ID already matches
- Android: guideline 4.8 is iOS-only; native Android Apple Sign In is not in scope

### Verification

- **Web (bonkiapp.com and preview)**: Login page renders exactly as today. Apple button is the existing muted one, calling Lovable OAuth; Google and email unchanged.
- **Native iOS (post `npx cap sync` + TestFlight build)**: A black Apple button appears above Google. Tap → Apple's native ASAuthorization sheet. Complete → Supabase session lands via `signInWithIdToken` → `onAuthStateChange` fires `SIGNED_IN` → user enters app. Cancel → no toast, button re-enables. Supabase Auth → Users shows a new row with `provider: apple` and email.
- **Supabase logs**: Successful token exchange visible in auth logs on Live.

### Deferred

- Apple's "Hide my email" relay — works out-of-the-box with Supabase, no extra code.
- Android (guideline 4.8 is iOS-specific).
- Apple account deletion / revocation webhook — only required if Bonki later adds full Apple account deletion integration; current delete-account flow already works for Apple users because Supabase deletes the auth user.

