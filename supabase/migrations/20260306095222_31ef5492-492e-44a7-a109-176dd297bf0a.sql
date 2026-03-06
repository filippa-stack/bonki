
-- Add p_product_id parameter to activate_couple_session
CREATE OR REPLACE FUNCTION public.activate_couple_session(
  p_couple_space_id uuid,
  p_category_id text,
  p_card_id text,
  p_step_count integer,
  p_product_id text DEFAULT 'still_us'
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

  select id into v_existing_id
  from public.couple_sessions
  where couple_space_id = p_couple_space_id and status = 'active'
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  begin
    insert into public.couple_sessions (couple_space_id, category_id, card_id, status, created_by, product_id)
    values (p_couple_space_id, p_category_id, p_card_id, 'active', v_user_id, p_product_id)
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
$function$;
