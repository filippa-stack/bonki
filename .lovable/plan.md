
Goal: make email login send the BONKI Swedish 6-digit code email instead of the default English login-link email.

What I found
- `src/pages/Login.tsx` still calls `supabase.auth.signInWithOtp({ email })` without the OTP-forcing option, so the app is still requesting the link-style flow.
- Your custom email templates are already correct: both `magic-link.tsx` and `signup.tsx` render the 6-digit token only.
- The `auth-email-hook` code is present, but the earlier logs show only boot/shutdown entries and no real email invocations, which means auth emails are not being routed through the custom hook in the active environment.
- This project uses separate Test and Live environments, so the published app can still send default emails even if the hook/templates exist in Test.

Plan
1. Fix the client auth request
- Update both email send paths in `src/pages/Login.tsx`:
  - initial send
  - resend
- Add the OTP code-flow option so login requests generate a code instead of a magic link.

2. Re-activate custom auth emails in the active environment
- Re-deploy the existing `auth-email-hook`.
- Verify the project’s custom auth-email handling is enabled for the active environment so auth events are routed through the hook instead of the platform default template.

3. Push the fix to Live
- Publish/update the project so:
  - the frontend OTP request change reaches the published app
  - the live environment uses the deployed auth email hook

4. Verify end-to-end
- Test from the actual URL you’re using.
- Confirm:
  - the hook receives real invocations
  - the received email is BONKI-branded / Swedish
  - it shows only the 6-digit code
  - there is no login link
  - OTP verification still signs the user in correctly

Technical details
- File to change: `src/pages/Login.tsx`
- No template rewrite is needed unless you want copy/styling adjustments later.
- Main root causes to fix:
  1. login flow still requests the wrong email mode
  2. custom auth-email routing is not active in the environment currently sending the emails

Success criteria
- Requesting email login sends a Swedish BONKI email
- Email contains only the 6-digit code
- No default English Lovable email appears
- `auth-email-hook` shows actual invocation logs during the test
