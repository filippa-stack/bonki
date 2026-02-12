
CREATE POLICY "Users can read own redundant purchases"
  ON public.redundant_purchases
  FOR SELECT
  USING (auth.uid() = user_id);
