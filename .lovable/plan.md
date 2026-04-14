

## Fix: Login page — replace OTP code input with magic link confirmation message

Three targeted changes in `src/pages/Login.tsx`:

1. **Replace OTP input section (lines ~243–280)** — Remove the `InputOTP` component, 6-digit code slots, and "Verifiera" button. Replace with the provided confirmation message UI (email sent notice, spam folder hint, resend button with "Skicka mejlet igen" label).

2. **Change email submit button text (line ~323)** — `'Skicka kod'` → `'Skicka inloggningslänk'`

3. **Keep unused imports/functions** — `handleVerifyOtp`, `verifying`, `otpCode`, `InputOTP` imports remain untouched to avoid cascading changes.

Single file edit: `src/pages/Login.tsx`

