
-- 1) State enum for step reflections
CREATE TYPE public.reflection_state AS ENUM ('draft', 'ready', 'revealed', 'locked');

-- 2) card_sessions table
CREATE TABLE public.card_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id),
  card_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.card_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read sessions"
  ON public.card_sessions FOR SELECT
  USING (is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Members can insert sessions"
  ON public.card_sessions FOR INSERT
  WITH CHECK (is_couple_member(auth.uid(), couple_space_id));

CREATE POLICY "Members can update sessions"
  ON public.card_sessions FOR UPDATE
  USING (is_couple_member(auth.uid(), couple_space_id));

-- 3) step_reflections table
CREATE TABLE public.step_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.card_sessions(id) ON DELETE CASCADE,
  step_index INT NOT NULL,
  user_id UUID NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  state public.reflection_state NOT NULL DEFAULT 'draft',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.step_reflections ENABLE ROW LEVEL SECURITY;

-- Users can read their own reflections, or revealed/locked reflections from their space
CREATE POLICY "Users can read own reflections"
  ON public.step_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read revealed reflections in space"
  ON public.step_reflections FOR SELECT
  USING (
    state IN ('revealed', 'locked')
    AND EXISTS (
      SELECT 1 FROM public.card_sessions cs
      WHERE cs.id = step_reflections.session_id
        AND is_couple_member(auth.uid(), cs.couple_space_id)
    )
  );

CREATE POLICY "Users can insert own reflections"
  ON public.step_reflections FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.card_sessions cs
      WHERE cs.id = step_reflections.session_id
        AND is_couple_member(auth.uid(), cs.couple_space_id)
    )
  );

CREATE POLICY "Users can update own reflections"
  ON public.step_reflections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Unique constraint: one reflection per user per step per session
CREATE UNIQUE INDEX uq_step_reflections_session_step_user
  ON public.step_reflections(session_id, step_index, user_id);

-- Auto-update updated_at
CREATE TRIGGER update_step_reflections_updated_at
  BEFORE UPDATE ON public.step_reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) card_takeaways table
CREATE TABLE public.card_takeaways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.card_sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  locked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.card_takeaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read takeaways"
  ON public.card_takeaways FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.card_sessions cs
      WHERE cs.id = card_takeaways.session_id
        AND is_couple_member(auth.uid(), cs.couple_space_id)
    )
  );

CREATE POLICY "Members can insert takeaways"
  ON public.card_takeaways FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.card_sessions cs
      WHERE cs.id = card_takeaways.session_id
        AND is_couple_member(auth.uid(), cs.couple_space_id)
    )
  );

CREATE POLICY "Members can update takeaways"
  ON public.card_takeaways FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.card_sessions cs
      WHERE cs.id = card_takeaways.session_id
        AND is_couple_member(auth.uid(), cs.couple_space_id)
    )
  );

-- Auto-update updated_at
CREATE TRIGGER update_card_takeaways_updated_at
  BEFORE UPDATE ON public.card_takeaways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for session-aware collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.step_reflections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_sessions;
