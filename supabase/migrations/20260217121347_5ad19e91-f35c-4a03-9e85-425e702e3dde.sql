
-- Add partial unique index to guarantee at most one active session per space
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_session_per_space
  ON public.couple_sessions (couple_space_id)
  WHERE status = 'active';

-- Race-safe, idempotent activate_couple_session
CREATE OR REPLACE FUNCTION public.activate_couple_session(
  p_couple_space_id uuid,
  p_category_id text,
  p_card_id text,
  p_step_count integer
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
  -- Input validation
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

  if v_member_count <> 2 then
    raise exception 'requires_two_members';
  end if;

  -- Fast path: return existing active session
  select id into v_existing_id
  from public.couple_sessions
  where couple_space_id = p_couple_space_id and status = 'active'
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  -- Attempt insert; catch unique_violation from partial index race
  begin
    insert into public.couple_sessions (couple_space_id, category_id, card_id, status, created_by)
    values (p_couple_space_id, p_category_id, p_card_id, 'active', v_user_id)
    returning id into v_new_id;
  exception when unique_violation then
    select id into v_new_id
    from public.couple_sessions
    where couple_space_id = p_couple_space_id and status = 'active'
    limit 1;
    return v_new_id;
  end;

  -- Steps only for newly created session
  insert into public.couple_session_steps (session_id, couple_space_id, step_index)
  select v_new_id, p_couple_space_id, generate_series(0, p_step_count - 1);

  return v_new_id;
end;
$function$;
