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
    // [ACCESS-DIAG] effect-fire snapshot — also captures JWT sub for sanity.
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      console.info('[ACCESS-DIAG] useAllProductAccess effect', {
        authLoading,
        userId: user?.id,
        hasSession: !!sess.session,
        jwtSub: sess.session?.user?.id,
        ts: Date.now(),
      });
    })();

    // Wait for auth to finish hydrating before deciding anything.
    if (authLoading) {
      console.info('[ACCESS-DIAG] useAllProductAccess early-return', {
        reason: 'authLoading', userId: user?.id,
      });
      setLoading(true);
      return;
    }

    // Auth resolved with no user → definitive "no purchases".
    if (!user?.id) {
      console.info('[ACCESS-DIAG] useAllProductAccess early-return', {
        reason: 'noUser', userId: user?.id,
      });
      setPurchased(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const jwtSub = sess.session?.user?.id;
      console.info('[ACCESS-DIAG] useAllProductAccess query', {
        userId: user.id, jwtSub, ts: Date.now(),
      });

      const res = await supabase
        .from('user_product_access')
        .select('product_id')
        .eq('user_id', user.id);

      console.info('[ACCESS-DIAG] useAllProductAccess result', {
        userId: user.id,
        jwtSub,
        rows: res.data,
        rowCount: res.data?.length ?? 0,
        error: res.error,
        status: res.status,
        statusText: res.statusText,
        ts: Date.now(),
      });

      if (!cancelled) {
        setPurchased(new Set((res.data ?? []).map(r => r.product_id)));
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  return { purchased, loading };
}
