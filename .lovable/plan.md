## Goal

Bring the new "Samtalet som dagen inte gav plats för" pre-auth intro slide to native iOS, while keeping the existing legacy login screen (BONKI wordmark + Apple/email buttons) exactly as it is today after the slide is dismissed.

The pricing redesign branch stays web-only — no in-app pricing on the iOS auth screen, so App Store guideline 3.1.1 posture is unchanged.

## Why the new flow wasn't on iOS

In `src/pages/Login.tsx`:

```ts
const skipRedesign = isNativePlatform; // true on iOS/Android native
...
if (!skipRedesign && showSlide1) return <PreAuthIntroSlide1 ... />;
if (!skipRedesign) return ( /* new web redesign */ );
// falls through to legacy JSX
```

`skipRedesign` short-circuits *both* the pre-auth slide *and* the redesigned login on native, so iOS sees only the legacy screen.

## Change

Decouple the two gates:

1. `PreAuthIntroSlide1` → shown on **all platforms** (native + web), once per device, gated by the existing `bonki-preauth-seen` localStorage key.
2. The redesigned web login (manifesto + pricing rows) → still web-only, controlled by `skipRedesign`.

After the user taps "Fortsätt" on the slide:
- **Native iOS/Android** → falls through to the existing legacy JSX (Apple Sign-In + email). Unchanged.
- **Web** → renders the redesigned login as before.

## Implementation (single file)

**`src/pages/Login.tsx`**, three edits:

1. Update the `showSlide1` initializer (lines 84–91) — remove the `if (skipRedesign) return false;` short-circuit so the slide check runs on native too.

2. Update `handleSlide1Continue` (lines 124–131) — always persist the `bonki-preauth-seen` flag, regardless of platform.

3. Update the render-branching comment + check (lines 315–321) — gate the slide on `showSlide1` alone, not `!skipRedesign && showSlide1`. The post-slide `if (!skipRedesign) return (...)` branch stays as-is, so native still falls through to the legacy JSX below.

The pricing-fetch `useEffect` keeps its `if (skipRedesign) return;` guard — native still pays zero network cost for prices it never shows.

No other files touched. `PreAuthIntroSlide1.tsx` already uses `100vh` with `calc()` and `translateZ(0)` per the iOS Safari/PWA stability rules in core memory, so it's structurally safe on native WebView.

## Verification

### What I can verify inside Lovable (before handing to Göran)

1. `rg "skipRedesign" src/pages/Login.tsx` — confirm `skipRedesign` is no longer referenced inside the slide gate. Should appear only in: the `isNativePlatform` derivation, the pricing `useEffect` guard, and the post-slide render branch.
2. `rg "PREAUTH_SEEN_KEY|bonki-preauth-seen" src` — confirm the key is read in the initializer and written in `handleSlide1Continue`, with no other writers that could prematurely set it.
3. `rg "isDemoParam|enterDemoMode" src/pages/Login.tsx` — confirm demo mode imports/usage are untouched.
4. Web preview at `/login` (incognito) — first load shows `PreAuthIntroSlide1`, "Fortsätt" advances to redesigned login, reload skips the slide.

### What only Göran can verify on the simulator (be explicit about this)

The two items you asked about cannot be checked from inside Lovable — they require the actual iOS WebView:

5. **localStorage persistence in iOS WebView** — Capacitor's WKWebView does support `localStorage` and persists it across app launches by default; it's stored in the app's sandboxed `Library/WebKit/WebsiteData` and survives unless the app is uninstalled or the user clears app storage. It is *not* wiped by Capacitor's bundled-resource caching (that only affects the JS/HTML/CSS bundle, not WebKit's storage layer). However, I cannot prove this for *this specific* Capacitor 8 + iOS 17 build from inside Lovable. Göran needs to:
   - Build and launch on the simulator → confirm slide appears.
   - Tap "Fortsätt" → confirm legacy login appears.
   - Kill the app from app-switcher and relaunch → confirm legacy login appears directly (slide does not reappear).
   - In Safari Web Inspector attached to the simulator: `localStorage.getItem('bonki-preauth-seen')` should return `"1"`.

6. **Slide renders correctly on iPhone 17 Pro simulator** — the slide uses `100vh + calc() + translateZ(0)`, which is the project's standard iOS-safe pattern (per core memory). It should render fine, but I cannot screenshot the iOS simulator from here. Göran needs to visually confirm:
   - Wordmark sits below the dynamic island, not under it.
   - "Samtalet som dagen inte gav plats för" is vertically centered without clipping.
   - Bar indicator + "Fortsätt" CTA sit above the home indicator, not behind it.
   - Tap target on "Fortsätt" works (no dead zone from a misaligned safe-area inset).

### Fallback if item 5 fails

If localStorage somehow does not persist in this build (extremely unlikely but possible if a Capacitor plugin or custom WebView config is interfering), the fix is to swap to `@capacitor/preferences` for native and keep `localStorage` for web. I'll only do that if Göran reports the slide reappearing on every launch — not pre-emptively.

## Out of scope

- No changes to `appleSignIn.ts`, `googleSignIn.ts`, `AuthContext.tsx`, or any edge function.
- No changes to the legacy native JSX itself.
- No changes to pricing display logic.
- `revoke-reviewer-access` edge function stays deployed as-is.