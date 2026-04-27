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
    // [ACCESS-DIAG] effect-fire snapshot — also captures JWT sub for sanity.
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      console.info('[ACCESS-DIAG] useProductAccess effect', {
        productId,
        authLoading,
        userId: user?.id,
        hasSession: !!sess.session,
        jwtSub: sess.session?.user?.id,
        ts: Date.now(),
      });
    })();

    // Wait for auth to finish hydrating before deciding anything.
    if (authLoading) {
      console.info('[ACCESS-DIAG] useProductAccess early-return', {
        reason: 'authLoading', productId, userId: user?.id,
      });
      setLoading(true);
      return;
    }

    // Auth resolved with no user, or no productId → definitive "no access".
    if (!user?.id || !productId) {
      console.info('[ACCESS-DIAG] useProductAccess early-return', {
        reason: !user?.id ? 'noUser' : 'noProductId',
        productId, userId: user?.id,
      });
      setHasAccess(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const jwtSub = sess.session?.user?.id;
      console.info('[ACCESS-DIAG] useProductAccess query', {
        productId, userId: user.id, jwtSub, ts: Date.now(),
      });

      const res = await supabase
        .from('user_product_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      console.info('[ACCESS-DIAG] useProductAccess result', {
        productId,
        userId: user.id,
        jwtSub,
        data: res.data,
        error: res.error,
        status: res.status,
        statusText: res.statusText,
        ts: Date.now(),
      });

      if (!cancelled) {
        setHasAccess(!!res.data);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id, productId]);

  return { hasAccess, loading };
}
