-- Add site_settings column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS site_settings JSONB DEFAULT NULL;