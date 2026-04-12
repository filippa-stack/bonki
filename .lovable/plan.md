

## Fix: Provision email infrastructure and re-activate auth email routing

### Root cause
The domain `notify.bonkiapp.com` is verified, but the email sending infrastructure was never fully provisioned. The `process-email-queue` cron job, pgmq queues, and supporting database tables are missing. Without these, emails get enqueued but never sent -- or more likely, the system never completed setup and the "refreshing" status is stuck.

### Plan

1. **Run email infrastructure setup**
   - Call the infrastructure setup tool to create all required database objects: pgmq queues (`auth_emails`, `transactional_emails`), RPC wrappers, `email_send_log`, `email_send_state`, `suppressed_emails`, `email_unsubscribe_tokens` tables, and the `process-email-queue` cron job
   - This should unblock the "refreshing" status

2. **Re-scaffold auth email templates**
   - Call scaffold with `confirm_overwrite: true` to force the platform to re-register the auth-email-hook with the proxy layer
   - This ensures the hook uses the queue-based pattern (enqueue_email RPC) not the old direct-send pattern

3. **Restore custom Swedish BONKI templates**
   - The scaffold overwrites templates with defaults -- restore all 6 templates with Swedish copy, 6-digit OTP codes (no links), and BONKI branding (Midnight Ink #1A1A2E, Bonki Orange #E85D2C)

4. **Deploy edge functions**
   - Deploy `auth-email-hook` so the proxy has a valid, updated target

5. **Publish the project**
   - Publishing provisions the cron job and vault secret on the Live/production instance (the setup tool only targets the dev instance)
   - This is critical -- without publishing, the production cron job won't exist

6. **Verify**
   - Check that the "refreshing" status clears
   - Trigger a login from the published app
   - Confirm `auth-email-hook` logs show real auth events
   - Confirm the received email is BONKI-branded, Swedish, 6-digit code only

### Why this should work
Previous attempts only redeployed the edge function. They never ran the infrastructure setup, which creates the queue system the hook depends on. The "refreshing" status is almost certainly waiting for this infrastructure to exist.

### Technical details
- `setup_email_infra` creates pgmq extension, queues, SECURITY DEFINER RPC wrappers, vault secrets, and pg_cron scheduling
- The `process-email-queue` edge function is deployed as part of infra setup and runs every 5 seconds via pg_cron
- Auth emails use the `auth_emails` priority queue with 15-minute TTL
- After dev setup, a publish is required to provision the same infrastructure on the production Supabase instance

