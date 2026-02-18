
-- Drop the old FK referencing card_sessions
ALTER TABLE public.step_reflections
  DROP CONSTRAINT step_reflections_session_id_fkey;

-- Add new FK referencing couple_sessions with ON DELETE CASCADE
-- (cascade matches the spirit of the existing card_sessions FK which also had CASCADE)
ALTER TABLE public.step_reflections
  ADD CONSTRAINT step_reflections_session_id_fkey
  FOREIGN KEY (session_id)
  REFERENCES public.couple_sessions(id)
  ON DELETE CASCADE;
