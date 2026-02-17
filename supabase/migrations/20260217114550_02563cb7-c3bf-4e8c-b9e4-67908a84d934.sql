
create or replace function public.activate_couple_session(
  p_couple_space_id uuid,
  p_category_id uuid,
  p_card_id uuid,
  p_step_count int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_member_count int;
  v_existing_id uuid;
  v_new_id uuid;
begin
  -- 1. Verify caller is active member
  if not is_couple_member(v_user_id, p_couple_space_id) then
    raise exception 'not_a_member';
  end if;

  -- 2. Verify exactly two active members
  select count(*) into v_member_count
  from couple_members
  where couple_space_id = p_couple_space_id
    and left_at is null
    and status = 'active';

  if v_member_count <> 2 then
    raise exception 'requires_two_members';
  end if;

  -- 3. Return existing active session if one exists
  select id into v_existing_id
  from couple_sessions
  where couple_space_id = p_couple_space_id
    and status = 'active'
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  -- 4a. Insert new session
  insert into couple_sessions (couple_space_id, category_id, card_id, status, created_by)
  values (p_couple_space_id, p_category_id, p_card_id, 'active', v_user_id)
  returning id into v_new_id;

  -- 4b. Insert step rows
  insert into couple_session_steps (session_id, couple_space_id, step_index)
  select v_new_id, p_couple_space_id, generate_series(0, p_step_count - 1);

  return v_new_id;
end;
$$;
