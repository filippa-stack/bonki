import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';
import WelcomePartner from '@/components/WelcomePartner';

export default function Index() {
  const { hasCompletedOnboarding, savedConversations, getAllSharedNotes, journeyState } = useApp();
  const { userRole } = useCoupleSpace();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
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
