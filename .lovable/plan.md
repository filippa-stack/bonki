

## Update Login Page — Dual auth with improved labels

**Single file**: `src/pages/Login.tsx`

The current page is Google-only (email flow was removed in the last edit). This restores the email option alongside Google.

### Changes

1. **Re-add email flow state and imports**
   - Add back: `email`, `showEmailForm`, `otpSent`, `otpCode`, `resendCooldown`, `cooldownRef`, `verifying` state variables
   - Import `Mail`, `ArrowLeft` from lucide-react
   - Import `InputOTP`, `InputOTPGroup`, `InputOTPSlot` from `@/components/ui/input-otp`
   - Import `supabase` from `@/integrations/supabase/client` for `signInWithOtp` / `verifyOtp`

2. **Re-add email handlers**
   - `handleEmailSignIn`: calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`
   - `handleVerifyOtp`: calls `supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' })`
   - `handleResend` with cooldown timer
   - `startCooldown` helper

3. **Button layout** (inside the `flex flex-col gap-3`)
   - Google button stays at top with `ORANGE_GRADIENT` — label: **"Fortsätt med Google"** (already correct)
   - Helper text below Google button stays (already present)
   - Add email button below helper text: **"Fortsätt med e-post"** — secondary glassmorphic style with `Mail` icon

4. **OTP view** — When `otpSent` is true, show the 6-digit OTP input with resend button (same as the previous implementation)

5. **No other changes** — Terms consent, demo mode, brand layout, error display all stay as-is

### Technical detail
- The email flow uses `supabase.auth.signInWithOtp` directly (not through `lovable.auth`), same as the previous working implementation
- Google continues through `lovable.auth.signInWithOAuth`
- Both paths check terms consent before proceeding

