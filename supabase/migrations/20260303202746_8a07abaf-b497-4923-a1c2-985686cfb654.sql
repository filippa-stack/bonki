
-- Add price and Stripe metadata to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_sek integer,
  ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Update known products with prices
UPDATE public.products SET price_sek = 149 WHERE id = 'jag_i_mig';
UPDATE public.products SET price_sek = 149 WHERE id = 'jag_med_andra';
UPDATE public.products SET price_sek = 149 WHERE id = 'jag_i_varlden';
UPDATE public.products SET price_sek = 149 WHERE id = 'vardagskort';
UPDATE public.products SET price_sek = 149 WHERE id = 'syskonkort';
UPDATE public.products SET price_sek = 149 WHERE id = 'sexualitetskort';
UPDATE public.products SET price_sek = 295 WHERE id = 'still_us';
