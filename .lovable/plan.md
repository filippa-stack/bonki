

## Add diagnostic logging to stripe-webhook

Add detailed error logging after the Stripe event verification fetch to diagnose why verification is failing (the logs show "Event verification failed").

### Changes

**File: `supabase/functions/stripe-webhook/index.ts`**

Replace the current verification block (around lines 33-38) with enhanced logging:

```typescript
console.log('Verify response status:', verifyRes.status, verifyRes.statusText);
if (!verifyRes.ok) {
  const errBody = await verifyRes.text();
  console.error("Event verification failed:", verifyRes.status, errBody);
  return new Response("Invalid event", { status: 400 });
}
```

Also add a log at the top to confirm the function is reading the secret key:

```typescript
console.log('STRIPE_SECRET_KEY present:', !!stripeKey, 'length:', stripeKey?.length);
console.log('STRIPE_WEBHOOK_SECRET present:', !!webhookSecret);
```

Then deploy the function and check logs after resending the Stripe event.

