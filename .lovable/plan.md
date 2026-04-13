

## Update Login Page — Google-only auth

**Single file change**: `src/pages/Login.tsx`

### Changes

1. **Remove email flow state and handlers** — Delete `showEmailForm`, `email`, `otpSent`, `otpCode`, `resendCooldown`, `cooldownRef`, `verifying`, `startCooldown`, `handleEmailSignIn`, `handleVerifyOtp`, `handleResend`, and related imports (`InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `Mail`, `ArrowLeft`).

2. **Simplify the button area** — Remove the `AnimatePresence` with three branches (otp/email/main). Replace with a single Google sign-in button styled with the existing `ORANGE_GRADIENT` and `ORANGE_SHADOW`.

3. **Update button label** — Change to "Fortsätt med Google".

4. **Add helper text** — Below the Google button: "Fungerar med alla e-postadresser — inte bara Gmail." with the specified muted style.

5. **Keep intact** — Terms consent, demo mode button, error display, brand layout, `handleGoogleSignIn`, `saveConsent`, `checkTerms`.

