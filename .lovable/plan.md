## Goal

Grant `bernhard.emma@gmail.com` (user_id `8105cd94-be94-473e-977a-883e461cfea8`) full access to all 7 products in the catalog.

## Approach

Run a single migration that inserts rows into `user_product_access` for the user across all known product IDs, with `granted_via = 'admin_grant'`. Idempotent via `ON CONFLICT (user_id, product_id) DO NOTHING`, so re-running is safe and existing entitlements are preserved.

## Products granted

`still_us`, `jag_i_mig`, `jag_med_andra`, `jag_i_varlden`, `vardagskort`, `syskonkort`, `sexualitetskort`

## SQL

```sql
INSERT INTO public.user_product_access (user_id, product_id, granted_at, granted_via)
SELECT
  '8105cd94-be94-473e-977a-883e461cfea8'::uuid,
  pid,
  now(),
  'admin_grant'
FROM unnest(ARRAY[
  'still_us','jag_i_mig','jag_med_andra','jag_i_varlden',
  'vardagskort','syskonkort','sexualitetskort'
]) AS pid
ON CONFLICT (user_id, product_id) DO NOTHING;
```

## Out of scope

No code changes, no schema changes, no changes for any other user.
