-- Fix step_reflections RLS policies: replace card_sessions with couple_sessions

-- DROP legacy INSERT policy
DROP POLICY IF EXISTS "Users can insert own reflections" ON public.step_reflections;

-- DROP legacy SELECT revealed policy
DROP POLICY IF EXISTS "Users can read revealed reflections in space" ON public.step_reflections;

-- Recreate INSERT policy referencing couple_sessions
CREATE POLICY "Users can insert own reflections"
ON public.step_reflections
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id)
  AND EXISTS (
    SELECT 1 FROM public.couple_sessions cs
    WHERE cs.id = step_reflections.session_id
      AND is_couple_member(auth.uid(), cs.couple_space_id)
  )
);

-- Recreate SELECT revealed policy referencing couple_sessions
CREATE POLICY "Users can read revealed reflections in space"
ON public.step_reflections
FOR SELECT
USING (
  (state = ANY (ARRAY['revealed'::reflection_state, 'locked'::reflection_state]))
  AND EXISTS (
    SELECT 1 FROM public.couple_sessions cs
    WHERE cs.id = step_reflections.session_id
      AND is_couple_member(auth.uid(), cs.couple_space_id)
  )
);