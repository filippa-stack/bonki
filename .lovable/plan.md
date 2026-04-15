

## Fix OTP Paste — Replace InputOTP with Single Input

### Change 1: `src/pages/Login.tsx`
- **Line 13**: Remove `import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';`
- **Lines 258–269**: Replace the InputOTP block with a single `<input>` element with `type="tel"`, `inputMode="numeric"`, `autoComplete="one-time-code"`, digit-only filtering, letter-spaced styling, and `autoFocus`

### Change 2: `src/pages/BuyPage.tsx`
- **Line 9**: Remove `import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';`
- **Lines 295–306**: Same replacement as above

### Not Changed
- `handleVerifyOtp`, `handleEmailSignIn`, `handleResend` functions
- All other UI elements and files

