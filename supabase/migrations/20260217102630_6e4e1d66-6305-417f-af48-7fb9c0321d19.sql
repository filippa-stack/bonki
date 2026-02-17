CREATE OR REPLACE FUNCTION public.get_user_couple_space_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT couple_space_id FROM public.couple_members
  WHERE user_id = _user_id AND left_at IS NULL AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1
$$;