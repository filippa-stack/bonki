

## Bulk-Grant Still Us Access to All Active Couple Members

### Why it's safe
- `useProductAccess` and `useAllProductAccess` do a simple SELECT on `user_product_access`. Adding rows only flips `hasAccess` from `false` to `true`.
- No UI component changes. No schema changes. Pure data insert.
- The `ON CONFLICT DO NOTHING` clause makes it idempotent — safe to re-run.

### Change

**Single SQL insert** (via the data insert tool, not a migration):

```sql
INSERT INTO user_product_access (user_id, product_id, granted_at, granted_via)
SELECT cm.user_id, 'still_us', COALESCE(cs.paid_at, cm.created_at), 'beta_backfill'
FROM couple_members cm
JOIN couple_spaces cs ON cs.id = cm.couple_space_id
WHERE cm.left_at IS NULL
  AND cm.status = 'active'
ON CONFLICT (user_id, product_id) DO NOTHING;
```

This grants `still_us` access to every active couple member, using `paid_at` as the grant timestamp (falling back to membership creation date). The `granted_via = 'beta_backfill'` tag makes it auditable.

No code changes. No schema changes. One insert query on the Live database.

