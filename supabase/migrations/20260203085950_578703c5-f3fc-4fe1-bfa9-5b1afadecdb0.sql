-- Create backups table for user settings snapshots
CREATE TABLE public.user_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  background_color TEXT,
  categories JSONB DEFAULT '[]'::jsonb,
  cards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for user lookups
CREATE INDEX idx_user_backups_user_id ON public.user_backups(user_id);

-- Enable RLS
ALTER TABLE public.user_backups ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies
CREATE POLICY "Users can read own backups"
ON public.user_backups
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own backups"
ON public.user_backups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backups"
ON public.user_backups
FOR DELETE
USING (auth.uid() = user_id);