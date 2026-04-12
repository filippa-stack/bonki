

## Update signup email template to show OTP code instead of link

### Problem
The `signup.tsx` email template renders a clickable "Bekräfta e-post" button with `confirmationUrl`. Since the app uses OTP-based auth (`signInWithOtp` + `verifyOtp`), new users receive both a 6-digit code (in the token field) and a clickable link, which is confusing. The magic-link template already correctly shows only the code.

### Change

**`supabase/functions/_shared/email-templates/signup.tsx`** — Replace the confirmation URL button with a token code display, matching the magic-link template style:

- Change the interface to accept `token: string` instead of `confirmationUrl: string`
- Remove the `Button` import and the `<Button>` element
- Add a prominent code display (`<Text style={code}>{token}</Text>`) like the magic-link template
- Update the copy from "klicka på knappen nedan" to "ange koden nedan i appen"
- Remove the `button` style constant, add a `code` style constant matching the magic-link template

**`supabase/functions/auth-email-hook/index.ts`** — No changes needed. The hook already passes `token: payload.data.token` to all templates.

After editing, redeploy the `auth-email-hook` edge function so the updated template takes effect.

### No other files affected
The magic-link, recovery, invite, email-change, and reauthentication templates are unaffected.

