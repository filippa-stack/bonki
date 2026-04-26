import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has purchased a specific product.
 * Returns { hasAccess, loading }.
 *
 * The first card of every product is free (handled in UI),
 * this hook only checks the DB entitlement.
 *
 * Honors `auth.loading` so callers never see a transient
 * `hasAccess: false, loading: false` window during cold-start
 * auth hydration (which would briefly flash the paywall).
 */
export function useProductAccess(productId: string) {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  // Start in loading=true so the first render never reports a false negative
  // before AuthContext has resolved getSession().
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish hydrating before deciding anything.
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Auth resolved with no user, or no productId → definitive "no access".
    if (!user?.id || !productId) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

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
  }, [authLoading, user?.id, productId]);

  return { hasAccess, loading };
}
