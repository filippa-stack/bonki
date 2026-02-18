// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

/**
 * useAppMode — single source of truth for the app's macro state.
 *
 * Derives mode from:
 *   - useNormalizedSessionState (couple_sessions via get_active_session_state RPC)
 *   - useCoupleSpace (membership count → solo vs paired, partner-left)
 *   - useProposals (incoming proposals)
 *   - useDevState (dev overrides)
 *
 * Returns only the macro classification. Session details must be read
 * directly from useNormalizedSessionContext by consumers.
 */

import { useMemo } from 'react';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useProposalsContext } from '@/contexts/ProposalsContext';
import { useDevState } from '@/contexts/DevStateContext';
import { DEV_MOCK } from '@/hooks/useDevState';

export type MacroMode =
  | 'loading'        // Data not yet resolved — render skeleton, no flicker
  | 'solo'           // displayMemberCount < 2
  | 'proposal'       // Paired, no active session, incoming proposal(s) present
  | 'idle'           // Paired, no active session, no proposals
  | 'active'         // Paired, active session (SESSION_ACTIVE or SESSION_WAITING)
  | 'partner_left';  // Was paired but partner left (memberCount dropped to 1 mid-session)

export interface ProposalInfo {
  id: string;
  card_id: string;
  category_id: string;
  message?: string | null;
  proposed_by: string;
}

export interface AppModeState {
  mode: MacroMode;
  loading: boolean;
  isSolo: boolean;
  hasSpace: boolean;
  /** Non-null when mode === 'proposal' */
  topProposal: ProposalInfo | null;
  /** All incoming proposals (unfiltered by dismissals — consumer handles that) */
  incomingProposals: ProposalInfo[];
}

export function useAppMode(): AppModeState {
  const devState = useDevState();
  const normalizedSession = useNormalizedSessionContext();
  const { space, displayMemberCount } = useCoupleSpaceContext();
  const { incomingProposals } = useProposalsContext();

  return useMemo<AppModeState>(() => {
    const hasSpace = !!space;
    const isSolo = displayMemberCount < 2;

    // ── Dev overrides ──
    if (devState) {
      const base = {
        incomingProposals: [] as ProposalInfo[],
        topProposal: null,
        hasSpace: true,
      };

      if (devState === 'solo') {
        return { ...base, mode: 'solo', loading: false, isSolo: true };
      }
      if (devState === 'pairedActive') {
        return { ...base, mode: 'active', loading: false, isSolo: false };
      }
      if (devState === 'proposalIncoming') {
        const mockProposal = DEV_MOCK.mockProposal as ProposalInfo;
        return {
          ...base,
          mode: 'proposal',
          loading: false,
          isSolo: false,
          incomingProposals: [mockProposal],
          topProposal: mockProposal,
        };
      }
      // pairedIdle, browse, etc.
      return { ...base, mode: 'idle', loading: false, isSolo: false };
    }

    // ── Loading gate: don't flicker ──
    if (normalizedSession.loading) {
      return {
        mode: 'loading',
        loading: true,
        topProposal: null,
        incomingProposals: [],
        isSolo,
        hasSpace,
      };
    }

    // ── Solo ──
    if (isSolo) {
      return {
        mode: 'solo',
        loading: false,
        topProposal: null,
        incomingProposals: [],
        isSolo: true,
        hasSpace,
      };
    }

    // ── Active session ──
    if (normalizedSession.appMode && normalizedSession.sessionId && normalizedSession.cardId) {
      return {
        mode: 'active',
        loading: false,
        topProposal: null,
        incomingProposals,
        isSolo: false,
        hasSpace,
      };
    }

    // ── Incoming proposals (paired, idle) ──
    if (incomingProposals.length > 0) {
      return {
        mode: 'proposal',
        loading: false,
        topProposal: incomingProposals[0],
        incomingProposals,
        isSolo: false,
        hasSpace,
      };
    }

    // ── Idle (paired, no session, no proposals) ──
    return {
      mode: 'idle',
      loading: false,
      topProposal: null,
      incomingProposals: [],
      isSolo: false,
      hasSpace,
    };
  }, [devState, normalizedSession, space, displayMemberCount, incomingProposals]);
}
