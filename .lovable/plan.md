# Combined Fix Plan — Cross-Product Session Wipe + Membership Backfill + Auth Race

## Preconditions verified (read-only, on Live `spgknasuinxmvyrlpztx`)

**P1. No duplicate active sessions per `(couple_space_id, product_id)`.**
```sql
SELECT couple_space_id, product_id, count(*)
FROM couple_sessions
WHERE status='active'
GROUP BY 1,2 HAVING count(*) > 1;
-- Result: 0 rows ✅
```

**P2. `product_id` is reliably populated.**
- `couple_sessions` total: 380 rows (active 30, completed 215, abandoned 135).
- `product_id IS NULL` count: **0** across all rows.
- 30 active sessions live in 30 distinct spaces — no per-space collisions.
- Conclusion: the new partial unique index will create cleanly. No data backfill required before the index swap.

**P3. `activate_couple_session` default behavior — see B2.1 below; revised per your feedback.**

---

## Bug 2 — Cross-product session wipe (PRIORITY 1)

### B2.1 — Database migration (single migration file, full SQL shown — no abbreviations)

The migration does four things in order:

1. Drop the global active-session index `uniq_active_session_per_space`.
2. Create a new partial unique index scoped to `(couple_space_id, product_id)`.
3. Replace `activate_couple_session` so `p_product_id` is **required** (no silent default) and the existence check is also product-scoped.
4. Replace `get_active_session_state` so it filters the active row by an optional `p_product_id` parameter, returning empty when no match — full body included verbatim.

```sql
-- =====================================================================
-- Migration: scope active-session uniqueness to (couple_space_id, product_id)
-- =====================================================================

-- 1) Drop the old global per-space index (active-only partial index).
DROP INDEX IF EXISTS public.uniq_active_session_per_space;

-- 2) Create the new per-(space, product) partial unique index.
CREATE UNIQUE INDEX uniq_active_session_per_space_product
  ON public.couple_sessions (couple_space_id, product_id)
  WHERE status = 'active';

-- 3) Replace activate_couple_session — product_id is REQUIRED.
--    Drop both prior signatures explicitly so PostgREST resolves the new one cleanly.
DROP FUNCTION IF EXISTS public.activate_couple_session(uuid, text, text, integer);
DROP FUNCTION IF EXISTS public.activate_couple_session(uuid, text, text, integer, text);

CREATE OR REPLACE FUNCTION public.activate_couple_session(
  p_couple_space_id uuid,
  p_category_id text,
  p_card_id text,
  p_step_count integer,
  p_product_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_new_id uuid;
  v_member_count int;
begin
  if p_product_id is null or length(trim(p_product_id)) = 0 then
    raise exception 'product_id_required';
  end if;

  if p_step_count is null or p_step_count < 1 or p_step_count > 50 then
    raise exception 'invalid_step_count: must be 1..50';
  end if;

  if not public.is_couple_member(v_user_id, p_couple_space_id) then
    raise exception 'not_a_member';
  end if;

  select count(*) into v_member_count
  from public.couple_members
  where couple_space_id = p_couple_space_id
    and left_at is null and status = 'active';

  if v_member_count < 1 then
    raise exception 'requires_active_member';
  end if;

  -- Look for an existing active session for THIS product only.
  select id into v_existing_id
  from public.couple_sessions
  where couple_space_id = p_couple_space_id
    and product_id = p_product_id
    and status = 'active'
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  begin
    insert into public.couple_sessions
      (couple_space_id, category_id, card_id, status, created_by, product_id)
    values
      (p_couple_space_id, p_category_id, p_card_id, 'active', v_user_id, p_product_id)
    returning id into v_new_id;
  exception when unique_violation then
    -- Concurrent insert won — return whichever row is now active for this product.
    select id into v_new_id
    from public.couple_sessions
    where couple_space_id = p_couple_space_id
      and product_id = p_product_id
      and status = 'active'
    limit 1;
    return v_new_id;
  end;

  insert into public.couple_session_steps (session_id, couple_space_id, step_index)
  select v_new_id, p_couple_space_id, generate_series(0, p_step_count - 1);

  update public.topic_proposals
  set status = 'withdrawn', updated_at = now()
  where couple_space_id = p_couple_space_id and status = 'pending';

  -- NOTE: assert_one_active_session_per_space() enforces the OLD global rule.
  -- We deliberately do NOT call it here. The new partial unique index on
  -- (couple_space_id, product_id) WHERE status='active' enforces the new rule.
  return v_new_id;
end;
$function$;

-- 4) Replace get_active_session_state — optional product filter (FULL BODY).
DROP FUNCTION IF EXISTS public.get_active_session_state();
DROP FUNCTION IF EXISTS public.get_active_session_state(text);

CREATE OR REPLACE FUNCTION public.get_active_session_state(p_product_id text DEFAULT NULL)
RETURNS TABLE(
  session_id uuid,
  category_id text,
  card_id text,
  current_step_index integer,
  step_completions jsonb,
  mode text,
  product_id text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_session_id uuid;
  v_category_id text;
  v_card_id text;
  v_product_id text;
  v_step_count int;
  v_current_step int;
  v_completions jsonb;
  v_user_completed_current boolean;
  v_mode text;
  v_completion_threshold int := 1;
begin
  v_space_id := public.get_current_couple_space_id();
  if v_space_id is null then return; end if;

  -- Pick the active session, optionally filtered by product.
  -- When p_product_id is NULL we keep legacy behavior (any active session).
  select s.id, s.category_id, s.card_id, s.product_id
  into v_session_id, v_category_id, v_card_id, v_product_id
  from public.couple_sessions s
  where s.couple_space_id = v_space_id
    and s.status = 'active'
    and (p_product_id is null or s.product_id = p_product_id)
  order by s.last_activity_at desc nulls last, s.started_at desc nulls last
  limit 1;

  if v_session_id is null then return; end if;

  select count(*) into v_step_count
  from public.couple_session_steps
  where couple_session_steps.session_id = v_session_id;

  select coalesce(jsonb_object_agg(si::text, cnt), '{}'::jsonb)
  into v_completions
  from (
    select st.step_index as si, coalesce(c.cnt, 0) as cnt
    from public.couple_session_steps st
    left join (
      select step_index, count(*)::int as cnt
      from public.couple_session_completions
      where couple_session_completions.session_id = v_session_id
      group by step_index
    ) c on c.step_index = st.step_index
    where st.session_id = v_session_id
  ) sub;

  select coalesce(min(st.step_index), v_step_count)
  into v_current_step
  from public.couple_session_steps st
  where st.session_id = v_session_id
    and (
      select count(*) from public.couple_session_completions cc
      where cc.session_id = v_session_id and cc.step_index = st.step_index
    ) < v_completion_threshold;

  select exists(
    select 1 from public.couple_session_completions
    where couple_session_completions.session_id = v_session_id
      and step_index = v_current_step
      and user_id = v_user_id
  ) into v_user_completed_current;

  if v_user_completed_current then
    v_mode := 'SESSION_WAITING';
  else
    v_mode := 'SESSION_ACTIVE';
  end if;

  return query select v_session_id, v_category_id, v_card_id, v_current_step,
                      v_completions, v_mode, v_product_id;
end;
$function$;
```

**Concurrency note (your question 2):** if a user taps JIM card → immediately Still Us card before the first activation completes:
- Each call hits a different `(space, product)` slot in the new partial unique index → both inserts succeed without conflict.
- Two rapid taps on the **same** product still race into the same slot; the existing `EXCEPTION WHEN unique_violation` block handles it by returning the row that won. No throw to the client.

### B2.2 — Frontend client edits (protected patterns preserved)

**`src/pages/CardView.tsx`**
- Remove only the auto-abandon block at lines 473–522.
- Everything else — `prevServerStepRef`, `suppressUntilRef`, eager-create block, all session-step logic, `kidsNoteSyncedRef` — stays byte-identical.
- Will produce a diff for your review before commit.

**`src/hooks/useNormalizedSessionState.ts`**
- Add an optional `productId` argument: `useNormalizedSessionState(productId?: string)`.
- The only change inside the hook body: pass `{ p_product_id: productId ?? null }` to `supabase.rpc('get_active_session_state', …)` and read the new `product_id` column from the row.
- All other internals (`mountedRef`, `debounceRef`, `suppressUntilRef`, debounced refetch, realtime subscription scoping, the 2-second post-fetch suppression) remain byte-identical.

**`src/contexts/NormalizedSessionContext.tsx`**
- Pass-through: accept an optional `productId` prop on `NormalizedSessionProvider` and forward it to the hook.
- Keep the singleton context shape; no consumer breaks because `productId` defaults to `undefined` (matches today's "any active session" semantics).

**`supabase/functions/activate-session/index.ts`**
- Add a required `product_id` field to the request body.
- Forward it as `p_product_id` to `activate_couple_session`.
- Return 400 `VALIDATION` if missing.
- All callers in the client already know which product they're activating from — easy and safe.

**Caller audit (will be done as part of B2.2 before edits land):**
- `grep` for `get_active_session_state` and `activate_couple_session` and `useNormalizedSessionState` / `useNormalizedSessionContext` to enumerate callers and pass `productId` where the surrounding code already knows it (CardView, ProductHome, NextActionBanner, ActiveSessionGuard, etc.). Where a caller is product-agnostic (e.g. a global resume banner in the library), it stays without a `productId` and gets the legacy "any active session" behavior — unchanged.

### B2.3 — End-to-end verification (your question 3)

Walk through the actual user flow in code, not just SQL:

1. Start JIM card → `activate-session` edge function called with `product_id='jag_i_mig'` → row inserted into `(space, 'jag_i_mig')` slot.
2. Exit mid-way → row stays `status='active'`.
3. Start Still Us card → `activate-session` called with `product_id='still_us'` → second row inserted into `(space, 'still_us')` slot. JIM row untouched.
4. Exit mid-way.
5. Return to JIM ProductHome → `useNormalizedSessionState('jag_i_mig')` calls `get_active_session_state('jag_i_mig')` → returns the JIM row.
6. `NextActionBanner` (which already reads from `progress.activeSession`, populated by the product-scoped hook) renders **"Fortsätt ert samtal — JIM"**.

If during the audit any product home / banner does NOT pass `productId`, that is the regression source and gets fixed in the same edit pass.

### Stop point after B2.1 + B2.2 + B2.3
Send the following for your audit:
1. The new migration file (full SQL, exactly as above).
2. `src/pages/CardView.tsx` (full file).
3. `src/hooks/useNormalizedSessionState.ts` (full file).
4. `src/contexts/NormalizedSessionContext.tsx` (full file).
5. `supabase/functions/activate-session/index.ts` (full file).
6. List of any other files touched (e.g. `NextActionBanner.tsx`, `ActiveSessionGuard.tsx`, product home screens) with their diffs.

**Wait for your approval before continuing to Step 2.**

---

## Step 2 — Backfill 3 missing memberships (Live)

After Bug 2 is approved and merged, run idempotent inserts on Live for:
- `f05b6b17-…` (apple.review@bonkistudio.com — iOS reviewer)
- `madridmarilyn@hotmail.com`
- `lizthelion@live.se`

For each: insert `couple_spaces` (if missing) → `couple_members` (`role='partner_a'`, `status='active'`) → `couple_progress` (`journey_state=null`) → `system_events` (`type='couple_backfill'`). All `ON CONFLICT DO NOTHING`. Re-query Live and confirm. **Stop and report.**

---

## Step 4 — Auth race fix in access hooks

`src/hooks/useProductAccess.ts` and `src/hooks/useAllProductAccess.ts`:
- Read `loading: authLoading` from `useAuth()`.
- Early-return `if (authLoading) return;` inside the effect before any `setLoading(false)`.
- `loading` only resolves to `false` once both auth and the access query have settled.

**Stop and report diff.**

---

## Step 5 — `ProductLibrary.tsx` guard

Wait for both `accessLoading` and `coupleSpaceLoading` before rendering tile lock state. Render skeleton/placeholder while either is pending. Matches the loading aesthetic already used in `ActiveSessionGuard`.

---

## Step 7 — Verify on Live

For the reviewer (`f05b6b17-…`):
- DB: `couple_members` row exists, `user_product_access` has 7 rows.
- Logic walkthrough: `useProductAccess` returns `hasAccess: true` for all 7 products; `useNormalizedSessionState('jag_i_mig')` returns the JIM session if started; switching to Still Us doesn't wipe it.
- Tiles unlocked, NextActionBanner populated, resume logic resolves.
- Sign off for iOS resubmission.

---

## Deferred (post-resubmission)
- **Step 3:** Root-cause `create-couple-space` for the ~10–15% of signups that miss it.
- **Step 6:** Recreate `couple_spaces_safe` with `security_invoker=on`.
- **Tracked separately:** locked-tile → Stripe loop with no back path.

---

## Lock-in constraints (from your message)
- `prevServerStepRef`, `suppressUntilRef`, eager-create block, and all session-step logic in `CardView.tsx` stay **byte-identical**. Only lines 473–522 (auto-abandon block) get removed.
- Same rule for `useNormalizedSessionState.ts`: only the active-session lookup logic changes; refs, debounce, realtime subscription, suppression window — all byte-identical.
- `product_id` is **required** in `activate_couple_session`; no silent default.
- No SQL writes, no code edits in this plan call. Everything queued for post-approval execution.
