
-- Drop the unique constraint on device_id
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_device_id_key;

-- Make device_id nullable (it may already allow NULL, but ensure it)
ALTER TABLE public.user_settings ALTER COLUMN device_id DROP NOT NULL;

-- Set default to NULL instead of requiring a value
ALTER TABLE public.user_settings ALTER COLUMN device_id SET DEFAULT NULL;
