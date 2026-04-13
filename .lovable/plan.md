

## Restore Swedish templates and deploy to trigger routing reconciliation

### What just happened (the important part)
I successfully ran three platform operations in sequence:
1. **Re-enabled project emails** via the platform toggle
2. **Re-ran email infrastructure setup** — re-provisioned the cron job, vault secret, and queue infrastructure on Live
3. **Re-scaffolded auth-email-hook** — this is the key step that triggers the platform to **re-register the routing binding** between the proxy and your custom hook

The scaffold overwrote your Swedish templates with English defaults. The hook structure itself is correct (it already uses `enqueue_email` for queue-based delivery).

### Plan

1. **Restore all 6 Swedish BONKI templates**
   - `signup.tsx`: Swedish copy, OTP token display, Bonki branding (Midnight Ink `#1A1A2E`, Bonki Orange `#E85D2C`)
   - `magic-link.tsx`: Swedish "Din inloggningskod" with 6-digit code display, no links
   - `recovery.tsx`: Swedish "Återställ ditt lösenord"
   - `invite.tsx`: Swedish "Du har blivit inbjuden"
   - `email-change.tsx`: Swedish "Bekräfta din e-poständring"
   - `reauthentication.tsx`: Swedish "Din verifieringskod" with token display
   - All templates: `lang="sv"`, Georgia font family, `#F5F0E8` code background

2. **Restore Swedish subjects in auth-email-hook/index.ts**
   - Change subjects back to Swedish ("Bekräfta din e-post", "Din inloggningskod", etc.)
   - Update SAMPLE_DATA to include `token` fields for signup/magiclink previews

3. **Deploy both edge functions**
   - `auth-email-hook` — the custom hook with Swedish templates
   - `process-email-queue` — the queue dispatcher (required by infra setup)

4. **Publish the project**
   - This triggers the OnPublish hook which finalizes the Live routing reconciliation
   - The combination of scaffold + deploy + publish is the full reconciliation sequence

5. **Test from published app**
   - Trigger a login on `bonki.lovable.app`
   - Check production logs for "Received auth event"
   - Check `email_send_log` for new rows

### Why this time might actually work
Previous attempts did scaffold + deploy but may not have completed the full sequence (infra setup + scaffold + deploy + publish) in one clean pass. This time all three platform operations ran successfully in sequence, and the publish will complete the reconciliation on the Live instance.

### Technical details
- The hook code is already correct — uses `enqueue_email` RPC, writes to `email_send_log`, handles all 6 template types
- Infrastructure is confirmed: pgmq queues, cron job, vault secret, RPC wrappers
- Domain `notify.bonkiapp.com` is verified and active
- Project emails are explicitly enabled

