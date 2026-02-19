/**
 * useAppMode — Volume 1 macro state.
 *
 * Mode derives solely from normalized session state:
 *   loading → active → idle
 *
 * No partner/proposal/memberCount logic.
 */

import { useMemo } from 'react';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useDevState } from '@/contexts/DevStateContext';

export type MacroMode = 'loading' | 'active' | 'idle';

export interface AppModeState {
  mode: MacroMode;
  loading: boolean;
  /** Kept for compatibility — always false in V1 */
  isSolo: boolean;
  hasSpace: boolean;
  /** Kept for compatibility — always null in V1 */
  topProposal: null;
  /** Kept for compatibility — always empty in V1 */
  incomingProposals: [];
}

export function useAppMode(): AppModeState {
  const devState = useDevState();
  const normalizedSession = useNormalizedSessionContext();

  return useMemo<AppModeState>(() => {
    // Dev overrides
    if (devState) {
      if (devState === 'pairedActive') {
        return { mode: 'active', loading: false, isSolo: false, hasSpace: true, topProposal: null, incomingProposals: [] };
      }
      // pairedIdle, browse, solo, etc.
      return { mode: 'idle', loading: false, isSolo: false, hasSpace: true, topProposal: null, incomingProposals: [] };
    }

    // Loading gate
    if (normalizedSession.loading) {
      return { mode: 'loading', loading: true, isSolo: false, hasSpace: true, topProposal: null, incomingProposals: [] };
    }

    // Active session
    if (normalizedSession.sessionId && normalizedSession.cardId) {
      return { mode: 'active', loading: false, isSolo: false, hasSpace: true, topProposal: null, incomingProposals: [] };
    }

    // Idle
    return { mode: 'idle', loading: false, isSolo: false, hasSpace: true, topProposal: null, incomingProposals: [] };
  }, [devState, normalizedSession]);
}
