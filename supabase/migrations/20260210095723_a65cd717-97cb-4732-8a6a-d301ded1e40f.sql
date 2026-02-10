
-- Remove overly permissive policy; join flow will use edge function
DROP POLICY IF EXISTS "Anyone can read space by invite token" ON public.couple_spaces;
