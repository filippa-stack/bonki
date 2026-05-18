## Goal

Soften the native Google Sign-In button on the Login page to Google's official neutral styling (white background, dark text, colored "G"), so Apple's solid-black button visually dominates on iOS and satisfies App Store Guideline 4.8.

## Change (one block, one file)

**File:** `src/pages/Login.tsx`, lines **805–832** — the `{isNative && (...)}` Google button block.

- `className`: remove `border-0 text-white`; keep `w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50`.
- `style`: replace `background: ORANGE_GRADIENT` + `boxShadow: ORANGE_SHADOW` with:
  - `background: '#FFFFFF'`
  - `color: '#1F1F1F'`
  - `border: '1px solid #DADCE0'`
  - (no `boxShadow`)
- SVG: change the four `<path fill="#fff" .../>` to the official Google brand colors — `#4285F4`, `#34A853`, `#FBBC04`, `#EA4335` (in the existing path order). Add `aria-hidden="true"` on the `<svg>`.
- Keep label `Fortsätt med Google`, loading state, handler `handleNativeGoogleSignIn`, and the `{isNative && (...)}` gate exactly as today.

## Out of scope

- Apple button block (stays canonical black + white text + white logo).
- Web `!isNative` Google button (lines 835+).
- Email/OTP block, googleSignIn.ts, capacitor.config.ts, AuthContext.tsx, RevenueCat.
- Source order — Google still renders below Apple.

## Verification

1. TypeScript build clean.
2. iOS Login top-to-bottom: Apple (solid black) → Google (white with thin gray border, colored G) → email/OTP. Apple is clearly the heavier button.
3. Google button keeps `w-full h-14` (equal dimensions to Apple).
4. The G renders in Google's four brand colors, not white-on-white.
5. Android Login uses the same neutral white Google button (expected — gate is `isNative`).
