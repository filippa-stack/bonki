import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useDevState } from '@/contexts/DevStateContext';

/**
 * Route guard: when an active session exists, only the active card route
 * and Home ("/") are allowed. All other routes redirect to the active card.
 * This enforces the "sacred session" principle — one intention at a time.
 *
 * In devState, redirects are disabled so all routes remain navigable.
 */
export default function ActiveSessionGuard({ children }: { children: React.ReactNode }) {
  const { currentSession } = useApp();
  const location = useLocation();
  const devState = useDevState();

  // In dev mode, never redirect — allow free navigation
  if (devState) return <>{children}</>;

  if (!currentSession) return <>{children}</>;

  const activeCardPath = `/card/${currentSession.cardId}`;
  const currentPath = location.pathname;

  // Allow: Home, active card, and revisit of the same card
  if (currentPath === '/' || currentPath === activeCardPath) {
    return <>{children}</>;
  }

  // Everything else redirects to the active session card
  return <Navigate to={activeCardPath} replace />;
}
