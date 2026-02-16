
-- Per-user journey metadata (explored cards, visit dates, etc.)
-- Separate from couple_progress which is server-authoritative only.
CREATE TABLE public.couple_journey_meta (
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id),
  user_id uuid NOT NULL,
  journey_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (couple_space_id, user_id)
);

-- Enable RLS
ALTER TABLE public.couple_journey_meta ENABLE ROW LEVEL SECURITY;

-- SELECT: any couple member can read all meta in their space
CREATE POLICY "Members can read journey meta"
ON public.couple_journey_meta
FOR SELECT
USING (is_couple_member(auth.uid(), couple_space_id));

-- INSERT: only own rows, must be member
CREATE POLICY "Members can insert own journey meta"
ON public.couple_journey_meta
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_couple_member(auth.uid(), couple_space_id));

-- UPDATE: only own rows, must be member
CREATE POLICY "Members can update own journey meta"
ON public.couple_journey_meta
FOR UPDATE
USING (auth.uid() = user_id AND is_couple_member(auth.uid(), couple_space_id));

-- No DELETE policy — blocked by default

-- Trigger for updated_at
CREATE TRIGGER update_couple_journey_meta_updated_at
BEFORE UPDATE ON public.couple_journey_meta
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for partner sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_journey_meta;
