# Enable Stripe promotion codes at checkout

## What's needed

Right now `supabase/functions/create-checkout/index.ts` builds the Stripe Checkout Session without enabling promotion codes. By default Stripe hides the "Add promotion code" field — even if a valid code exists in your Stripe dashboard, customers can't enter it.

One change makes the field appear: add `allow_promotion_codes=true` to the session create call.

## Stripe-side prerequisites (already done in your case, just to confirm)

- A **Coupon** exists in Stripe (the underlying discount).
- A **Promotion code** is attached to that coupon (the customer-facing string, e.g. `LOYAL20`) and is **active**.
- Coupon applies to one-time payments (your checkout uses `mode: "payment"`).

## Change

In `supabase/functions/create-checkout/index.ts`, add one field to the URL-encoded body sent to Stripe:

```
allow_promotion_codes: "true"
```

That's it. No frontend, database, or webhook changes. The webhook already records the actual amount paid via `user_product_access`, so a discounted purchase still grants access correctly.

## After the change

- Stripe Checkout shows an "Add promotion code" link under the line item.
- Customer types `LOYAL20`, sees the discount applied, and pays the reduced amount.
- Webhook fires as normal; access is granted as normal.

## Test plan

1. Deploy the updated edge function (auto-deploys on save).
2. In Stripe **test mode**, ensure a test coupon + promotion code exists.
3. Trigger a checkout from the app, click "Add promotion code", enter the code, verify the discount appears, complete payment with a test card.
4. Confirm the user receives product access in the app.
5. Repeat the same verification once in **live mode** with the real coupon.

## Notes

- `allow_promotion_codes` only works when no `discounts[]` is passed in the session — which is your case, so no conflict.
- If you ever want to auto-apply a code via a link instead of the customer typing it, that's a separate, larger change (frontend reads `?promo=` → backend looks up the promotion code ID → passes `discounts[0][promotion_code]`). Not needed for this promotion.
