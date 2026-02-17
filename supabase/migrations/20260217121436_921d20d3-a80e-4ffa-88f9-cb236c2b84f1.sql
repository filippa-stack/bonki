
-- Extend the composite type with partner_left field
ALTER TYPE public.step_completion_result ADD ATTRIBUTE partner_left boolean;

-- Update complete_couple_session_step with interrupt integrity
CREATE OR REPLACE FUNCTION public.complete_couple_session_step(p_session_id uuid, p_step_index integer)
 RETURNS public.step_completion_result
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_status text;
  v_member_count int;
  v_step_count int;
  v_step_completions int;
  v_all_steps_done boolean;
  v_result public.step_completion_result;
begin
  -- Initialize all fields
  v_result.is_waiting := false;
  v_result.is_step_complete := false;
  v_result.is_session_complete := false;
  v_result.partner_left := false;

  -- Derive couple_space_id from the session row (never client-supplied)
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

  -- Re-check active member count server-side
  select count(*) into v_member_count
  from public.couple_members
  where couple_space_id = v_space_id and left_at is null and status = 'active';

  -- If partner has left, cancel session immediately
  if v_member_count < 2 then
    update public.couple_sessions
    set status = 'cancelled', ended_at = now(), last_activity_at = now()
    where id = p_session_id and status = 'active';

    v_result.partner_left := true;
    return v_result;
  end if;

  -- Insert completion (space_id derived from session, not client)
  insert into public.couple_session_completions (session_id, couple_space_id, step_index, user_id)
  values (p_session_id, v_space_id, p_step_index, v_user_id)
  on conflict (session_id, step_index, user_id) do nothing;

  update public.couple_sessions set last_activity_at = now() where id = p_session_id;

  select count(*) into v_step_completions
  from public.couple_session_completions
  where session_id = p_session_id and step_index = p_step_index;

  v_result.is_step_complete := v_step_completions >= v_member_count;
  v_result.is_waiting := not v_result.is_step_complete;

  select count(*) into v_step_count
  from public.couple_session_steps where session_id = p_session_id;

  select (count(distinct s.step_index) = v_step_count) into v_all_steps_done
  from public.couple_session_steps s
  where s.session_id = p_session_id
    and (
      select count(*) from public.couple_session_completions c
      where c.session_id = p_session_id and c.step_index = s.step_index
    ) >= v_member_count;

  v_result.is_session_complete := v_result.is_step_complete and v_all_steps_done;

  if v_result.is_session_complete then
    update public.couple_sessions
    set status = 'completed', ended_at = now(), last_activity_at = now()
    where id = p_session_id;
  end if;

  return v_result;
end;
$function$;
