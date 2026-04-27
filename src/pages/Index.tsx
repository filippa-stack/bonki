import { useEffect, useRef } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { usePartnerNotifications } from '@/hooks/usePartnerNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';
import { supabase } from '@/integrations/supabase/client';

import ProductLibrary from '@/components/ProductLibrary';
import { allProducts } from '@/data/products';


const PURCHASE_KEY_LEGACY = 'still-us-purchased';
const PURCHASE_KEY_PREFIX = 'still-us-purchased-';

/** Check if a given space is paid — DB field wins, localStorage as fallback */
export function isSpacePaid(spaceId: string | null | undefined, paidAt?: string | null): boolean {
  if (paidAt) return true;
  if (spaceId && localStorage.getItem(`${PURCHASE_KEY_PREFIX}${spaceId}`) === 'true') return true;
  return localStorage.getItem(PURCHASE_KEY_LEGACY) === 'true';
}

async function markSpacePaidInDb(spaceId: string) {
  const { error } = await supabase
    .from('couple_spaces')
    .update({ paid_at: new Date().toISOString() } as any)
    .eq('id', spaceId);
  if (error) {
    console.error('[markSpacePaidInDb] Failed to update paid_at:', error.message);
  }
}

function markSpacePaid(spaceId: string | null | undefined) {
  if (spaceId) {
    localStorage.setItem(`${PURCHASE_KEY_PREFIX}${spaceId}`, 'true');
    markSpacePaidInDb(spaceId);
  }
  localStorage.setItem(PURCHASE_KEY_LEGACY, 'true');
}

/** One-time migration: copy paid_at into user_product_access via secure RPC */
async function migrateProductAccess(userId: string, paidAt: string) {
  const { error } = await supabase.rpc('migrate_product_access_if_paid', {
    p_user_id: userId,
    p_paid_at: paidAt,
  });
  if (error) {
    console.warn('[migrateProductAccess] RPC failed:', error.message);
  }
}

export default function Index() {
  const { } = useApp();
  const { space } = useCoupleSpaceContext();
  const { user } = useAuth();
  useThemeSwitcher();

  const migrationRan = useRef(false);

  // One-time migration: paid_at → user_product_access
  useEffect(() => {
    if (migrationRan.current) return;
    if (!user?.id || !space?.paid_at) return;
    migrationRan.current = true;
    migrateProductAccess(user.id, space.paid_at);
  }, [user?.id, space?.paid_at]);

  usePartnerNotifications();

  // Post-purchase redirect: return user to the card they were trying to open
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('purchase') === 'success') {
    const returnCard = searchParams.get('returnCard');
    const purchasedProductId = searchParams.get('product');
    const purchasedProduct = purchasedProductId ? allProducts.find(p => p.id === purchasedProductId) : null;
    window.history.replaceState({}, '', window.location.pathname);
    if (returnCard) {
      return <Navigate to={`/card/${returnCard}`} replace />;
    }
    if (purchasedProduct) {
      return <Navigate to={`/product/${purchasedProduct.slug}`} replace />;
    }
  }

  // Still Us legacy: ?product=still-us → canonical route
  if (searchParams.get('product') === 'still-us') {
    return <Navigate to="/product/still-us" replace />;
  }

  const libraryNavFlag = sessionStorage.getItem('bonki-navigating-to-library');
  if (libraryNavFlag) sessionStorage.removeItem('bonki-navigating-to-library');

  // Skip-to-product: returning users land on their last active product (cold start only)
  const skipToProductKey = 'bonki-skip-to-product-done';
  const lastProductSlug = localStorage.getItem('bonki-last-active-product');
  if (!sessionStorage.getItem(skipToProductKey)) {
    sessionStorage.setItem(skipToProductKey, '1');
    if (lastProductSlug && !libraryNavFlag) {
      return <Navigate to={`/product/${lastProductSlug}`} replace />;
    }
  }

  // Par first visit: route directly to Still Us product home (only if no last-active-product)
  const initialTab = localStorage.getItem('bonki-initial-tab');
  if (initialTab === 'par' && !lastProductSlug) {
    const parFirstVisitKey = 'bonki-par-first-visit-done';
    if (!sessionStorage.getItem(parFirstVisitKey)) {
      sessionStorage.setItem(parFirstVisitKey, '1');
      return <Navigate to="/product/still-us" replace />;
    }
  }

  // After onboarding → ProductLibrary (the Lobby)
  // Users choose their product from here.
  return <ProductLibrary />;
}
