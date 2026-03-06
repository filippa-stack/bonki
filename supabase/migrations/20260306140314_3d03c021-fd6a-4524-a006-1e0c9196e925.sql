-- Step 1: Drop the unused DB function
DROP FUNCTION IF EXISTS public.get_own_invite_info();

-- Step 2: Recreate the safe view without invite fields (they're about to be dropped)
DROP VIEW IF EXISTS public.couple_spaces_safe;
CREATE VIEW public.couple_spaces_safe
  WITH (security_invoker = true)
AS
  SELECT id, created_at, paid_at, partner_a_name, partner_b_name
  FROM public.couple_spaces;

-- Step 3: Drop the columns
ALTER TABLE public.couple_spaces DROP COLUMN IF EXISTS invite_code;
ALTER TABLE public.couple_spaces DROP COLUMN IF EXISTS invite_token;