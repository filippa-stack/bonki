
create or replace function public.get_active_session_state()
returns table(
  session_id uuid,
  category_id uuid,
  card_id uuid,
  current_step_index int,
  step_completions jsonb,
  mode text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_session_id uuid;
  v_category_id uuid;
  v_card_id uuid;
  v_step_count int;
  v_member_count int;
  v_current_step int;
  v_completions jsonb;
  v_user_completed_current boolean;
  v_step_done boolean;
  v_mode text;
begin
  -- Get current space
  v_space_id := get_current_couple_space_id();
  if v_space_id is null then
    return;
  end if;

  -- Get active session
  select s.id, s.category_id, s.card_id
  into v_session_id, v_category_id, v_card_id
  from couple_sessions s
  where s.couple_space_id = v_space_id and s.status = 'active'
  limit 1;

  if v_session_id is null then
    return;
  end if;

  -- Member count
  select count(*) into v_member_count
  from couple_members
  where couple_space_id = v_space_id and left_at is null and status = 'active';

  -- Total steps
  select count(*) into v_step_count
  from couple_session_steps where couple_session_steps.session_id = v_session_id;

  -- Build per-step completion counts
  select coalesce(jsonb_object_agg(si::text, cnt), '{}'::jsonb)
  into v_completions
  from (
    select st.step_index as si, coalesce(c.cnt, 0) as cnt
    from couple_session_steps st
    left join (
      select step_index, count(*)::int as cnt
      from couple_session_completions
      where couple_session_completions.session_id = v_session_id
      group by step_index
    ) c on c.step_index = st.step_index
    where st.session_id = v_session_id
  ) sub;

  -- Compute current_step_index: first step not completed by all members
  select coalesce(min(st.step_index), v_step_count)
  into v_current_step
  from couple_session_steps st
  where st.session_id = v_session_id
    and (
      select count(*) from couple_session_completions cc
      where cc.session_id = v_session_id and cc.step_index = st.step_index
    ) < v_member_count;

  -- Determine mode
  select exists(
    select 1 from couple_session_completions
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
