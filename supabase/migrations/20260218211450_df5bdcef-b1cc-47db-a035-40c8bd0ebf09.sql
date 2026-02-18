-- Enable realtime on couple_members so partner_a receives live membership changes
-- when partner_b joins via invite
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'couple_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_members;
  END IF;
END $$;
