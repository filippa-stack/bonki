
-- 1. Create a safe view that hides invite_token and invite_code
CREATE VIEW public.couple_spaces_safe
WITH (security_invoker = on) AS
  SELECT id, partner_a_name, partner_b_name, created_at
  FROM public.couple_spaces;

-- 2. Drop existing SELECT policy on couple_spaces
DROP POLICY IF EXISTS "Users can read own couple space" ON public.couple_spaces;

-- 3. Block all direct SELECT on the base table (only service_role bypasses RLS)
CREATE POLICY "No direct client access to couple_spaces"
  ON public.couple_spaces FOR SELECT
  USING (false);

-- 4. Create RPC for authenticated members to get their own invite info
CREATE OR REPLACE FUNCTION public.get_own_invite_info()
RETURNS TABLE(invite_code text, invite_token text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cs.invite_code, cs.invite_token
  FROM couple_spaces cs
  INNER JOIN couple_members cm ON cm.couple_space_id = cs.id
  WHERE cm.user_id = auth.uid()
  LIMIT 1;
$$;
