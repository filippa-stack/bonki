import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { usePartnerNotifications } from '@/hooks/usePartnerNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePendingInviteClaim, hasPendingInvite } from '@/hooks/usePendingInvite';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';
import PurchaseScreen from '@/components/PurchaseScreen';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const PURCHASE_KEY_LEGACY = 'still-us-purchased';
const PURCHASE_KEY_PREFIX = 'still-us-purchased-';
export const JOIN_INTENT_KEY = 'still-us-join-intent';

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasCompletedOnboarding } = useApp();
  const { userRole, space, memberCount, refreshSpace } = useCoupleSpaceContext();
  const { user } = useAuth();

  // Pending invite claim — auto-claims after OAuth redirect
  const { status: claimStatus, errorType: claimError, retry: retryClaim } = usePendingInviteClaim();

  // After claim succeeds, refresh couple space so memberCount/role are correct
  useEffect(() => {
    if (claimStatus === 'success') {
      refreshSpace();
    }
  }, [claimStatus, refreshSpace]);

  // Purchase state — DB (space.paid_at) is source of truth, localStorage fallback
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
    localStorage.removeItem(JOIN_INTENT_KEY);
    setHasPurchased(true);
    // Fall through to Home — invite/welcome handled there
  };

  // Show claiming state while invite is being processed
  if (claimStatus === 'claiming' || (hasPendingInvite() && claimStatus === 'idle')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-body text-gentle">Kopplar ihop er…</p>
        </div>
      </div>
    );
  }

  // Show error with retry if claim failed — never fall through to paywall
  if (claimStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-6 max-w-sm">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-body text-foreground">
            {t('join.error_network', 'Något gick fel. Försök igen.')}
          </p>
          <Button onClick={retryClaim} className="w-full">
            {t('general.start', 'Försök igen')}
          </Button>
        </div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  // ─── Paywall gate (space-level entitlement) ───
  const hasJoinIntent = localStorage.getItem(JOIN_INTENT_KEY) === 'true';
  const spaceIsEntitled = hasPurchased || userRole === 'partner_b';
  const shouldBypassPaywall = spaceIsEntitled || claimStatus === 'success' || hasPendingInvite() || hasJoinIntent;

  // Join-intent screen: user said "I have an invite" — route them to attach
  if (hasJoinIntent && !spaceIsEntitled) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="text-display text-foreground">Anslut till din partner</h1>
          <p className="text-body text-muted-foreground leading-relaxed">
            Ange koden eller öppna länken du fick. Du behöver inte köpa igen.
          </p>
          <Button onClick={() => navigate('/join')} className="w-full h-12 text-base font-medium">
            Anslut
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem(JOIN_INTENT_KEY);
              navigate('/');
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Jag har ingen kod
          </Button>
        </div>
      </div>
    );
  }

  // Show paywall only if not purchased AND no bypass reason
  if (!hasPurchased && !shouldBypassPaywall) {
    return <PurchaseScreen onPurchaseComplete={handlePurchaseComplete} />;
  }

  // All invite/welcome decisions are made in Home
  return <Home />;
}
