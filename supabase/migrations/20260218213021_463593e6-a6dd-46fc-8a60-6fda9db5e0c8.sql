-- Enable realtime on couple_spaces so User A receives immediate updates
-- when User B joins and the space row is mutated (partner_b_name, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'couple_spaces'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_spaces;
  END IF;
END $$;