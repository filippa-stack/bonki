
-- Fix activate_couple_session: allow 1 member (Volume 1 single-writer)
CREATE OR REPLACE FUNCTION public.activate_couple_session(p_couple_space_id uuid, p_category_id text, p_card_id text, p_step_count integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_new_id uuid;
  v_member_count int;
begin
  if p_step_count is null or p_step_count < 1 or p_step_count > 50 then
    raise exception 'invalid_step_count: must be 1..50';
  end if;

  if not public.is_couple_member(v_user_id, p_couple_space_id) then
    raise exception 'not_a_member';
  end if;

  -- Volume 1: require at least 1 active member (was: exactly 2)
  select count(*) into v_member_count
  from public.couple_members
  where couple_space_id = p_couple_space_id
    and left_at is null and status = 'active';

  if v_member_count < 1 then
    raise exception 'requires_active_member';
  end if;

  select id into v_existing_id
  from public.couple_sessions
  where couple_space_id = p_couple_space_id and status = 'active'
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

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

  insert into public.couple_session_steps (session_id, couple_space_id, step_index)
  select v_new_id, p_couple_space_id, generate_series(0, p_step_count - 1);

  update public.topic_proposals
  set status = 'withdrawn', updated_at = now()
  where couple_space_id = p_couple_space_id and status = 'pending';

  perform public.assert_one_active_session_per_space(p_couple_space_id);

  return v_new_id;
end;
$$;

-- Fix complete_couple_session_step: don't cancel when < 2 members
CREATE OR REPLACE FUNCTION public.complete_couple_session_step(p_session_id uuid, p_step_index integer)
 RETURNS TABLE(is_waiting boolean, is_step_complete boolean, is_session_complete boolean, partner_left boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $$
declare
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_status text;
  v_step_count int;
  v_all_steps_done boolean;
  v_is_waiting boolean := false;
  v_is_step_complete boolean := false;
  v_is_session_complete boolean := false;
  v_partner_left boolean := false;
  v_step_exists boolean;
  v_completion_threshold int := 1;
  v_step_completions int;
begin
  select couple_space_id, status into v_space_id, v_status
  from public.couple_sessions where id = p_session_id;

  if v_space_id is null then
    raise exception 'session_not_found';
  end if;

  if not public.is_couple_member(v_user_id, v_space_id) then
    raise exception 'not_a_member';
  end if;

  if v_status <> 'active' then
    raise exception 'session_not_active';
  end if;

  select exists(
    select 1 from public.couple_session_steps
    where session_id = p_session_id and step_index = p_step_index
  ) into v_step_exists;

  if not v_step_exists then
    raise exception 'invalid_step_index';
  end if;

  -- Volume 1: no partner-left check, single writer advances

  insert into public.couple_session_completions (session_id, couple_space_id, step_index, user_id)
  values (p_session_id, v_space_id, p_step_index, v_user_id)
  on conflict (session_id, step_index, user_id) do nothing;

  update public.couple_sessions set last_activity_at = now() where id = p_session_id;

  select count(*) into v_step_completions
  from public.couple_session_completions
  where session_id = p_session_id and step_index = p_step_index;

  v_is_step_complete := (v_step_completions >= v_completion_threshold);
  v_is_waiting := false;

  select count(*) into v_step_count
  from public.couple_session_steps where session_id = p_session_id;

  select (count(distinct s.step_index) = v_step_count) into v_all_steps_done
  from public.couple_session_steps s
  where s.session_id = p_session_id
    and (
      select count(*) from public.couple_session_completions c
      where c.session_id = p_session_id and c.step_index = s.step_index
    ) >= v_completion_threshold;

  v_is_session_complete := v_all_steps_done;

  if v_is_session_complete then
    update public.couple_sessions
    set status = 'completed', ended_at = now(), last_activity_at = now()
    where id = p_session_id;
  end if;

  return query select v_is_waiting, v_is_step_complete, v_is_session_complete, v_partner_left;
end;
$$;

-- Also fix get_active_session_state to work with 1 member
CREATE OR REPLACE FUNCTION public.get_active_session_state()
 RETURNS TABLE(session_id uuid, category_id text, card_id text, current_step_index integer, step_completions jsonb, mode text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $$
declare
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_session_id uuid;
  v_category_id text;
  v_card_id text;
  v_step_count int;
  v_current_step int;
  v_completions jsonb;
  v_user_completed_current boolean;
  v_mode text;
  v_completion_threshold int := 1;
begin
  v_space_id := public.get_current_couple_space_id();
  if v_space_id is null then return; end if;

  select s.id, s.category_id, s.card_id
  into v_session_id, v_category_id, v_card_id
  from public.couple_sessions s
  where s.couple_space_id = v_space_id and s.status = 'active'
  limit 1;

  if v_session_id is null then return; end if;

  select count(*) into v_step_count
  from public.couple_session_steps where couple_session_steps.session_id = v_session_id;

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

  return query select v_session_id, v_category_id, v_card_id, v_current_step, v_completions, v_mode;
end;
$$;
