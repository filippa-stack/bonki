

## Fix: Clear "no default email domain" error

The domain `notify.bonkiapp.com` is verified and the workspace has it assigned to this project, but the UI shows "no default email domain configured" — a stale state from the previous stuck provisioning.

### Steps

1. **Run `setup_email_infra`** — Idempotent re-provisioning that re-links the domain to the project and refreshes all queue infrastructure.

2. **Re-scaffold auth email templates** (`confirm_overwrite: true`) — Forces the platform to reconcile the auth-email-hook registration, which triggers the domain linkage refresh.

3. **Redeploy edge functions** — Deploy `auth-email-hook` and `process-email-queue`.

4. **Verify** — Check that the domain status clears and the "no default email domain" error disappears.

No project code changes. Branded Swedish templates will be re-applied immediately after scaffold overwrites them.

