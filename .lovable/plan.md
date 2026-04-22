

## Login page — lift from 7/10 to 10/10

Tighten the hierarchy so the page reads as one calm gesture: brand → promise → one CTA → quiet alternative → invisible consent. Cut filler. Make spacing robust across viewports.

### Changes — `src/pages/Login.tsx` only

**1. Replace the consent checkbox with inline fine-print under the CTAs.**
- Remove the `TermsConsent` checkbox block, the `termsAccepted` / `termsError` state, the shake animation, and the `checkTerms()` gate.
- Below the email button, render one line: "Genom att fortsätta godkänner du våra [Villkor] och [Integritetspolicy]." Both links open the same dialogs `TermsConsent` already provides — extract those dialogs into a small inline component or reuse `TermsConsent` in a "links-only" mode.
- `saveConsent()` still fires on Google/email tap (implicit consent on action, timestamped — same legal posture Apple/Linear use).
- Result: no punishment state, no red errors, no shake. The page never tells the user they did something wrong.

**2. Cut the dead footer line.**
- Delete "Logga in för att använda dina produkter." It adds nothing.

**3. Collapse the three-voice header to two voices.**
- Keep: wordmark image + "Verktyg för samtalen som vill bli av" (the product promise).
- Drop: "På riktigt." — it's brand mood that competes with the promise. The wordmark already carries the brand.
- Rebalance spacing: 12px between wordmark and promise instead of the current 4px italic + 12px stack.

**4. Move the Gmail reassurance, or cut it.**
- Recommendation: cut. In 2026 it's noise. If kept, move it to sit *directly under* the email button as a 12px caption, not between the two CTAs.

**5. Fix vertical rhythm — robust across viewports.**
- Replace `paddingTop: 28vh` + `marginTop: -80px` with a flex column: `justify-center`, `min-h-screen`, `safe-area-inset` padding top/bottom, max content width 320px. Logo sits naturally in the upper-middle on every device, CTAs in the lower-middle, fine print at the bottom.

**6. Strip dead motion code.**
- Remove all `motion.div` / `motion.img` wrappers that have `initial={false}` and animate to their current state. Keep `AnimatePresence` only for the email-form / OTP-form swap (that one earns its weight).
- Drop the `motion` and `AnimatePresence` imports if no longer used.

**7. Add focus-visible rings to inputs.**
- Email + OTP inputs get a 2px `LANTERN_GLOW` ring on `:focus-visible`. Matches the brand and meets accessibility standards.

**8. Demo button — match the rhythm.**
- If shown, use the same solid-faint background as the email button (not dashed). Keep the lower opacity to signal secondary status.

### Untouched
- `TermsConsent.tsx` dialog content (reused for the inline links).
- `handleGoogleSignIn`, `handleEmailSignIn`, `handleVerifyOtp`, `handleResend` logic.
- OTP screen layout (already strong — back arrow, masked email, resend cooldown).
- Brand assets, color tokens, copy in Swedish.

### Result
Login page reads as one calm vertical gesture. Brand at top, promise underneath, one orange CTA, one quiet alternative, fine-print consent, done. No checkbox to forget, no error state to trigger, no filler line to skip. Robust on iPhone SE through iPad. That's the 10/10 version.

