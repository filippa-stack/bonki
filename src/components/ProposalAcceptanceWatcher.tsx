import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProposals } from '@/hooks/useProposals';

/**
 * Global watcher: detects when the current user's own pending proposal
 * gets accepted by partner. Activates the session via edge function and shows a toast.
 * Must be mounted inside AppProvider + AuthProvider.
 */
export default function ProposalAcceptanceWatcher() {
  const { user } = useAuth();
  const { proposals, activateSession } = useProposals();
  

  const ownPendingIds = useMemo(() => {
    return new Set(
      proposals
        .filter(p => p.status === 'pending' && p.proposed_by === user?.id)
        .map(p => p.id)
    );
  }, [proposals, user?.id]);

  const prevOwnPendingIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    // Skip the very first render to avoid false positives on mount
    if (!initializedRef.current) {
      prevOwnPendingIdsRef.current = ownPendingIds;
      initializedRef.current = true;
      return;
    }

    for (const prevId of prevOwnPendingIdsRef.current) {
      if (!ownPendingIds.has(prevId)) {
        const proposal = proposals.find(p => p.id === prevId && p.status === 'accepted');
        if (proposal) {
          // Activate session silently — the proposer already navigates
          // from their own UI context. No toast to avoid competing surfaces.
          activateSession(proposal.id);
        }
      }
    }

    prevOwnPendingIdsRef.current = ownPendingIds;
  }, [ownPendingIds, proposals, activateSession]);

  return null;
}
