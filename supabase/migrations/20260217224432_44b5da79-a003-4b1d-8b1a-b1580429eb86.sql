-- Allow the responding partner to update proposals that are 'saved_for_later' (not just 'pending')
-- so they can decline a previously saved proposal via "Ta bort"
DROP POLICY "Partner can respond to proposal" ON public.topic_proposals;

CREATE POLICY "Partner can respond to proposal"
ON public.topic_proposals
FOR UPDATE
USING (
  is_couple_member(auth.uid(), couple_space_id)
  AND auth.uid() <> proposed_by
  AND status IN ('pending', 'saved_for_later')
)
WITH CHECK (
  status IN ('accepted', 'declined', 'saved_for_later')
);