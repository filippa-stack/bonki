/**
 * Screen 6 — Jag i Mig completion + takeaway. Renders the real
 * CompletedSessionView via the session-complete route (devState=completed).
 */
import RealAppFrame from './RealAppFrame';

export default function Screen6JimCompletion() {
  return <RealAppFrame src="/session/jim-glad/complete?demo=1&devState=completed" />;
}
