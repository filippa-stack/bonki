
CREATE OR REPLACE FUNCTION public.assert_one_active_session_per_space(p_couple_space_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.couple_sessions
  WHERE couple_space_id = p_couple_space_id AND status = 'active';

  IF v_count > 1 THEN
    RAISE EXCEPTION 'INVARIANT VIOLATED: % active sessions found for space %', v_count, p_couple_space_id;
  END IF;
END;
$$;
