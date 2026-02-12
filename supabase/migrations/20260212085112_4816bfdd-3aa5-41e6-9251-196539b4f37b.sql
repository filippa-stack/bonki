-- Table to track redundant/merged purchases for later refund processing
CREATE TABLE public.redundant_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  original_space_id uuid NOT NULL,
  merged_into_space_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamp with time zone,
  notes text
);

-- Enable RLS
ALTER TABLE public.redundant_purchases ENABLE ROW LEVEL SECURITY;

-- Only service role should access this (admin/support table)
-- No user-facing policies needed
