
-- Add soft-leave columns
ALTER TABLE public.couple_members
  ADD COLUMN IF NOT EXISTS left_at timestamptz,
  ADD COLUMN IF NOT EXISTS left_reason text,
  ADD COLUMN IF NOT EXISTS left_by uuid;

-- Drop the existing unique constraint on user_id (may have different names)
DO $$
DECLARE
  _con text;
BEGIN
  FOR _con IN
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'couple_members'
      AND constraint_type = 'UNIQUE'
      AND constraint_name IN (
        SELECT constraint_name FROM information_schema.constraint_column_usage
        WHERE table_schema = 'public' AND table_name = 'couple_members' AND column_name = 'user_id'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.couple_members DROP CONSTRAINT IF EXISTS %I', _con);
  END LOOP;
END$$;

-- Also drop any unique index on user_id alone
DROP INDEX IF EXISTS public.couple_members_user_id_key;
DROP INDEX IF EXISTS public.couple_members_one_active_per_user;

-- Partial unique index: only one active membership per user
CREATE UNIQUE INDEX couple_members_one_active_per_user
  ON public.couple_members(user_id)
  WHERE left_at IS NULL;

-- Update is_couple_member to only match active memberships
CREATE OR REPLACE FUNCTION public.is_couple_member(_user_id uuid, _space_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_members
    WHERE user_id = _user_id
      AND couple_space_id = _space_id
      AND left_at IS NULL
  )
$$;

-- Update get_user_couple_space_id to only return active space
CREATE OR REPLACE FUNCTION public.get_user_couple_space_id(_user_id uuid)
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT couple_space_id FROM public.couple_members
  WHERE user_id = _user_id AND left_at IS NULL
  LIMIT 1
$$;
