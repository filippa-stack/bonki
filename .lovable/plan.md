

## Prompt 3.3 (final) — Re-run audit against Live with explicit email list

### What changed from prior plan

Pass 1 SQL had `…` placeholders that Postgres rejects. Replaced with the five concrete emails confirmed from this conversation's evidence trail. Everything else stands.

### Part A: Fix status

`stripe-webhook/index.ts` paginated-lookup fix already deployed. No code edits in this round.

### Part B: Live re-audit (read-only, all queries with `environment: "production"`)

**Pass 1 — Live scope + known-account confirmation**

```sql
SELECT count(*) FROM auth.users
```

Then:

```sql
SELECT id, email, created_at FROM auth.users
WHERE lower(email) IN (
  'filippa@bonkistudio.com',
  'ida@bonkistudio.com',
  'sara.axberg@gmail.com',
  'cekanderryan@yahoo.com',
  'sara.wigen@gmail.com'
)
ORDER BY email
```

Any of these five missing from Live → flag as additional anomaly in the report.

**Pass 2 — Live edge function logs**

`supabase--edge_function_logs` against `stripe-webhook` with `environment: "production"`. Run separate searches for: `User creation failed`, `email_exists`, `Auth list error`, `retry list did not find user`, `Cannot resolve user`, `userId resolution ended null`, `filippa@bonkistudio.com`. Time-anchor on `1776774274` and `1776774292` (~14:24 UTC) — those two events MUST be visible. If they aren't in Live logs, the environment routing itself is broken and reported before going further.

**Pass 3 — Stripe Live ↔ Live DB diff**

a. Verify `STRIPE_SECRET_KEY` via `secrets--fetch_secrets` and inspect prefix only (never log the value). If it begins `sk_test_`, stop and request the Live key. Once confirmed `sk_live_…`, write `/tmp/stripe-audit.ts` (Deno) to call `GET https://api.stripe.com/v1/events?type=checkout.session.completed&created[gte]={now-72h}` with `starting_after` pagination. Filter to `livemode: true`. Capture per event: `event.id`, `created`, `data.object.id`, `customer_details.email`, `metadata.product_id`, `metadata.user_id`.

b. Pull Live grants in same window:

```sql
SELECT upa.user_id, upa.product_id, upa.granted_at, u.email
FROM user_product_access upa
JOIN auth.users u ON u.id = upa.user_id
WHERE upa.granted_via = 'stripe'
  AND upa.granted_at >= now() - interval '72 hours'
```

c. Diff: for each Stripe event, look up `user_product_access` by email→user_id + product_id within ±10 min of event `created`. No match → paid customer who didn't get access.

**Pass 4 — Classify each anomaly**

For every email surfaced in passes 2 + 3, look up Live `auth.users` and assign `failure_class`:

- `pagination_bug` — auth row exists, no grant (Filippa belongs here)
- `unknown_silent_failure` — Stripe event present, no grant, no log error
- `account_not_created` — no auth row
- `clean` — grant exists (control)

### Deliverable

`/mnt/documents/webhook-audit-LIVE-2026-04-21.csv` with columns:

`stripe_event_id | event_timestamp | session_id | email | auth_user_id | product_id | webhook_log_error | grant_exists | needs_replay | failure_class`

The prior Test-data CSV is deleted to prevent confusion.

### Reconciliation report (alongside CSV)

Plain-text summary stating explicitly:

1. Live `auth.users` count
2. `STRIPE_SECRET_KEY` prefix confirmation (`sk_live_` only, never the value)
3. Which of the 5 known emails resolved in Live `auth.users`
4. Whether events `1776774274` and `1776774292` appear in Live `stripe-webhook` logs
5. Filippa's row from the audit, verbatim
6. Count of `needs_replay = true` rows

### Acceptance gate

Filippa's 14:24 UTC event MUST appear with `failure_class = pagination_bug` and `needs_replay = true`. If she doesn't appear, audit is wrong and rerun before delivery — no "no action needed" verdict accepted.

### Replay guidance (manual, no automatic action)

For each `needs_replay = true` row: Stripe Dashboard (Live) → Developers → Events → find by `stripe_event_id` → Resend. The deployed fix will now succeed. All replay decisions stay with the user.

### What is NOT touched

- `stripe-webhook/index.ts` — fix already shipped, untouched.
- Test environment — not queried.
- Production data — read-only audit only.
- Code, routes, edge functions, RLS, RPCs, config.toml.

### If Live audit still shows zero affected

Dump raw evidence side-by-side: Stripe event payload for `1776774274`, the `auth.users` row for `filippa@bonkistudio.com`, all `user_product_access` rows for that user_id, and the raw `stripe-webhook` log lines around 14:24 UTC — walked through line by line. No "no action needed" without that reconciliation.

