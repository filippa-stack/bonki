

## Prompt 1 of 3 — Backend dual-mode purchase flow (webhook + checkout + claim lookup)

Backend-only refactor. No user-visible change. Prepares the system to accept both the existing in-app authenticated flow and the upcoming website-direct (pay → OTP after) flow.

### Files touched

1. **`supabase/functions/stripe-webhook/index.ts`** (modify)
   - Add Stripe signature verification (HMAC-SHA256 over `t=<ts>.<body>` against `STRIPE_WEBHOOK_SECRET`). Refuse with 503 if secret unset, 400 on missing/malformed/mismatched signature.
   - Branch user resolution in `checkout.session.completed`:
     - **Path A (in-app)**: `metadata.user_id` present → use it as today.
     - **Path B (website-direct)**: no `user_id` → resolve from `customer_details.email` (lowercased/trimmed). Look up via `auth.admin.listUsers()`; if absent, `auth.admin.createUser({ email, email_confirm: true })`. Handle "already exists" race by re-listing.
   - Keep the existing `user_product_access` upsert (`onConflict: user_id,product_id`, `granted_via: "stripe"`) — idempotent across retries.

2. **`supabase/functions/create-checkout/index.ts`** (modify)
   - Make `Authorization` header optional. If present → validate user and run today's `already_purchased` pre-check. If absent → skip both, proceed unauthenticated.
   - In the Stripe session body: only include `metadata[user_id]` and `customer_email` when authenticated. Always include `metadata[product_id]`. No Stripe-side terms consent collection — terms are collected by the app's own TermsConsent component (in-app flow) and will be collected on the /buy page in Prompt 3 (website flow).

3. **`supabase/functions/get-purchase-session/index.ts`** (new)
   - Thin POST endpoint. Accepts `{ sessionId }`, calls Stripe `GET /v1/checkout/sessions/{id}` with the server-side `STRIPE_SECRET_KEY`, returns `{ email, paid, productId }`. Used by the upcoming claim page so the browser never sees the Stripe secret.

### Explicitly NOT touched

- `user_product_access` schema and the `granted_via: "stripe"` value
- Stripe pricing structure (`line_items[0][price_data]`), API surface, currency
- The unused `stripe_price_id` selection from `products`
- Any other edge function (`auth-email-hook`, `complete-session`, `meta-capi`, etc.)
- All `src/` frontend code — zero frontend changes in this prompt
- `supabase/config.toml` — both functions already deploy with `verify_jwt = false`-compatible settings

### Risks & verification

- **Critical risk**: signature verification is now mandatory. `STRIPE_WEBHOOK_SECRET` is present in project secrets — confirm it matches the live Stripe endpoint's signing secret before rollout, or every webhook returns 400 and purchases stop granting access.
- **Verification (post-deploy, in order)**:
  1. `stripe-webhook` logs boot cleanly, no "secret not set" errors.
  2. Real in-app purchase end-to-end → unlock works, new `user_product_access` row with `granted_via='stripe'`, logs show `In-app flow: using metadata user_id …` then `✅ Granted …`.
  3. Stripe Dashboard → Webhooks → recent events all return 200.
  4. `curl` `get-purchase-session` with a recent `cs_live_…` id → returns `{ email, paid: true, productId }`.
  5. Resend a recent `checkout.session.completed` from Stripe → no duplicate row, no errors.
- **Rollback**: revert the two modified files to their pre-deploy state. The new `get-purchase-session` function is inert until called, safe to leave in place.

