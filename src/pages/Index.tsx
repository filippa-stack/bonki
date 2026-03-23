import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { usePartnerNotifications } from '@/hooks/usePartnerNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useDevState } from '@/contexts/DevStateContext';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/lib/demoMode';
import Onboarding from '@/components/Onboarding';

import PurchaseScreen from '@/components/PurchaseScreen';
import ProductLibrary from '@/components/ProductLibrary';
import ProductIntro from '@/components/ProductIntro';
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

/** Dev-only: preview product intros with ?product=slug selector */
function DevProductIntroPreview() {
  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get('product');
  const product = allProducts.find((p) => p.slug === productSlug) ?? allProducts[0];

  return (
    <ProductIntro
      productId={product.id}
      accentColor={product.accentColor}
      backgroundColor={product.backgroundColor}
      freeCardId={product.freeCardId}
      onComplete={() => {}}
      onStartFreeCard={() => {}}
    />
  );
}

export default function Index() {
  const { hasCompletedOnboarding } = useApp();
  const { space } = useCoupleSpaceContext();
  const { user } = useAuth();
  const devState = useDevState();
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

  // devState=onboarding → show platform onboarding preview
  if (devState === 'onboarding') {
    return <Onboarding />;
  }

  // devState=productIntro → show product intro preview (uses ?product= param, defaults to first product)
  if (devState === 'productIntro') {
    return <DevProductIntroPreview />;
  }

  // devState=library → show product library lobby
  if (devState === 'library') {
    return <ProductLibrary />;
  }

  // devState=diary → navigate to diary preview (defaults to jag_i_mig, use ?product= to override)
  if (devState === 'diary') {
    const productSlug = new URLSearchParams(window.location.search).get('product') || 'jag_i_mig';
    return <Navigate to={`/diary/${productSlug}?devState=diary`} replace />;
  }

  // Any other devState bypasses onboarding & purchase gates but does NOT
  // force-redirect — let the normal flow decide what to render so that
  // the "Biblioteket" (house) icon in BottomNav can reach the library.
  const devBypassGates = !!devState;

  // ── Demo mode: skip onboarding gate ──
  const demoActive = isDemoMode();

  // ── Normal production flow ──
  if (!hasCompletedOnboarding && !demoActive) {
    return <Onboarding />;
  }

  // Post-purchase redirect: return user to the card they were trying to open
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('purchase') === 'success') {
    const returnCard = searchParams.get('returnCard');
    if (returnCard) {
      return <Navigate to={`/card/${returnCard}`} replace />;
    }
  }

  // Still Us legacy: ?product=still-us → canonical route
  if (searchParams.get('product') === 'still-us') {
    return <Navigate to="/product/still-us" replace />;
  }

  // Skip-to-product: returning users land on their last active product (cold start only)
  const skipToProductKey = 'bonki-skip-to-product-done';
  const lastProductSlug = localStorage.getItem('bonki-last-active-product');
  if (!sessionStorage.getItem(skipToProductKey)) {
    sessionStorage.setItem(skipToProductKey, '1');
    if (lastProductSlug) {
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
