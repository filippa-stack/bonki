# Fix Plan — Broken Memberships, Resume/Banner Logic, and Locked Tiles

## Context
- 23 users (including reviewer `apple.review@bonkistudio.com` UID `f05b6b17-...`) on Live (`spgknasuinxmvyrlpztx`) have rows in `auth.users` and `user_product_access` but **no row** in `couple_members`.
- Without a `couple_space_id`, every hook that depends on `useCoupleSpace` returns null → tiles render as locked, NextActionBanner is empty, resume logic returns nothing, sequencing breaks.
- `create-couple-space` edge function is failing silently or not being called for ~10–15% of signups since 2026-03-04.
- Two compounding bugs in the access hooks (`useProductAccess`, `useAllProductAccess`) cause a brief locked-tile flash even for healthy users due to an auth race.
- `couple_spaces_safe` view is missing `security_invoker=on`.

## Execution Order (with checkpoints)

### ✅ Step 1 — Diagnose `create-couple-space` failure (REPORT BACK)
- Check production deployment status of `create-couple-space` edge function.
- Pull recent production logs (last 7 days) filtered by errors.
- Test-invoke the function as the reviewer to see the live response.
- Cross-check why the 23 users have `auth.users` + `user_product_access` rows but no `couple_members` row — was the function called? Did it 500? Was it never called from the client?
- **Stop and report findings** before proceeding to backfill.

### ✅ Step 2 — Backfill missing memberships (REPORT BACK)
- Idempotent SQL insert: for each of the 23 affected users:
  - Create `couple_spaces` row if missing.
  - Create `couple_members` row (`role: partner_a`, `status: active`).
  - Create `couple_progress` row (`journey_state: null`).
  - Insert `system_events` audit row (`type: couple_backfill`).
- Re-query Live and confirm all 23 users now have `couple_space_id`.
- Confirm reviewer (`f05b6b17-...`) specifically.
- **Stop and report** before touching code.

### Step 3 — (deferred) Root-cause fix for `create-couple-space`
- Only after Step 2 unblocks the reviewer.

### ✅ Step 4 — Fix auth race in access hooks (REPORT BACK)
- Edit `src/hooks/useProductAccess.ts` and `src/hooks/useAllProductAccess.ts`:
  - Pull `loading: authLoading` from `useAuth()`.
  - Early-return `if (authLoading) return;` before `setLoading(false)`.
  - Don't resolve `loading: false` until both auth and the query have settled.
- **Stop and report** the diff before continuing.

### Step 5 — Harden `ProductLibrary.tsx`
- Wait for both `accessLoading` and `coupleSpaceLoading` before rendering tile lock state.
- Skeleton/placeholder while either is pending.

### Step 6 — (deferred) Recreate `couple_spaces_safe` with `security_invoker=on`
- Hardening; not blocking iOS resubmission.

### ✅ Step 7 — Verify on Live (REPORT BACK)
- Re-query Live for reviewer: confirm `couple_members` row exists, `user_product_access` has 7 rows.
- Confirm `useProductAccess` returns `hasAccess: true` for all 7 product IDs (logic walk-through).
- Confirm tiles will render unlocked, NextActionBanner will populate, resume logic will resolve.
- Sign off for iOS resubmission.

## Read-only investigation only in this plan; all writes happen after approval.
## No application logic changes beyond the two access hooks + ProductLibrary guard.
## Reviewer UID and the other 22 users are the only data targets.