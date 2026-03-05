// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

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
  const { loading } = useNormalizedSessionContext();
  const devState = useDevState();

  // In dev mode, never redirect — allow free navigation
  if (devState) return <>{children}</>;

  // While loading normalized state, show branded breathing loader
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--surface-base)' }}>
      <div
        className="rounded-full"
        style={{
          width: '28px',
          height: '28px',
          backgroundColor: 'var(--accent-saffron)',
          opacity: 0.25,
          animation: 'skeletonPulse 1.8s ease-in-out infinite',
        }}
      />
    </div>
  );

  // Active session exists — allow all navigation, no forced redirect.
  // Guard is now a non-blocking monitor: it only prevents flicker during loading.
  return <>{children}</>;
}
