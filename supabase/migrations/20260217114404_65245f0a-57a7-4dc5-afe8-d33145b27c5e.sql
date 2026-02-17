
-- Remove the UPDATE policy on couple_sessions (state changes via server only)
drop policy if exists "Members can update sessions" on couple_sessions;
