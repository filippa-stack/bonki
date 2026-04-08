

## Add `customer_creation: 'always'` to Stripe Checkout

### What
Add a single parameter `customer_creation=always` to the Stripe checkout session creation in `create-checkout/index.ts`. This ensures Stripe creates a real customer record (with email) instead of a "Guest" entry.

### Change

**File: `supabase/functions/create-checkout/index.ts`** (line ~95 area, inside the `URLSearchParams`)

Add this entry to the existing params object:

```
"customer_creation": "always",
```

This goes alongside the existing `mode`, `line_items`, `success_url`, `cancel_url`, `metadata`, and `customer_email` params.

### Deployment
Deploy `create-checkout` edge function immediately after the code change.

