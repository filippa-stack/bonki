
Goal: make Live auth emails actually use the existing BONKI templates and sender identity.

What I found
- The email template files in the codebase are already BONKI-branded in Swedish.
- The auth email hook code is also configured for Bonki:
  - `SITE_NAME = "bonki"`
  - sender domain = `notify.bonkiapp.com`
  - root domain = `bonkiapp.com`
- I found no remaining `"Couple's Compass"` references in the project files.
- Your sender domain `notify.bonkiapp.com` is verified.
- Most important clue: there are no logs for `auth-email-hook` in either test or live. Combined with your screenshot showing the generic English template, this strongly suggests Live is still sending the default auth email, not your custom BONKI hook/template pipeline.

Plan
1. Verify the Live auth email integration status
   - Check whether Live is actually wired to use the project’s custom auth email flow.
   - Confirm that custom project emails are enabled in Live, not just published in code.

2. Repair the Live auth email pipeline
   - Reconcile/re-activate the custom auth email hook for Live so auth events route through the BONKI templates instead of the default fallback.
   - If needed, redeploy the auth email hook again after reconciliation so Live definitely serves the latest version.

3. Validate with a real Live auth email
   - Trigger a fresh signup or password-reset email from Live.
   - Confirm all three are correct:
     - sender name shows BONKI
     - body uses BONKI styling/copy
     - subject/CTA content matches the BONKI templates

4. If Live still falls back to the default email
   - Check whether Live email setup completed fully during publish.
   - If the Live backend skipped its email provisioning step, re-publish/re-sync the Live email setup path and retest.

Why this is the right fix
- Your screenshot matches the platform’s default auth email, not the BONKI templates in the repo.
- Since the repo is already branded correctly, the problem is almost certainly Live configuration/routing, not template content.
- No hook logs is the biggest signal that the auth email hook is not being invoked in Live.

Technical details
- Relevant files already look correct:
  - `supabase/functions/auth-email-hook/index.ts`
  - `supabase/functions/_shared/email-templates/signup.tsx`
  - `supabase/functions/_shared/email-templates/recovery.tsx`
  - and the other auth template files
- Current hook branding in code:
  ```text
  SITE_NAME = bonki
  SENDER_DOMAIN = notify.bonkiapp.com
  FROM_DOMAIN = bonkiapp.com
  ```
- Diagnosis:
  ```text
  Live email received = default template
  Repo templates = BONKI
  Hook logs = none
  => Live auth emails are likely bypassing the custom hook
  ```

Expected outcome after implementation
- New Live auth emails come from BONKI instead of Couple's Compass.
- The email body is the BONKI-styled Swedish template already present in your project.
- Test and Live behavior match.
