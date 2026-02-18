
-- RPC: upsert_card_visit with GREATEST semantics
-- last_visited_at is updated only if the new value is later than the stored one.
CREATE OR REPLACE FUNCTION public.upsert_card_visit(
  p_couple_space_id uuid,
  p_user_id        uuid,
  p_card_id        text,
  p_visited_at     timestamptz DEFAULT now()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Caller must be an active member of the space
  IF NOT public.is_couple_member(auth.uid(), p_couple_space_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  -- Caller may only record visits for themselves
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'user_mismatch';
  END IF;

  INSERT INTO public.couple_card_visits
    (couple_space_id, user_id, card_id, last_visited_at)
  VALUES
    (p_couple_space_id, p_user_id, p_card_id, p_visited_at)
  ON CONFLICT (couple_space_id, user_id, card_id)
  DO UPDATE SET
    last_visited_at = GREATEST(couple_card_visits.last_visited_at, EXCLUDED.last_visited_at);
END;
$$;
