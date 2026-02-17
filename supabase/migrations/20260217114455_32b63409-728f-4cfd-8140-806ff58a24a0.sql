
create or replace function public.get_current_couple_space_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_space_id
  from public.couple_members
  where user_id = auth.uid()
    and left_at is null
    and status = 'active'
  order by created_at desc
  limit 1
$$;
