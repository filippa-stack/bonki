// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { Navigate, useLocation } from 'react-router-dom';
import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';

/**
 * Route guard: when an active session exists, only the active card route
 * and Home ("/") are allowed. All other routes redirect to the active card.
 * This enforces the "sacred session" principle — one intention at a time.
 *
 * Now reads from the normalized couple_sessions table via useNormalizedSessionState.
 * In devState, redirects are disabled so all routes remain navigable.
 */
export default function ActiveSessionGuard({ children }: { children: React.ReactNode }) {
  const { appMode, cardId, loading } = useNormalizedSessionContext();
  const location = useLocation();
  const devState = useDevState();

  // In dev mode, never redirect — allow free navigation
  if (devState) return <>{children}</>;

  // While loading normalized state, show neutral loader to prevent brief free navigation
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
    </div>
  );

  // No active session → allow everything
  if (!appMode || !cardId) return <>{children}</>;

  const activeCardPath = `/card/${cardId}`;
  const currentPath = location.pathname;

  // Allow: Home, active card, and revisit of the same card
  if (currentPath === '/' || currentPath === activeCardPath) {
    return <>{children}</>;
  }

  // DOUBLE-GUARD (intentional): This redirect is the second layer of "sacred session" enforcement.
  // The first layer is in Header.tsx, which hides navigation entry points (e.g. SharedSpaceLink)
  // during an active session. Both layers exist deliberately — Header prevents casual discovery,
  // while this guard catches direct URL manipulation, browser back/forward, and deep links.
  // Redundancy is intentional for a calm, escape-proof UX.
  return <Navigate to={activeCardPath} replace />;
}
