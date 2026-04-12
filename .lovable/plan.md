

## Fix: Activate auth-email-hook in production

### Problem
The `auth-email-hook` edge function exists and is deployed, but Supabase's auth system isn't routing emails through it. The default English templates are being used instead. This happens because the hook reconciliation hasn't completed on the Live environment.

### Solution (no code changes needed)

1. **Re-deploy `auth-email-hook`** using the deploy tool — this triggers the automatic reconciliation process that registers the function as the active email hook with Supabase Auth
2. **Re-publish the project** — the publish flow's OnPublish hook provisions the `process-email-queue` cron job and vault secret on the production Supabase instance (these are runtime operations that don't transfer via schema migrations)
3. **Verify** by checking edge function logs after a test signup to confirm the hook receives invocations

### Why this works
- Deploying the function triggers Lovable's internal reconcile flow that sets the function as the `send_email` hook in Supabase Auth config
- Publishing ensures the production cron job (`process-email-queue`) exists so enqueued emails are actually dispatched
- No dashboard toggle or manual hook configuration is needed — Lovable handles it automatically

