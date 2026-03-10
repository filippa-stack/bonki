
CREATE TABLE public.product_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE public.product_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own interest"
  ON public.product_interest FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own interest"
  ON public.product_interest FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interest"
  ON public.product_interest FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
