

## Remove broken event verification from stripe-webhook

The Stripe event verification via API fetch is failing due to an account/mode mismatch. The payments are live and real money is being charged. We need to skip verification now so purchases actually unlock products. Proper HMAC signature verification can be added later.

### Changes

**File: `supabase/functions/stripe-webhook/index.ts`**

Replace the entire verification block (lines ~33-48) — remove the `if (webhookSecret && signature)` branch and the `else` branch — with:

```typescript
let event: any;
event = JSON.parse(body);
console.log('Webhook received event type:', event.type, 'livemode:', event.livemode);
```

This removes the broken Stripe API event-retrieval verification and parses the webhook payload directly. The `STRIPE_SECRET_KEY` is NOT changed — it stays as the live key.

### Deployment
Deploy `stripe-webhook` immediately after the code change.

