# Pre-auth onboarding: copy + layout redesign (visual only)

Re-issuing the previously-approved plan with the two confirmed modifications baked in. Approve this to switch to build mode so I can apply the edits.

## Scope confirmation

All changes are **visual + copy only**. Untouched:

- All auth handlers (`handleGoogleSignIn`, `handleAppleSignIn`, `handleEmailSignIn`, `handleVerifyOtp`, `handleResend`, `handleNativeAppleSignIn`, `handleNativeGoogleSignIn`, `handleReviewerSignIn`)
- All Supabase / `lovable.auth` calls, OAuth, OTP, magic-link logic
- `AuthContext`, route protection, session handling, `supabase/functions/**`
- All button `onClick`, `disabled`, state-machine wiring, validation, loading/error states, i18n keys
- The legacy/native/reviewer JSX branch in `Login.tsx` (`skipRedesign === true`, lines ~656–end) — preserves App Store / Play / `?review=1` flows byte-for-byte
- `src/lib/googleSignIn.ts`, `src/lib/appleSignIn.ts`, `src/contexts/AuthContext.tsx`, `src/integrations/**`
- `Onboarding.tsx` (audience-picker, post-auth — out of scope)
- `mem://` files

## Files to change (3)

1. `index.html` — append `Cormorant Garamond` cuts to the existing Google Fonts `<link>`.
2. `src/components/PreAuthIntroSlide1.tsx` — replace the `<h1>` copy and font.
3. `src/pages/Login.tsx` — restructure only the `!skipRedesign` web redesign render branch (lines ~360–654). Hooks, handlers, sub-flows (`showEmailForm`, `otpSent`), and the legacy branch stay byte-identical.

## Screen 1 — `PreAuthIntroSlide1.tsx`

Replace headline:

- Copy: `Samtalet som dagen inte gav plats för.`
- Font: `'Cormorant Garamond', Georgia, serif`, italic, 22px, weight 400
- Color: `#FDF6E3` 100%, line-height 1.1, centered, `max-width: 320px`
- Vertically centered between top wordmark cluster and bottom CTA cluster (existing `flex: 1` container handles this)

Everything else on Screen 1 unchanged (bar indicator, "Fortsätt" pill, BONKI wordmark at bottom, `#0B1026` bg, safe-area paddings, `translateZ(0)`).

## Screen 2 — `Login.tsx` web redesign branch

BONKI wordmark image **removed** from this screen. Logomark scaled to 40% (96 → ~38px). **Only one hairline rule** remains, between the pacing line and the price model.

```text
[ safe-area-inset-top ]
  ↓ 48px
[ Logomark, 38×38, centered ]
  ↓ 32px
[ Manifesto — Cormorant Garamond italic 22px, #FDF6E3, line-height 1.2, centered ]
   "De små samtalen är de som bär. De som faktiskt blir av."
  ↓ 24px
[ Credential — Cormorant Garamond italic 13px, #FDF6E3 @ 75%, max-width 280px, line-height 1.4 ]
   "Utvecklat av leg. psykolog och psykoterapeut med 29 års klinisk erfarenhet."
  ↓ 12px
[ Pacing — Cormorant Garamond italic 13px, #FDF6E3 @ 75%, max-width 280px ]
   "Ni bestämmer takten."
  ↓ 32px
[ Hairline rule — 1px, rgba(253,246,227,0.50), 60% width, centered ]   ← only one
  ↓ 24px
[ Price rows — DM Sans 14px, #FDF6E3 @ 85%, label left / price right, 16px between rows ]
   För dig och din partner ............ 249 kr
   För dig och ditt barn .............. 195 kr
  ↓ 32px
[ Primary CTA — orange pill, 44px tall, radius 22px, DM Sans 14px/500, #FDF6E3 ]
   Label: "Fortsätt med Google"  (existing onClick={handleGoogleSignIn})
  ↓ 16px
[ Login link — DM Sans 11px, #FDF6E3 @ 60%, centered ]
   Label: "Logga in med e-post"  (existing onClick={() => setShowEmailForm(true)})
  ↓ 24px + safe-area-inset-bottom
```

### Behavioral preservation

- Primary CTA reuses the existing Google button JSX node — same `onClick`, `disabled`, spinner. Only `style`/`className` change.
- Login link reuses the existing email-trigger button — same `onClick`. Only restyled to a small text link.
- Apple button hidden on this screen (per spec — Apple Sign-In not yet configured for Android web). The Apple handler still exists and is still used by the legacy iOS native branch.
- Demo button (`isDemoParam()`), `<TermsConsent>`, error display all stay mounted below the login link.
- `showEmailForm` and `otpSent` sub-flows render unchanged when active.
- `prices` / `pricesReady` fetch logic and `PricingRow` four-state render rule preserved verbatim — only the row's visual style updates (DM Sans 14px, 85% opacity, 16px gap).

### iPhone SE viewport check (375×667)

With only one hairline rule (saving ~66px vs. three):

`48 + 38 + 32 + ~50 manifesto + 24 + ~36 credential + 12 + ~18 pacing + 32 + 1 + 24 + ~70 price rows + 32 + 44 CTA + 16 + ~16 login link + 24 + safe-area`
≈ **517px** content + safe areas → fits well under 667px on iPhone SE with comfortable margin.

On taller devices the cluster centers vertically via the existing `flex: 1; justify-content: center` container.

## Typography setup (`index.html`)

Append `Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500` to the existing Google Fonts `<link>`. `--font-display` global stays as `'Cormorant'` — Cormorant Garamond is applied inline only on the four new editorial elements (Screen 1 headline + Screen 2 manifesto / credential / pacing).

## Post-implementation verification

1. Re-read modified files to confirm no handler signatures or state references changed.
2. Confirm `Capacitor.isNativePlatform()` and `?review=1` still route to untouched legacy JSX.
3. Confirm Google CTA still bound to `handleGoogleSignIn`, login link still bound to `setShowEmailForm(true)`.

After applying I'll report back so you can publish and verify on bonkiapp.com.
