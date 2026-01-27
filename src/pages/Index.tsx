import { useApp } from '@/contexts/AppContext';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';

export default function Index() {
  const { hasCompletedOnboarding } = useApp();

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return <Home />;
}
