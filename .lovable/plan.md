

## Fix: Unstick email setup by re-running infrastructure provisioning

The domain `notify.bonkiapp.com` is verified, but the setup process is hung. The fix is to re-provision the email infrastructure, which should clear the stuck state.

### Steps

1. **Run `setup_email_infra`** — This is idempotent and safe to re-run. It will re-create or verify the pgmq queues, RPC wrappers, cron job, and vault secret.

2. **Re-scaffold auth email templates** — Call `scaffold_auth_email_templates` to ensure the auth-email-hook is using the queue-based pattern and is properly registered.

3. **Redeploy edge functions** — Deploy `auth-email-hook` and `process-email-queue` to ensure the latest code is live.

4. **Verify** — Check that `process-email-queue` logs start appearing (indicating the cron job is running) and confirm the setup status clears.

No code changes to the project. This is purely infrastructure re-provisioning.

