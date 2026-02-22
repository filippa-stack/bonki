
-- Create question_bookmarks table
CREATE TABLE public.question_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id),
  session_id UUID NOT NULL REFERENCES public.couple_sessions(id),
  card_id TEXT NOT NULL,
  stage_index INTEGER NOT NULL,
  prompt_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  bookmarked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Unique constraint: one bookmark per question per session per space
CREATE UNIQUE INDEX uq_question_bookmark
  ON public.question_bookmarks (couple_space_id, session_id, card_id, stage_index, prompt_index);

-- Enable RLS
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;

-- Members can read bookmarks in their space
CREATE POLICY "Members can read bookmarks"
  ON public.question_bookmarks
  FOR SELECT
  USING (is_couple_member(auth.uid(), couple_space_id));

-- Members can insert bookmarks
CREATE POLICY "Members can insert bookmarks"
  ON public.question_bookmarks
  FOR INSERT
  WITH CHECK (is_couple_member(auth.uid(), couple_space_id));

-- Members can update bookmarks (toggle is_active)
CREATE POLICY "Members can update bookmarks"
  ON public.question_bookmarks
  FOR UPDATE
  USING (is_couple_member(auth.uid(), couple_space_id));
