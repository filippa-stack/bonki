
CREATE OR REPLACE FUNCTION public.complete_couple_session_step(p_session_id uuid, p_step_index int)
RETURNS TABLE(is_waiting boolean, is_step_complete boolean, is_session_complete boolean, partner_left boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_status text;
  v_member_count int;
  v_step_count int;
  v_all_steps_done boolean;
  v_is_waiting boolean := false;
  v_is_step_complete boolean := false;
  v_is_session_complete boolean := false;
  v_partner_left boolean := false;
  v_step_exists boolean;
  -- Volume 1: single-writer — one completion per step is enough
  v_completion_threshold int := 1;
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

  select count(*) into v_member_count
  from public.couple_members
  where couple_space_id = v_space_id and left_at is null and status = 'active';

  if v_member_count < 2 then
    update public.couple_sessions
    set status = 'cancelled', ended_at = now(), last_activity_at = now()
    where id = p_session_id and status = 'active';

    v_partner_left := true;
    return query select v_is_waiting, v_is_step_complete, v_is_session_complete, v_partner_left;
    return;
  end if;

  insert into public.couple_session_completions (session_id, couple_space_id, step_index, user_id)
  values (p_session_id, v_space_id, p_step_index, v_user_id)
  on conflict (session_id, step_index, user_id) do nothing;

  update public.couple_sessions set last_activity_at = now() where id = p_session_id;

  -- Volume 1: use threshold of 1 (single writer advances the step)
  select count(*) into v_step_count
  from public.couple_session_completions
  where session_id = p_session_id and step_index = p_step_index;

  v_is_step_complete := (v_step_count >= v_completion_threshold);
  v_is_waiting := (v_step_count > 0 and v_step_count < v_completion_threshold);

  -- Session completion: all steps done by at least one user
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
