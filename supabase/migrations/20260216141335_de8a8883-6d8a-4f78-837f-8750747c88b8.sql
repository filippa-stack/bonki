
-- 1) Remove client INSERT on couple_spaces (creation is via edge function only)
DROP POLICY IF EXISTS "Authenticated users can create couple space" ON public.couple_spaces;

-- 2) Remove client INSERT on couple_progress (initialization is via edge function only)
DROP POLICY IF EXISTS "Members can insert progress" ON public.couple_progress;

-- 3) Replace broad UPDATE policy on couple_progress with one that blocks current_session writes
--    Clients may only update journey_state (for sync); current_session is edge-function-only.
DROP POLICY IF EXISTS "Members can update progress" ON public.couple_progress;

CREATE POLICY "Members can update journey_state only"
  ON public.couple_progress
  FOR UPDATE
  USING (is_couple_member(auth.uid(), couple_space_id))
  WITH CHECK (
    is_couple_member(auth.uid(), couple_space_id)
    -- Ensure current_session is not changed by the client
    AND current_session IS NOT DISTINCT FROM (
      SELECT cp.current_session FROM public.couple_progress cp WHERE cp.id = couple_progress.id
    )
  );
