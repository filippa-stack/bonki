-- Ensure user_settings supports upsert on user_id (logged-in users)
-- Create a partial unique index since user_id can be NULL for device-only rows.
CREATE UNIQUE INDEX IF NOT EXISTS user_settings_user_id_key
ON public.user_settings (user_id)
WHERE user_id IS NOT NULL;
