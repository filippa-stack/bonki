import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { usePartnerNotifications } from '@/hooks/usePartnerNotifications';
import { supabase } from '@/integrations/supabase/client';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';
import PurchaseScreen from '@/components/PurchaseScreen';

const PURCHASE_KEY_LEGACY = 'still-us-purchased';
const PURCHASE_KEY_PREFIX = 'still-us-purchased-';

/** Check if a given space is paid — DB field wins, localStorage as fallback */
export function isSpacePaid(spaceId: string | null | undefined, paidAt?: string | null): boolean {
  if (paidAt) return true;
  if (spaceId && localStorage.getItem(`${PURCHASE_KEY_PREFIX}${spaceId}`) === 'true') return true;
  return localStorage.getItem(PURCHASE_KEY_LEGACY) === 'true';
}

async function markSpacePaidInDb(spaceId: string) {
  await supabase
    .from('couple_spaces')
    .update({ paid_at: new Date().toISOString() } as any)
    .eq('id', spaceId);
}

function markSpacePaid(spaceId: string | null | undefined) {
  if (spaceId) {
    localStorage.setItem(`${PURCHASE_KEY_PREFIX}${spaceId}`, 'true');
    markSpacePaidInDb(spaceId);
  }
  localStorage.setItem(PURCHASE_KEY_LEGACY, 'true');
}

export default function Index() {
  const { hasCompletedOnboarding } = useApp();
  const { space } = useCoupleSpaceContext();

  const [hasPurchased, setHasPurchased] = useState(() => isSpacePaid(space?.id, space?.paid_at));

  // Re-evaluate when space loads from DB
  useEffect(() => {
    if (space?.id && !hasPurchased && isSpacePaid(space.id, space.paid_at)) {
      setHasPurchased(true);
    }
  }, [space?.id, space?.paid_at, hasPurchased]);

  usePartnerNotifications();

  const handlePurchaseComplete = () => {
    markSpacePaid(space?.id);
    setHasPurchased(true);
  };

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  if (!hasPurchased) {
    return <PurchaseScreen onPurchaseComplete={handlePurchaseComplete} />;
  }

  return <Home />;
}
