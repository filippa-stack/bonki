
CREATE TABLE public.beta_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id),
  session_id uuid REFERENCES public.couple_sessions(id),
  response_text text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can insert feedback"
  ON public.beta_feedback FOR INSERT
  WITH CHECK (is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Members can read own feedback"
  ON public.beta_feedback FOR SELECT
  USING (is_couple_member(auth.uid(), couple_space_id));
