
-- Remove the client UPDATE policy on couple_progress
DROP POLICY IF EXISTS "Members can update journey_state only" ON public.couple_progress;
