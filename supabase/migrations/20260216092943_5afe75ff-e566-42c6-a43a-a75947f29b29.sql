-- Fix argument order: is_couple_member(user_id, space_id)
DROP POLICY "Members can read own couple space" ON public.couple_spaces;

CREATE POLICY "Members can read own couple space"
  ON public.couple_spaces
  FOR SELECT
  USING (is_couple_member(auth.uid(), id));