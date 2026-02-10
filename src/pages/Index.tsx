import { useApp } from '@/contexts/AppContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';

export default function Index() {
  const { hasCompletedOnboarding } = useApp();
  // Bootstrap couple space on first login
  useCoupleSpace();

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return <Home />;
}
