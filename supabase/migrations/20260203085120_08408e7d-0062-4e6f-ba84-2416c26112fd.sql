-- Add user_id column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id lookups
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Anyone can read their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Anyone can update their own settings" ON public.user_settings;

-- Create new secure RLS policies that enforce user isolation
CREATE POLICY "Users can read own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
ON public.user_settings
FOR DELETE
USING (auth.uid() = user_id);