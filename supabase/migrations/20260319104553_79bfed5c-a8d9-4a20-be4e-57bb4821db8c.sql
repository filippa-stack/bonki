-- Allow couple members (initiator or partner) to update specific ceremony/maintenance fields on couple_state
-- This is needed for CompletionCeremony (ceremony_reflection, phase) and Paywall (purchase_status, purchased_by)

CREATE POLICY "couple_state_update_member"
ON public.couple_state
FOR UPDATE
USING (
  (auth.uid())::text = initiator_id::text
  OR (auth.uid())::text = partner_id::text
)
WITH CHECK (
  (auth.uid())::text = initiator_id::text
  OR (auth.uid())::text = partner_id::text
);