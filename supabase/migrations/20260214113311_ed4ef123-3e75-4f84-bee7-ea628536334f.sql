
ALTER TABLE public.user_settings
ADD CONSTRAINT user_settings_user_or_device_required
CHECK (user_id IS NOT NULL OR device_id IS NOT NULL);
