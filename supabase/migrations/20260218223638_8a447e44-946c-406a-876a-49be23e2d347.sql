
-- Add unique constraint for idempotent upsert (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'couple_card_visits_space_user_card_key'
  ) THEN
    ALTER TABLE public.couple_card_visits
      ADD CONSTRAINT couple_card_visits_space_user_card_key
      UNIQUE (couple_space_id, user_id, card_id);
  END IF;
END$$;

-- Index: space + recency (for selectCardVisitDates / snapshot ordering)
CREATE INDEX IF NOT EXISTS idx_couple_card_visits_space_visited_at
  ON public.couple_card_visits (couple_space_id, last_visited_at DESC);

-- Index: space + card (for per-card lookup)
CREATE INDEX IF NOT EXISTS idx_couple_card_visits_space_card
  ON public.couple_card_visits (couple_space_id, card_id);
