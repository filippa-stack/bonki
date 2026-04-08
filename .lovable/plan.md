

## Redeploy stripe-webhook edge function

Redeploy the `stripe-webhook` edge function so it picks up the latest secret values from your project secrets store. No code changes needed — just a fresh deployment.

### What happens
- The edge function is redeployed with the same code
- On next invocation it will read the current values of `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`

### File touched
None — deployment only.

