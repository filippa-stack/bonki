
CREATE OR REPLACE FUNCTION public.check_and_reveal_reflections()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_couple_space_id UUID;
  v_partner_state reflection_state;
BEGIN
  -- Only act when state just became 'ready'
  IF NEW.state <> 'ready' OR (OLD.state = 'ready') THEN
    RETURN NEW;
  END IF;

  -- Get the couple_space_id from couple_sessions (not card_sessions)
  SELECT cs.couple_space_id INTO v_couple_space_id
  FROM public.couple_sessions cs WHERE cs.id = NEW.session_id;

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
$function$
