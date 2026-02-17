
-- Add paid_at column to couple_spaces
ALTER TABLE public.couple_spaces ADD COLUMN paid_at timestamptz DEFAULT NULL;

-- Recreate the safe view to include paid_at
CREATE OR REPLACE VIEW public.couple_spaces_safe
WITH (security_invoker = on)
AS
SELECT id, partner_a_name, partner_b_name, created_at, paid_at
FROM public.couple_spaces;
