
-- Create reflection_responses table
CREATE TABLE public.reflection_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id UUID NOT NULL REFERENCES public.prompt_notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reflection_id, user_id)
);

ALTER TABLE public.reflection_responses ENABLE ROW LEVEL SECURITY;

-- SELECT: must be couple member
CREATE POLICY "Users can read responses in own space"
ON public.reflection_responses FOR SELECT
USING (is_couple_member(auth.uid(), couple_space_id));

-- INSERT: own row + must be couple member
CREATE POLICY "Users can insert own responses"
ON public.reflection_responses FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_couple_member(auth.uid(), couple_space_id));

-- UPDATE: own row + must be couple member
CREATE POLICY "Users can update own responses"
ON public.reflection_responses FOR UPDATE
USING (auth.uid() = user_id AND is_couple_member(auth.uid(), couple_space_id))
WITH CHECK (auth.uid() = user_id);

-- DELETE: own row + must be couple member
CREATE POLICY "Users can delete own responses"
ON public.reflection_responses FOR DELETE
USING (auth.uid() = user_id AND is_couple_member(auth.uid(), couple_space_id));

-- Auto-update updated_at
CREATE TRIGGER update_reflection_responses_updated_at
BEFORE UPDATE ON public.reflection_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
