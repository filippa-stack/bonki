
-- 1. Fix couple_spaces_safe view: recreate with security_invoker so RLS on couple_spaces applies
DROP VIEW IF EXISTS public.couple_spaces_safe;
CREATE VIEW public.couple_spaces_safe
WITH (security_invoker = on) AS
  SELECT id, created_at, paid_at, partner_a_name, partner_b_name
  FROM public.couple_spaces;

-- 2. Fix privilege escalation: remove user-facing INSERT on user_product_access
-- Only server-side (service role / edge functions) should grant product access
DROP POLICY IF EXISTS "Users can insert own access" ON public.user_product_access;
