
## Live onboarding alignment — pages 1 & 2 only

The "live onboarding" the user describes is already split across two existing surfaces:

- **Page 1** → `src/components/PreAuthIntroSlide1.tsx` (rendered by `Login.tsx` on first visit, gated by `bonki-preauth-seen`)
- **Page 2** → web redesign branch inside `src/pages/Login.tsx` (lines 326–615)
- **Page 3** → not in live flow; remains in `OnboardingMock.tsx` only

The native iOS/Android legacy Login JSX (lines 619+) is out of scope and stays byte-for-byte unchanged.

---

### Page 1 — `PreAuthIntroSlide1.tsx`

Tighten to match the mock:

1. **Headline size**: `fontSize` 26 → **22**, keep italic Cormorant Garamond, keep `lineHeight: 1.4` (currently 1.1 — bump for breathing). `maxWidth` 320 → **280** so the line breaks naturally on Swedish.
2. **Pagination**: replace the two-segment bar with **three round dots** (6×6, gap 6). First dot in `BONKI_ORANGE`, others at `rgba(253,246,227,0.20)`. Keep above the CTA in the bottom cluster.
3. Wordmark, background, CTA pill, and safe-area padding are already correct — no other changes.

### Page 2 — `Login.tsx` (web redesign branch, `!skipRedesign && !showSlide1`)

1. **Remove price rows entirely**: delete the hairline divider at line 399, the pricing wrapper at lines 402–411, and the `PricingRow` component definition + its usages. Also remove the `prices`, `pricesReady` state, the Supabase `products` fetch in `useEffect` (lines 94–123), and `FALLBACK_PRICE_COUPLE` / `FALLBACK_PRICE_KIDS` constants. Trim `PricingRow` import/definition wherever it lives in the file.
2. **Trust block typography** (lines 364–396):
   - Credentials line: switch from italic → **regular serif**, 13px, `LANTERN_GLOW` at 0.65 opacity (currently 0.75 italic).
   - Pace line ("Ni bestämmer takten."): keep italic serif, bump to 14px, opacity 0.65.
3. **Two hairline rules** around the trust block:
   - 1px hairline above the credentials line, color `color-mix(in srgb, ${WARM_GOLD} 35%, transparent)`, ~60% width centered.
   - Same hairline below "Ni bestämmer takten." (replaces the existing single rule that was above pricing).
4. **Three-dot pagination**: add the same 3-dot indicator as page 1 directly above the Google CTA, with the **middle dot** active in `BONKI_ORANGE`.
5. **Hand-drawn mark verification**: spec asks for "small bottle/figure mark" SVG. Search `src/assets/` for an Emma hand-drawn SVG. If none exists, **keep the current `bonkiLogo` (38px PNG)** as a placeholder and flag in the response that the SVG asset needs to be supplied — do NOT block the implementation.
6. CTA labels, Google handler, e-post link, `TermsConsent` legal microcopy — all already correct, no logic changes.

### Out of scope / unchanged

- `OnboardingMock.tsx` and its three-screen sandbox at `/onboarding-mock` — untouched.
- All authentication logic (`handleGoogleSignIn`, `signInWithOAuth`, OTP flow) — untouched.
- Native legacy Login branch — untouched.
- Post-auth routing — untouched.
- Page 3 / free-session backend — explicitly deferred to a later release.

### Files affected

- `src/components/PreAuthIntroSlide1.tsx` — typography + dot pagination
- `src/pages/Login.tsx` — remove pricing block & related state/effect, retune trust block, add hairlines + dot pagination

### Verification checklist

- Fresh browser (no `bonki-preauth-seen`): page 1 renders single italic 22px sentence; three dots, first active; orange Fortsätt advances.
- Page 2 shows logo, two-line italic promise, hairline → credentials (non-italic) → "Ni bestämmer takten." (italic) → hairline → three dots (middle active) → orange "Fortsätt med Google" → "Logga in med e-post" → legal microcopy.
- No `249 kr` / `195 kr` rows anywhere on page 2.
- Network: no `products` query fired on Login mount.
- Google OAuth still works end-to-end and lands at the existing post-auth destination.
