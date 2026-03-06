DROP VIEW IF EXISTS public.couple_spaces_safe;
CREATE VIEW public.couple_spaces_safe
  WITH (security_invoker = true)
AS
  SELECT id, created_at, paid_at, partner_a_name, partner_b_name
  FROM public.couple_spaces;