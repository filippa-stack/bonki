-- Add status column to couple_members
ALTER TABLE public.couple_members
ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Backfill: mark rows with left_at as 'left'
UPDATE public.couple_members SET status = 'left' WHERE left_at IS NOT NULL;

-- Update is_couple_member to also check status
CREATE OR REPLACE FUNCTION public.is_couple_member(_user_id uuid, _space_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_members
    WHERE user_id = _user_id
      AND couple_space_id = _space_id
      AND left_at IS NULL
      AND status = 'active'
  )
$$;

-- Update get_user_couple_space_id to also check status
CREATE OR REPLACE FUNCTION public.get_user_couple_space_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT couple_space_id FROM public.couple_members
  WHERE user_id = _user_id AND left_at IS NULL AND status = 'active'
  LIMIT 1
$$;