
-- 1. Products registry
CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read products"
  ON public.products FOR SELECT TO authenticated USING (true);

INSERT INTO public.products (id, name, is_active) VALUES ('still_us', 'Still Us', true);

-- 2. User product access
CREATE TABLE public.user_product_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text NOT NULL REFERENCES public.products(id),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_via text NOT NULL DEFAULT 'purchase',
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.user_product_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own access"
  ON public.user_product_access FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own access"
  ON public.user_product_access FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Add product_id to couple_sessions
ALTER TABLE public.couple_sessions
  ADD COLUMN IF NOT EXISTS product_id text NOT NULL DEFAULT 'still_us' REFERENCES public.products(id);

-- 4. Add product_id to step_reflections
ALTER TABLE public.step_reflections
  ADD COLUMN IF NOT EXISTS product_id text NOT NULL DEFAULT 'still_us' REFERENCES public.products(id);

-- 5. Add product_id to question_bookmarks
ALTER TABLE public.question_bookmarks
  ADD COLUMN IF NOT EXISTS product_id text NOT NULL DEFAULT 'still_us' REFERENCES public.products(id);
