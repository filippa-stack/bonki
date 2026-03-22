
-- Create a security definer function for the one-time paid_at → user_product_access migration
-- Only grants access if the user's couple_space actually has paid_at set
CREATE OR REPLACE FUNCTION public.migrate_product_access_if_paid(p_user_id uuid, p_paid_at timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify the user actually belongs to a paid couple space
  IF NOT EXISTS (
    SELECT 1 FROM couple_members cm
    JOIN couple_spaces cs ON cs.id = cm.couple_space_id
    WHERE cm.user_id = p_user_id
      AND cm.left_at IS NULL
      AND cm.status = 'active'
      AND cs.paid_at IS NOT NULL
  ) THEN
    RETURN;
  END IF;

  INSERT INTO user_product_access (user_id, product_id, granted_at, granted_via)
  VALUES (p_user_id, 'still_us', p_paid_at, 'purchase')
  ON CONFLICT (user_id, product_id) DO NOTHING;
END;
$$;
