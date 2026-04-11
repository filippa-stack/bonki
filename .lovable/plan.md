

## Switch Login from Magic Link to OTP Code

### Problem
On iOS PWA, magic links open in Safari (not the standalone PWA), creating the session in the wrong context. The custom Swedish email template isn't even being invoked in Live — users get the default English template.

### Solution
Replace the magic link flow with a 6-digit OTP code the user types directly in the app.

### Changes

**1. Enable project emails** (prerequisite)
- Call `toggle_project_emails(enabled: true)` so the auth-email-hook is invoked in Live
- Deploy `auth-email-hook` to ensure it's active

**2. Login page (`src/pages/Login.tsx`)**
- After `signInWithOtp` succeeds, show a 6-digit code input (using existing `InputOTP` component) instead of the "check your email" confirmation
- On submit, call `supabase.auth.verifyOtp({ email, token, type: 'email' })`
- Add a "Skicka igen" resend button with 60s cooldown timer
- Remove `emailRedirectTo` from the `signInWithOtp` options (not needed for code flow)

**3. Magic link email template (`supabase/functions/_shared/email-templates/magic-link.tsx`)**
- Accept `token` prop instead of `confirmationUrl`
- Replace the clickable `<Button>` with a large, prominent 6-digit code display (styled `<Text>` with letter-spacing)
- Update copy: "Ange koden nedan i appen" instead of "Klicka på knappen"
- Remove the `confirmationUrl` prop entirely so there's nothing to tap

**4. Auth email hook (`supabase/functions/auth-email-hook/index.ts`)**
- Change `EMAIL_SUBJECTS.magiclink` from `'Din inloggningslänk'` to `'Din inloggningskod'`
- `templateProps.token` is already passed from `payload.data.token` — no change needed there
- Update `SAMPLE_DATA.magiclink` to include `token: '123456'` for preview

**5. Translations (`src/i18n/sv.json`)**
- `send_magic_link` → `"Skicka kod"`
- `magic_link_sent_title` → `"Ange koden"`
- `magic_link_sent_hint` → `"Vi har skickat en 6-siffrig kod till din e-post."`
- Add: `otp_submit: "Verifiera"`, `otp_resend: "Skicka igen"`, `otp_invalid: "Fel kod, försök igen"`

### What stays the same
- Google OAuth (works fine already)
- Terms consent, demo mode, auth context
- All other email templates (signup, recovery, etc.)

