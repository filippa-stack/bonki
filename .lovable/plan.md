

## Re-provision email infrastructure for updated domain

The domain `notify.bonkiapp.com` is verified. The auth-email-hook already uses the queue-based pattern with branded Swedish templates. The fix is to re-run infrastructure provisioning to unstick the setup.

### Steps

1. **Run `setup_email_infra`** — Idempotent re-provisioning of pgmq queues, RPC wrappers, cron job, and vault secret.

2. **Re-scaffold auth email templates** (with `confirm_overwrite: true`) — Ensures the hook is properly registered with the platform. Will immediately re-apply branded Swedish styling (Midnight Ink + Bonki Orange, Georgia serif, OTP tokens for signup/magic-link) to the freshly scaffolded templates.

3. **Redeploy edge functions** — Deploy both `auth-email-hook` and `process-email-queue`.

4. **Verify domain status** — Confirm setup clears the stuck state.

No project code changes beyond the template re-branding after scaffold overwrites them.

