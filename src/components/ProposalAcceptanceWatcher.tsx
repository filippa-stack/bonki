/**
 * ProposalAcceptanceWatcher — REMOVED.
 *
 * Previously this watcher silently activated sessions when a partner accepted
 * a proposal. This constituted an invisible state mutation (auto-navigation)
 * that could hijack the user's current flow. Session activation now happens
 * only via explicit user action in the proposal decision surface.
 */
export default function ProposalAcceptanceWatcher() {
  return null;
}
