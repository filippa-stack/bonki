
-- Drop the existing partner response policy
DROP POLICY "Partner can respond to proposal" ON public.topic_proposals;

-- Recreate with saved_for_later allowed
CREATE POLICY "Partner can respond to proposal"
ON public.topic_proposals
FOR UPDATE
USING (
  is_couple_member(auth.uid(), couple_space_id)
  AND auth.uid() <> proposed_by
  AND status = 'pending'
)
WITH CHECK (
  status = ANY (ARRAY['accepted'::text, 'declined'::text, 'saved_for_later'::text])
);
