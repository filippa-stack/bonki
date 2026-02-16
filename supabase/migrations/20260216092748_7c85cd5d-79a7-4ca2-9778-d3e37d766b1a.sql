-- Replace the overly restrictive SELECT policy with one that allows members to read their own space
DROP POLICY "No direct client access to couple_spaces" ON public.couple_spaces;

CREATE POLICY "Members can read own couple space"
  ON public.couple_spaces
  FOR SELECT
  USING (is_couple_member(id, auth.uid()));