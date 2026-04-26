import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns a Set of product IDs the current user has purchased.
 * Single query for all products — efficient for the lobby.
 *
 * Honors `auth.loading` so the lobby never paints "unpurchased"
 * tiles for one frame during cold-start auth hydration.
 */
export function useAllProductAccess() {
  const { user, loading: authLoading } = useAuth();
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  // Start in loading=true so the first render never reports an empty Set
  // before AuthContext has resolved getSession().
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish hydrating before deciding anything.
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Auth resolved with no user → definitive "no purchases".
    if (!user?.id) {
      setPurchased(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data } = await supabase
        .from('user_product_access')
        .select('product_id')
        .eq('user_id', user.id);

      if (!cancelled) {
        setPurchased(new Set((data ?? []).map(r => r.product_id)));
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  return { purchased, loading };
}
