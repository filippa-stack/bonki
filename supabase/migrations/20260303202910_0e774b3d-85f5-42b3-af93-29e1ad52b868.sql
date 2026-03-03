
-- Add unique constraint on user_product_access for upsert support
ALTER TABLE public.user_product_access
  ADD CONSTRAINT user_product_access_user_product_unique UNIQUE (user_id, product_id);
