import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns a Set of product IDs the current user has purchased.
 * Single query for all products — efficient for the lobby.
 */
export function useAllProductAccess() {
  const { user } = useAuth();
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

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
  }, [user?.id]);

  return { purchased, loading };
}
