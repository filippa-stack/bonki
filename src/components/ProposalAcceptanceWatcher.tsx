import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
  const navigate = useNavigate();

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
          // Activate session via the secure edge function
          activateSession(proposal.id).then((result) => {
            if (result.success) {
              toast('Din partner accepterade förslaget!', {
                description: 'Samtalet är redo att börja',
                duration: 5000,
                action: {
                  label: 'Öppna',
                  onClick: () => navigate(`/card/${proposal.card_id}`),
                },
              });
            }
          });
        }
      }
    }

    prevOwnPendingIdsRef.current = ownPendingIds;
  }, [ownPendingIds, proposals, activateSession, navigate]);

  return null;
}
