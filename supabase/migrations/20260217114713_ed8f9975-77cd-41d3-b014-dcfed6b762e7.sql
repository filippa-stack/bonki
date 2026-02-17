
do $$ begin
  create type public.step_completion_result as (
    is_waiting boolean,
    is_step_complete boolean,
    is_session_complete boolean
  );
exception when duplicate_object then null;
end $$;

create or replace function public.complete_couple_session_step(
  p_session_id uuid,
  p_step_index int
)
returns public.step_completion_result
language plpgsql
security definer
set search_path = public
as $$
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
  select couple_space_id, status into v_space_id, v_status
  from couple_sessions where id = p_session_id;

  if v_space_id is null then
    raise exception 'session_not_found';
  end if;

  if not is_couple_member(v_user_id, v_space_id) then
    raise exception 'not_a_member';
  end if;

  if v_status <> 'active' then
    raise exception 'session_not_active';
  end if;

  insert into couple_session_completions (session_id, couple_space_id, step_index, user_id)
  values (p_session_id, v_space_id, p_step_index, v_user_id)
  on conflict (session_id, step_index, user_id) do nothing;

  update couple_sessions set last_activity_at = now() where id = p_session_id;

  select count(*) into v_member_count
  from couple_members
  where couple_space_id = v_space_id and left_at is null and status = 'active';

  select count(*) into v_step_completions
  from couple_session_completions
  where session_id = p_session_id and step_index = p_step_index;

  v_result.is_step_complete := v_step_completions >= v_member_count;
  v_result.is_waiting := not v_result.is_step_complete;

  select count(*) into v_step_count
  from couple_session_steps where session_id = p_session_id;

  select (count(distinct s.step_index) = v_step_count) into v_all_steps_done
  from couple_session_steps s
  where s.session_id = p_session_id
    and (
      select count(*) from couple_session_completions c
      where c.session_id = p_session_id and c.step_index = s.step_index
    ) >= v_member_count;

  v_result.is_session_complete := v_result.is_step_complete and v_all_steps_done;

  if v_result.is_session_complete then
    update couple_sessions
    set status = 'completed', ended_at = now(), last_activity_at = now()
    where id = p_session_id;
  end if;

  return v_result;
end;
$$;
