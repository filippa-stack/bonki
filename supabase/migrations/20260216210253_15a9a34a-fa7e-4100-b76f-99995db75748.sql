
-- 1) Trigger: when a step_reflection transitions to 'ready', check if partner is also ready → reveal both
CREATE OR REPLACE FUNCTION public.check_and_reveal_reflections()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_couple_space_id UUID;
  v_partner_state reflection_state;
BEGIN
  -- Only act when state just became 'ready'
  IF NEW.state <> 'ready' OR (OLD.state = 'ready') THEN
    RETURN NEW;
  END IF;

  -- Get the couple_space_id from the session
  SELECT cs.couple_space_id INTO v_couple_space_id
  FROM card_sessions cs WHERE cs.id = NEW.session_id;

  -- Check if partner has a 'ready' reflection for the same session + step
  SELECT sr.state INTO v_partner_state
  FROM step_reflections sr
  WHERE sr.session_id = NEW.session_id
    AND sr.step_index = NEW.step_index
    AND sr.user_id <> NEW.user_id
    AND sr.state = 'ready'
  LIMIT 1;

  -- If partner is also ready, reveal both
  IF v_partner_state = 'ready' THEN
    UPDATE step_reflections
    SET state = 'revealed'
    WHERE session_id = NEW.session_id
      AND step_index = NEW.step_index
      AND state = 'ready';

    -- Return NEW with revealed state since this row was also updated
    NEW.state := 'revealed';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_reveal_reflections
  BEFORE UPDATE ON public.step_reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_reveal_reflections();

-- 2) RPC: lock both reflections for a step (revealed → locked)
CREATE OR REPLACE FUNCTION public.lock_step_reflections(
  _session_id UUID,
  _step_index INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_couple_space_id UUID;
  v_count INT;
BEGIN
  -- Verify caller is a member of this session's space
  SELECT cs.couple_space_id INTO v_couple_space_id
  FROM card_sessions cs WHERE cs.id = _session_id;

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
$$;
