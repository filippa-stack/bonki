
-- Enforce one reflection per (session, step, user) at the database level.
-- This makes the upsert onConflict clause valid and prevents duplicate rows.
ALTER TABLE public.step_reflections
  ADD CONSTRAINT step_reflections_session_step_user_unique
  UNIQUE (session_id, step_index, user_id);
