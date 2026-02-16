
-- 1. Extend topic_proposals with response tracking + expiry
ALTER TABLE public.topic_proposals
  ADD COLUMN IF NOT EXISTS accepted_by uuid NULL,
  ADD COLUMN IF NOT EXISTS declined_by uuid NULL,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NULL DEFAULT (now() + interval '48 hours');

-- 2. Drop the existing broad UPDATE policy
DROP POLICY IF EXISTS "Members can update proposals" ON public.topic_proposals;

-- 3. Split UPDATE into two targeted policies:

-- A) Proposer can only edit message while still pending
CREATE POLICY "Proposer can edit pending proposal"
  ON public.topic_proposals
  FOR UPDATE
  USING (
    auth.uid() = proposed_by
    AND status = 'pending'
  )
  WITH CHECK (
    status = 'pending'
  );

-- B) Partner (not proposer) can accept or decline a pending proposal
CREATE POLICY "Partner can respond to proposal"
  ON public.topic_proposals
  FOR UPDATE
  USING (
    is_couple_member(auth.uid(), couple_space_id)
    AND auth.uid() != proposed_by
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('accepted', 'declined')
    AND responded_at IS NOT NULL
  );

-- 4. Restrict couple_progress UPDATE so clients can only update
--    journey_state and updated_by (not current_session directly).
--    current_session will be set by the activate edge function via service_role.
--    NOTE: We keep the existing policy for now since journey_state updates
--    (step completions, exploredCardIds) still come from the client.
--    The activate function uses service_role which bypasses RLS.
