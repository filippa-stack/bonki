
-- Table to store shared conversation progress within a couple space
CREATE TABLE public.couple_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  current_session JSONB DEFAULT NULL,
  journey_state JSONB DEFAULT NULL,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT couple_progress_space_unique UNIQUE (couple_space_id)
);

-- Enable RLS
ALTER TABLE public.couple_progress ENABLE ROW LEVEL SECURITY;

-- Members can read their space's progress
CREATE POLICY "Members can read progress"
  ON public.couple_progress FOR SELECT
  USING (is_couple_member(auth.uid(), couple_space_id));

-- Members can insert progress for their space
CREATE POLICY "Members can insert progress"
  ON public.couple_progress FOR INSERT
  WITH CHECK (is_couple_member(auth.uid(), couple_space_id));

-- Members can update progress for their space
CREATE POLICY "Members can update progress"
  ON public.couple_progress FOR UPDATE
  USING (is_couple_member(auth.uid(), couple_space_id));

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_progress;

-- Auto-update timestamp
CREATE TRIGGER update_couple_progress_updated_at
  BEFORE UPDATE ON public.couple_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
