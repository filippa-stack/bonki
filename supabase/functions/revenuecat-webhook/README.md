# revenuecat-webhook

Processes RevenueCat webhook events for iOS In-App Purchases and writes
product access rows to `user_product_access`. Mirrors `stripe-webhook`
but for the Apple IAP path. The two webhooks coexist — Stripe handles
web, RevenueCat handles iOS.

## Required secret

| Name | Where to set | Notes |
|---|---|---|
| `REVENUECAT_WEBHOOK_SECRET` | Lovable → Cloud → Secrets | Generate any long random string in RevenueCat (Integrations → Webhooks → Authorization header). Paste the same value here. |

## Authorization

RevenueCat must send the secret in the `Authorization` header:

```
Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>
```

Any other value (or missing header) → `401 Unauthorized`.

## Webhook URL (paste into RevenueCat dashboard)

| Environment | URL |
|---|---|
| **Live (production — bonkiapp.com)** | `https://spgknasuinxmvyrlpztx.supabase.co/functions/v1/revenuecat-webhook` |
| Test (Lovable preview) | `https://wcienwozdurwhswaarjy.supabase.co/functions/v1/revenuecat-webhook` |

**Always use the Live URL for the production RevenueCat webhook.** If
RevenueCat points at Test, real Apple purchases will land in the wrong
database and customers won't get access.

## Event handling

| `event.type` | Behaviour |
|---|---|
| `INITIAL_PURCHASE` | Upsert `user_product_access` (idempotent) with `granted_via='revenuecat'`. |
| `NON_RENEWING_PURCHASE` | Same as `INITIAL_PURCHASE` (our products are non-consumables). |
| `REFUND` | Delete the matching `user_product_access` row. |
| `CANCELLATION` | Log only, return 200. Non-consumables don't truly cancel. |
| `EXPIRATION` | Log only, return 200. Not applicable to our products. |
| `TEST` | Return `200 { received: true, test: true }` for the dashboard "Send Test Event" button. |
| _anything else_ | Log and return 200. RevenueCat retries aggressively — never 500 on unknown types. |

## Product ID mapping

RevenueCat sends Apple's product id (e.g.
`com.bonkistudio.bonkiapp.still_us`). The function strips the
`com.bonkistudio.bonkiapp.` prefix to derive the Supabase `products.id`
(e.g. `still_us`), then validates the row exists before inserting.

If the prefix is missing, a warning is logged and the raw value is used
(it must still match a row in `products` or the request is rejected with
400).

| RevenueCat `product_id` | Supabase `products.id` |
|---|---|
| `com.bonkistudio.bonkiapp.jag_i_mig` | `jag_i_mig` |
| `com.bonkistudio.bonkiapp.jag_med_andra` | `jag_med_andra` |
| `com.bonkistudio.bonkiapp.jag_i_varlden` | `jag_i_varlden` |
| `com.bonkistudio.bonkiapp.vardagskort` | `vardagskort` |
| `com.bonkistudio.bonkiapp.syskonkort` | `syskonkort` |
| `com.bonkistudio.bonkiapp.sexualitetskort` | `sexualitetskort` |
| `com.bonkistudio.bonkiapp.still_us` | `still_us` |

## How to test

1. In RevenueCat dashboard → **Integrations → Webhooks**, add the URL
   above and the `Authorization: Bearer <secret>` header.
2. Click **Send Test Event**.
3. Expect `200` with body `{ "received": true, "test": true }`.
4. Check this function's logs — you should see `📥 Webhook received: TEST`.

## End-to-end

After a sandbox purchase from the iOS app:

1. Logs show `📥 Webhook received: INITIAL_PURCHASE` followed by
   `✅ Granted <product> to <user>`.
2. New row appears in `user_product_access` with
   `granted_via = 'revenuecat'`.
3. The app re-checks access on next product navigation and unlocks the
   product.
