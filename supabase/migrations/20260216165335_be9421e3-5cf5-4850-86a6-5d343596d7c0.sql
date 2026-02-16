-- Allow proposers to withdraw (invalidate) their own pending proposals
-- by updating status to 'withdrawn'
DROP POLICY IF EXISTS "Proposer can edit pending proposal" ON public.topic_proposals;

CREATE POLICY "Proposer can edit pending proposal"
ON public.topic_proposals
FOR UPDATE
USING (auth.uid() = proposed_by AND status = 'pending')
WITH CHECK (status IN ('pending', 'withdrawn'));
