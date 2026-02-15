-- Make the unique index creation idempotent
-- The index already exists in production, so this is a no-op safety wrapper
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'couple_members' 
    AND indexname = 'couple_members_user_id_key'
  ) THEN
    CREATE UNIQUE INDEX couple_members_user_id_key ON public.couple_members (user_id);
  END IF;
END $$;
