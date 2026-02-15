
-- Create topic_proposals table for the premium proposal flow
CREATE TABLE public.topic_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id),
  card_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  proposed_by UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.topic_proposals ENABLE ROW LEVEL SECURITY;

-- Members can read proposals in their space
CREATE POLICY "Members can read proposals"
ON public.topic_proposals
FOR SELECT
USING (is_couple_member(auth.uid(), couple_space_id));

-- Members can create proposals in their space
CREATE POLICY "Members can create proposals"
ON public.topic_proposals
FOR INSERT
WITH CHECK (auth.uid() = proposed_by AND is_couple_member(auth.uid(), couple_space_id));

-- Members can update proposals in their space
CREATE POLICY "Members can update proposals"
ON public.topic_proposals
FOR UPDATE
USING (is_couple_member(auth.uid(), couple_space_id));

-- Trigger for updated_at
CREATE TRIGGER update_topic_proposals_updated_at
BEFORE UPDATE ON public.topic_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for proposals
ALTER PUBLICATION supabase_realtime ADD TABLE public.topic_proposals;
