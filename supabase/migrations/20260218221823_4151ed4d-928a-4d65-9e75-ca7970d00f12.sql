-- Create normalized card visit tracking table
CREATE TABLE public.couple_card_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  last_visited_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT couple_card_visits_unique UNIQUE (couple_space_id, user_id, card_id)
);

-- Index for efficient recency queries per space
CREATE INDEX idx_couple_card_visits_space_recency
  ON public.couple_card_visits (couple_space_id, last_visited_at DESC);

-- Enable RLS
ALTER TABLE public.couple_card_visits ENABLE ROW LEVEL SECURITY;

-- SELECT: any member of the space can read all visit rows (shared recency)
CREATE POLICY "Members can read card visits in space"
  ON public.couple_card_visits
  FOR SELECT
  USING (is_couple_member(auth.uid(), couple_space_id));

-- INSERT: only your own rows
CREATE POLICY "Users can insert own card visits"
  ON public.couple_card_visits
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_couple_member(auth.uid(), couple_space_id)
  );

-- UPDATE: only your own rows
CREATE POLICY "Users can update own card visits"
  ON public.couple_card_visits
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND is_couple_member(auth.uid(), couple_space_id)
  )
  WITH CHECK (
    auth.uid() = user_id
    AND is_couple_member(auth.uid(), couple_space_id)
  );