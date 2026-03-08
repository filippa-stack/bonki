
CREATE TABLE public.onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  couple_space_id uuid REFERENCES public.couple_spaces(id),
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast funnel queries
CREATE INDEX idx_onboarding_events_type ON public.onboarding_events(event_type);
CREATE INDEX idx_onboarding_events_user ON public.onboarding_events(user_id);
CREATE INDEX idx_onboarding_events_created ON public.onboarding_events(created_at);

-- RLS: authenticated users can insert their own events
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON public.onboarding_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin/analytics read via service role; no SELECT for regular users needed
CREATE POLICY "Users can read own events"
  ON public.onboarding_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
