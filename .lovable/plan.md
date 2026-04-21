

## Prompt 3.2 — Webhook user lookup fix + comprehensive post-deploy audit

### Part A: The fix (unchanged from prior approval)

`supabase/functions/stripe-webhook/index.ts` — three localized edits:

1. **Add `findUserByEmail` helper** after imports. Walks `listUsers({ page, perPage: 1000 })` until the email is found, the page returns fewer than `perPage` users, the user list is empty, or a 20-page safety cap (20,000 users) is hit. Logs and returns `null` on any error or exhaustion.

2. **First lookup (~line 105)** — replace inline `listUsers()` + `.find()` with `const existing = await findUserByEmail(supabase, email);`.

3. **Race-recovery branch (~line 123)** — replace second inline `listUsers()` + `.find()` with `findUserByEmail(supabase, email)`, AND broaden the error trigger from `createErr?.message?.toLowerCase().includes("already")` to also accept `createErr?.code === "email_exists"` (canonical, locale-stable identifier seen in production logs).

### Part B: Pre-deploy scope check

Before pushing the fix, run:

```sql
SELECT count(*) FROM auth.users
```

Report the exact number. If > 50, every website-direct purchase by a pre-existing user since Prompt 1 went live could have hit this bug.

### Part C: Post-deploy audit — three independent passes

Three audits run in parallel; their union is the definitive list of affected customers. Belt-and-braces: any single source missing an event will be caught by the others.

**Pass 1 — Edge function log scan**

Use the edge-function-logs tool against `stripe-webhook` for the last 48h. Search separately for: `"User creation failed"`, `"Auth list error"`, `"userId resolution ended null"`, `"Cannot resolve user"`, `"DB error"`. Capture timestamps, session IDs, and emails from surrounding log context. Output: list of suspect Stripe session IDs.

**Pass 2 — Stripe API ↔ DB cross-reference (the belt-and-braces pass)**

This catches failures the log scan might miss (e.g. silent 200 responses with no granted row, log retention gaps, future error phrasings).

a. **Pull Stripe events.** Write a one-shot script in `/tmp/` using `STRIPE_SECRET_KEY` (already in edge function secrets — fetch via `fetch_secrets`). Call `GET https://api.stripe.com/v1/events?type=checkout.session.completed&created[gte]={now-48h}` with pagination via `starting_after`. For each event, extract: `event.id`, `created` timestamp, `data.object.id` (session id), `data.object.customer_details.email`, `data.object.metadata.product_id`, `data.object.metadata.user_id`, `data.object.livemode`. Filter to livemode only.

b. **Pull DB grants in same window:**

```sql
SELECT upa.user_id, upa.product_id, upa.granted_at, u.email
FROM user_product_access upa
JOIN auth.users u ON u.id = upa.user_id
WHERE upa.granted_via = 'stripe'
  AND upa.granted_at >= now() - interval '48 hours'
```

c. **Diff the two sets.** For each Stripe `checkout.session.completed` event, check whether a matching `user_product_access` row exists (match by email → user_id, product_id, granted_at within ±10 min of event created). Any Stripe event with no matching grant = paid customer who didn't get access.

**Pass 3 — Confirm victim has an account**

For each suspect email from Passes 1 and 2:

```sql
SELECT id, email, created_at FROM auth.users WHERE lower(email) = lower('<email>')
```

If row exists → confirmed victim of the pagination bug. If no row → either still pending (createUser hadn't completed) or the user never had an account (different failure mode, flag separately).

**Step 4 — Deliver audit report**

Output a table to `/mnt/documents/webhook-audit-{date}.csv` with columns:

`stripe_event_id | event_timestamp | session_id | email | auth_user_id_if_exists | product_id | webhook_log_error | grant_exists | needs_replay | failure_class`

Where `failure_class` ∈ {`pagination_bug` (account exists, no grant), `unknown_silent_failure` (no log error but no grant), `account_not_created` (no auth row), `clean` (grant exists, control case)}.

This is the actionable list you take to Stripe Dashboard → resend webhook events for, and the basis for any compensation/refund decisions.

### What is NOT touched

- Signature verification (HMAC-SHA256 v1).
- Path A (metadata.user_id, in-app authenticated flow).
- `user_product_access` upsert with `onConflict: "user_id,product_id"`.
- `createUser({ email, email_confirm: true })` itself.
- CORS, response envelopes, status codes.
- All other edge functions, config.toml, RLS, RPCs.
- ClaimPage, App.tsx, regression guards.

### Verify after deploy

1. **Affected user retry** — from Stripe Dashboard, resend one event from the audit report. Expect 200, `user_product_access` row created, customer unlocked.
2. **New website-direct purchase** — incognito buy via `/buy?product=X`, complete Stripe. Webhook log shows `Found existing user` or `Created new user`, then `✅ Granted X access`.
3. **In-app authenticated purchase regression** — log in, tap locked tile → Stripe → success. Log shows `In-app flow: using metadata user_id`.
4. **Clean log scan** — after a few real purchases, no `User creation failed` or `Auth list error` lines.

### Rollback

One file, three localized hunks. Each independently revertible. The new helper is strictly more correct than the old call — no realistic regression vector. The audit is read-only and produces a downloadable CSV; running it has no side effects on production.

