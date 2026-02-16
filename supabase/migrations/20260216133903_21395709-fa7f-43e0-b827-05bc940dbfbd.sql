
-- Remove the permissive INSERT policy on couple_members.
-- All inserts now go through edge functions using service_role, which bypasses RLS.
-- This prevents any client-side insert, even with a valid JWT.
DROP POLICY IF EXISTS "Authenticated users can join a space" ON public.couple_members;
