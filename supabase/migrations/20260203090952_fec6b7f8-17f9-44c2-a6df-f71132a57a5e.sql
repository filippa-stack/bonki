-- Replace the partial unique index with a real UNIQUE constraint on (user_id)
-- because PostgREST upsert on_conflict needs a matching UNIQUE constraint.

-- 1) Drop the partial unique index created earlier
DROP INDEX IF EXISTS public.user_settings_user_id_key;

-- 2) Add a true UNIQUE constraint (allows multiple NULLs)
ALTER TABLE public.user_settings
  ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);
