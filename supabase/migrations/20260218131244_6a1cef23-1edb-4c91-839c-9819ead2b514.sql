
CREATE OR REPLACE FUNCTION public.lock_step_reflections(_session_id uuid, _step_index integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_couple_space_id UUID;
  v_count INT;
BEGIN
  -- Derive couple_space_id from couple_sessions (not card_sessions)
  SELECT cs.couple_space_id INTO v_couple_space_id
  FROM public.couple_sessions cs WHERE cs.id = _session_id;

  IF v_couple_space_id IS NULL OR NOT is_couple_member(auth.uid(), v_couple_space_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Verify both reflections are in 'revealed' state
  SELECT COUNT(*) INTO v_count
  FROM step_reflections
  WHERE session_id = _session_id
    AND step_index = _step_index
    AND state = 'revealed';

  IF v_count < 2 THEN
    RAISE EXCEPTION 'Both reflections must be revealed before locking';
  END IF;

  -- Lock both
  UPDATE step_reflections
  SET state = 'locked'
  WHERE session_id = _session_id
    AND step_index = _step_index
    AND state = 'revealed';
END;
$function$
