-- =====================================================================
-- Migration: scope active-session uniqueness to (couple_space_id, product_id)
-- Bug 2 fix: cross-product session wipe
-- =====================================================================

-- 1) Drop the old global per-space active-session partial unique index.
DROP INDEX IF EXISTS public.uniq_active_session_per_space;

-- 2) Create new per-(space, product) partial unique index.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_session_per_space_product
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

-- 4) Replace get_active_session_state — optional product filter.
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