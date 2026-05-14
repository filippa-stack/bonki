CREATE TABLE public.purchase_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_email text NOT NULL,
  source_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  products_linked integer NOT NULL DEFAULT 0,
  products_already_owned integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('success', 'no_purchases_found', 'source_not_found', 'error')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_link_audit_requester
  ON public.purchase_link_audit(requester_user_id, created_at DESC);

ALTER TABLE public.purchase_link_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own audit rows"
  ON public.purchase_link_audit
  FOR SELECT
  USING (auth.uid() = requester_user_id);