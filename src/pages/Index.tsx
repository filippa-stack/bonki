import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { usePartnerNotifications } from '@/hooks/usePartnerNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePendingInviteClaim, hasPendingInvite } from '@/hooks/usePendingInvite';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';
import WelcomePartner from '@/components/WelcomePartner';
import PurchaseScreen from '@/components/PurchaseScreen';
import PostPurchaseInvite from '@/components/PostPurchaseInvite';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const PURCHASE_KEY = 'still-us-purchased';
export const JOIN_INTENT_KEY = 'still-us-join-intent';

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasCompletedOnboarding, savedConversations, getAllSharedNotes, journeyState } = useApp();
  const { userRole, space, memberCount } = useCoupleSpace();
  const { user } = useAuth();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  // Pending invite claim — auto-claims after OAuth redirect
  const { status: claimStatus, errorType: claimError, retry: retryClaim } = usePendingInviteClaim();

  // Purchase state (mock — stored in localStorage)
  const [hasPurchased, setHasPurchased] = useState(() => {
    return localStorage.getItem(PURCHASE_KEY) === 'true';
  });
  const [showPostPurchaseInvite, setShowPostPurchaseInvite] = useState(false);

  usePartnerNotifications();

  const handlePurchaseComplete = () => {
    localStorage.setItem(PURCHASE_KEY, 'true');
    localStorage.removeItem(JOIN_INTENT_KEY);
    setHasPurchased(true);
    setShowPostPurchaseInvite(true);
  };

  const handleUpdateName = async (name: string) => {
    if (!space || !user) return;
    const role = userRole === 'partner_b' ? 'partner_b_name' : 'partner_a_name';
    await supabase
      .from('couple_spaces')
      .update({ [role]: name })
      .eq('id', space.id);
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

  // ─── Paywall gate ───
  const isAlreadyMember = memberCount >= 1;
  const hasJoinIntent = localStorage.getItem(JOIN_INTENT_KEY) === 'true';
  const shouldBypassPaywall = isAlreadyMember || userRole === 'partner_b' || claimStatus === 'success' || hasPendingInvite() || hasJoinIntent;

  // Join-intent screen: user said "I have an invite" — route them to attach
  if (hasJoinIntent && !hasPurchased && !isAlreadyMember) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="text-display text-foreground">Anslut till din partner</h1>
          <p className="text-body text-muted-foreground leading-relaxed">
            Ange koden eller öppna länken du fick. Du behöver inte köpa igen.
          </p>
          <Button onClick={() => navigate('/join')} className="w-full h-12 text-base font-medium">
            Gå till anslutning
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem(JOIN_INTENT_KEY);
              window.location.reload();
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

  // Post-purchase invite flow
  if (showPostPurchaseInvite && space && memberCount < 2) {
    const partnerName = userRole === 'partner_b' ? space.partner_b_name : space.partner_a_name;
    return (
      <PostPurchaseInvite
        inviteCode={space.invite_code}
        inviteToken={space.invite_token}
        partnerName={partnerName}
        onUpdateName={handleUpdateName}
        onContinue={() => setShowPostPurchaseInvite(false)}
      />
    );
  }

  // Show welcome screen for partner_b when the space is empty
  const sharedNotes = getAllSharedNotes();
  const hasActivity =
    savedConversations.length > 0 ||
    Object.keys(sharedNotes).length > 0 ||
    (journeyState?.exploredCardIds && journeyState.exploredCardIds.length > 0);

  if (userRole === 'partner_b' && !hasActivity && !welcomeDismissed) {
    return <WelcomePartner onDismiss={() => setWelcomeDismissed(true)} />;
  }

  return <Home />;
}
