
-- Drop existing policies on couple_members
DROP POLICY IF EXISTS "Users can read members of own space" ON public.couple_members;
DROP POLICY IF EXISTS "Users can update own membership" ON public.couple_members;

-- SELECT: only active memberships visible
CREATE POLICY "Members can read active memberships"
  ON public.couple_members FOR SELECT
  USING (
    is_couple_member(auth.uid(), couple_space_id)
    AND left_at IS NULL
  );

-- No INSERT, UPDATE, or DELETE policies — all mutations via service_role edge functions only
