

## RevenueCat webhook for iOS purchase access grants — corrected

You're right, and the correction is important. Webhook URL pasted into the RevenueCat dashboard must point at **Live**, not Test. Stripe is already configured that way; RevenueCat must match.

### URL correction

| Environment | Supabase project ref | Webhook URL to use in RevenueCat dashboard |
|---|---|---|
| **Live (bonkiapp.com — real customers)** | `spgknasuinxmvyrlpztx` | `https://spgknasuinxmvyrlpztx.supabase.co/functions/v1/revenuecat-webhook` ✅ |
| Test (Lovable preview only) | `wcienwozdurwhswaarjy` | `https://wcienwozdurwhswaarjy.supabase.co/functions/v1/revenuecat-webhook` (only if testing against preview) |

The previous plan accidentally listed the Test URL as the canonical one. **Use the Live URL** in RevenueCat's production webhook config. If RevenueCat ever points at Test, real Apple purchases would land in the wrong database and customers on bonkiapp.com would never see access — the exact failure mode called out in the architecture doc, Section 7.

### Code is unchanged by this correction

The edge function reads `SUPABASE_URL` from env at runtime, and Lovable injects the correct project ref per environment at deploy time. So the same `index.ts` works in both Test and Live — only the dashboard URL differs.

### Secret confirmation: `REVENUECAT_WEBHOOK_SECRET` in both environments

When you add the secret via Lovable's `add_secret` tool, it's stored in the **Test** project's runtime secrets immediately. Per Lovable's environment model:

- **At Publish time**, secrets that exist in Test but not in Live are copied to Live automatically.
- Secrets that already exist in Live are **not** overwritten by publish.

So the practical sequence is:
1. I'll request `REVENUECAT_WEBHOOK_SECRET` via `add_secret` → it lands in Test.
2. When you click **Publish**, the secret syncs to Live the first time (since it doesn't exist there yet).
3. After publish, both Test (`wcienwozdurwhswaarjy`) and Live (`spgknasuinxmvyrlpztx`) projects can validate `Authorization: Bearer <secret>` against the same value.

If you ever need **different** secret values per environment (e.g., separate RevenueCat projects for sandbox vs production), set the Live value explicitly via Cloud View → Secrets → Live before publishing, and the publish step won't overwrite it. For this rollout, a single shared secret across both environments is the simpler path and matches how `STRIPE_WEBHOOK_SECRET` is currently configured.

### Deployment plan (unchanged otherwise)

Everything from the previous plan stands:

1. **Request secret** — `REVENUECAT_WEBHOOK_SECRET` via `add_secret`, with guidance that you'll generate the value in RevenueCat (Integrations → Webhooks → Authorization header) and paste it once into Lovable.
2. **Create `supabase/functions/revenuecat-webhook/index.ts`** — POST-only, validates `Authorization: Bearer <secret>`, switches on `event.type` (`INITIAL_PURCHASE` / `NON_RENEWING_PURCHASE` → upsert; `REFUND` → delete; `CANCELLATION` / `EXPIRATION` → log + 200; `TEST` → `{received: true, test: true}`; unknown → log + 200), strips the `com.bonkistudio.bonkiapp.` prefix, validates against `products` table, upserts `user_product_access` with `granted_via: 'revenuecat'` on conflict `(user_id, product_id)`. Service-role client. CORS for POST + Authorization. Logs use `📥` / `✅` / `❌`.
3. **Create `supabase/functions/revenuecat-webhook/README.md`** — purpose, required secret, header format, event-type table, how to test from RevenueCat dashboard.
4. **Register in `supabase/config.toml`** — `[functions.revenuecat-webhook]` with `verify_jwt = false` (third-party server, authenticates via shared secret in `Authorization` header).

### Not touching

`BuyPage.tsx`, `revenueCat.ts`, `AuthContext.tsx`, paywall components, `useProductAccess.ts`, `useAllProductAccess.ts`, `CardView.tsx`, `useSessionReflections.ts`, `useNormalizedSessionState.ts`, `stripe-webhook` and any Stripe code.

### Verification

- **Deploy** — function appears in both Test and Live after publish, no boot errors.
- **TEST event** from RevenueCat dashboard against the Live URL → 200 with `{ received: true, test: true }`, log shows `📥 Webhook received: TEST`.
- **Wrong/missing Authorization** → 401, no row written.
- **Real sandbox purchase via Prompt 2's flow** → log shows `📥 Webhook received: INITIAL_PURCHASE` then `✅ Granted <product> to <uuid>`. New row in **Live** `user_product_access` with `granted_via='revenuecat'`. App on bonkiapp.com unlocks the product on next navigation.
- **Stripe path** unchanged.

### What you'll do after I deploy

1. In Lovable, paste the secret value when prompted by `add_secret`.
2. Click **Publish** so the function and the secret reach Live.
3. In RevenueCat dashboard → Integrations → Webhooks:
   - URL: `https://spgknasuinxmvyrlpztx.supabase.co/functions/v1/revenuecat-webhook`
   - Header: `Authorization: Bearer <the value you just pasted into Lovable>`
4. Click **Send Test Event** → expect 200 + `{ received: true, test: true }`.

### Deferred to Prompt 4

- Restore Purchases UI button (server side already covered).
- Production-environment test on a real device post-TestFlight.

