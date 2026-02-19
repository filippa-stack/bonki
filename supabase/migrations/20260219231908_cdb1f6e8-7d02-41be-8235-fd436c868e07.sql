
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
  -- Volume 1: single-writer threshold
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

  -- Volume 1: use threshold of 1 instead of v_member_count
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
