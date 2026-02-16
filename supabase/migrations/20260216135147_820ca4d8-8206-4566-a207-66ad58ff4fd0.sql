
-- Create system_events table
CREATE TABLE public.system_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id),
  type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- SELECT: couple members can read events in their space
CREATE POLICY "Members can read events"
  ON public.system_events FOR SELECT
  USING (is_couple_member(auth.uid(), couple_space_id));

-- No INSERT/UPDATE/DELETE for clients — only service_role writes

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;
