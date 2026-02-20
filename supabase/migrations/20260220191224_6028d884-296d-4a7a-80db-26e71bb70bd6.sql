
CREATE OR REPLACE FUNCTION public.abandon_active_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  v_space_id uuid;
  v_status text;
BEGIN
  SELECT couple_space_id, status INTO v_space_id, v_status
  FROM public.couple_sessions WHERE id = p_session_id;

  IF v_space_id IS NULL THEN
    RAISE EXCEPTION 'session_not_found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.couple_members
    WHERE couple_space_id = v_space_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF v_status IS DISTINCT FROM 'active' THEN
    RETURN;
  END IF;

  UPDATE public.couple_sessions
  SET status = 'abandoned',
      ended_at = now()
  WHERE id = p_session_id
    AND status = 'active';
END;
$$;
