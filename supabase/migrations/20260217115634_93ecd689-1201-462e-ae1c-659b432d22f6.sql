
-- Change couple_sessions.card_id and category_id from UUID to TEXT
ALTER TABLE public.couple_sessions
  ALTER COLUMN card_id TYPE text USING card_id::text,
  ALTER COLUMN category_id TYPE text USING category_id::text;

-- Drop old activate_couple_session (uuid params) and recreate with text params
DROP FUNCTION IF EXISTS public.activate_couple_session(uuid, uuid, uuid, integer);
CREATE OR REPLACE FUNCTION public.activate_couple_session(
  p_couple_space_id uuid,
  p_category_id text,
  p_card_id text,
  p_step_count integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_member_count int;
  v_existing_id uuid;
  v_new_id uuid;
begin
  if not is_couple_member(v_user_id, p_couple_space_id) then
    raise exception 'not_a_member';
  end if;

  select count(*) into v_member_count
  from couple_members
  where couple_space_id = p_couple_space_id
    and left_at is null and status = 'active';

  if v_member_count <> 2 then
    raise exception 'requires_two_members';
  end if;

  select id into v_existing_id
  from couple_sessions
  where couple_space_id = p_couple_space_id and status = 'active'
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  insert into couple_sessions (couple_space_id, category_id, card_id, status, created_by)
  values (p_couple_space_id, p_category_id, p_card_id, 'active', v_user_id)
  returning id into v_new_id;

  insert into couple_session_steps (session_id, couple_space_id, step_index)
  select v_new_id, p_couple_space_id, generate_series(0, p_step_count - 1);

  return v_new_id;
end;
$function$;

-- Drop and recreate get_active_session_state with TEXT return types
DROP FUNCTION IF EXISTS public.get_active_session_state();
CREATE OR REPLACE FUNCTION public.get_active_session_state()
RETURNS TABLE(session_id uuid, category_id text, card_id text, current_step_index integer, step_completions jsonb, mode text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_space_id uuid;
  v_session_id uuid;
  v_category_id text;
  v_card_id text;
  v_step_count int;
  v_member_count int;
  v_current_step int;
  v_completions jsonb;
  v_user_completed_current boolean;
  v_mode text;
begin
  v_space_id := get_current_couple_space_id();
  if v_space_id is null then return; end if;

  select s.id, s.category_id, s.card_id
  into v_session_id, v_category_id, v_card_id
  from couple_sessions s
  where s.couple_space_id = v_space_id and s.status = 'active'
  limit 1;

  if v_session_id is null then return; end if;

  select count(*) into v_member_count
  from couple_members
  where couple_space_id = v_space_id and left_at is null and status = 'active';

  select count(*) into v_step_count
  from couple_session_steps where couple_session_steps.session_id = v_session_id;

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

  select coalesce(min(st.step_index), v_step_count)
  into v_current_step
  from couple_session_steps st
  where st.session_id = v_session_id
    and (
      select count(*) from couple_session_completions cc
      where cc.session_id = v_session_id and cc.step_index = st.step_index
    ) < v_member_count;

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
$function$;
