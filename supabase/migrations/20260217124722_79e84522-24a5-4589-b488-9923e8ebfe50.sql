
-- Ensure the composite type exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'step_completion_result') THEN
    CREATE TYPE public.step_completion_result AS (
      is_waiting boolean,
      is_step_complete boolean,
      is_session_complete boolean,
      partner_left boolean
    );
  END IF;
END;
$$;
