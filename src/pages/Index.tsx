import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { usePartnerNotifications } from '@/hooks/usePartnerNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';
import WelcomePartner from '@/components/WelcomePartner';
import PurchaseScreen from '@/components/PurchaseScreen';
import PostPurchaseInvite from '@/components/PostPurchaseInvite';

const PURCHASE_KEY = 'still-us-purchased';

export default function Index() {
  const { hasCompletedOnboarding, savedConversations, getAllSharedNotes, journeyState } = useApp();
  const { userRole, space, memberCount } = useCoupleSpace();
  const { user } = useAuth();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  // Purchase state (mock — stored in localStorage)
  const [hasPurchased, setHasPurchased] = useState(() => {
    return localStorage.getItem(PURCHASE_KEY) === 'true';
  });
  const [showPostPurchaseInvite, setShowPostPurchaseInvite] = useState(false);

  usePartnerNotifications();

  const handlePurchaseComplete = () => {
    localStorage.setItem(PURCHASE_KEY, 'true');
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

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  // Purchase gate (skip for partner_b who joined via invite — they're already covered)
  if (!hasPurchased && userRole !== 'partner_b') {
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
