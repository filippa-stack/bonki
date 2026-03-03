import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has purchased a specific product.
 * Returns { hasAccess, loading }.
 * 
 * The first card of every product is free (handled in UI),
 * this hook only checks the DB entitlement.
 */
export function useProductAccess(productId: string) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !productId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('user_product_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (!cancelled) {
        setHasAccess(!!data);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id, productId]);

  return { hasAccess, loading };
}
