

## Redeploy stripe-webhook edge function

Force a fresh deployment of the `stripe-webhook` edge function so it reads the latest secret values. No code changes — deployment only.

### Steps
1. Deploy `stripe-webhook` using the edge function deployment tool
2. After deployment, resend the Stripe test event and check logs for the diagnostic output

### Files changed
None.

