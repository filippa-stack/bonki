
## Step 2 — Membership Backfill (Live)

Bug 2 (cross-product session wipe) is shipped and audit-approved. Now backfilling the 3 users missing `couple_spaces` + `couple_members` rows so they can use the app at all.

### Verified pre-state on Live

Queried `auth.users` + `couple_members` + `user_product_access`:

| Email | User ID | Active memberships | Total memberships | Product access rows |
|---|---|---|---|---|
| apple.review@bonkistudio.com | f05b6b17-d7b6-48f1-ae6d-77fe2ff28711 | 0 | 0 | 7 ✅ |
| madridmarilyn@hotmail.com | 1907e546-4392-43f5-bfbd-6419fab54a3e | 0 | 0 | 0 |
| lizthelion@live.se | a6bcc665-3ef2-4e55-a53b-b4cee1550eb2 | 0 | 0 | 0 |

(Note: the actual emails in DB are `madridmarilyn@hotmail.com` and `lizthelion@live.se` — slightly different from the addresses you mentioned. Same users — only 3 candidates exist matching the pattern.)

All three are eligible for backfill: zero memberships means they cannot create sessions, cannot resume, cannot do anything. The reviewer already has all 7 product entitlements seeded — they're just missing the space/membership.

### What I'll execute (Live, via insert tool)

For each of the 3 users, idempotently:

1. Generate a fresh `couple_space_id` (uuid).
2. Insert into `couple_spaces` (just the id; names left null — same as `create-couple-space` edge function does for new spaces).
3. Insert into `couple_members` with `role='partner_a'`, `status='active'`, `left_at=NULL`.
4. Insert seed row into `couple_progress` (matches edge function behavior).
5. Insert `system_events` row of type `couple_created` with payload `{ "created_by": <user_id>, "source": "manual_backfill_step2" }`.

**No product_access changes.** The reviewer already has all 7 products. madridmarilyn and lizthelion don't get product access here — that's a separate decision (they presumably need to purchase, unless you tell me otherwise).

### Idempotency / safety

- Before each insert, I'll check `couple_members WHERE user_id = X AND left_at IS NULL` and skip if non-zero. Re-runnable.
- No destructive ops. No DELETE. No UPDATE on existing rows.
- Each user's space is independent — failure on one doesn't block the others.

### Verification after run

For each user, confirm:
```sql
SELECT u.email, m.couple_space_id, m.role, m.status, m.left_at, s.created_at
FROM auth.users u
JOIN couple_members m ON m.user_id = u.id AND m.left_at IS NULL
JOIN couple_spaces s ON s.id = m.couple_space_id
WHERE u.id IN (<3 ids>);
```
Expect exactly 3 rows.

### After Step 2

Stop and report results. Then proceed to Step 4 (auth race fix in `useProductAccess` / `useAllProductAccess`).
