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
 * Outputs a single, non-contradictory AppModeState that Home and other
 * consumers can switch on without re-deriving conditions.
 */

import { useMemo } from 'react';
import { useNormalizedSessionState, type NormalizedSessionState } from '@/hooks/useNormalizedSessionState';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useProposals } from '@/hooks/useProposals';
import { useDevState } from '@/contexts/DevStateContext';
import { DEV_MOCK } from '@/hooks/useDevState';

export type MacroMode =
  | 'loading'        // Data not yet resolved — render skeleton, no flicker
  | 'solo'           // displayMemberCount < 2
  | 'proposal'       // Paired, no active session, incoming proposal(s) present
  | 'idle'           // Paired, no active session, no proposals
  | 'active'         // Paired, active session (SESSION_ACTIVE or SESSION_WAITING)
  | 'partner_left';  // Was paired but partner left (memberCount dropped to 1 mid-session)

export interface ActiveSessionInfo {
  sessionId: string;
  cardId: string;
  categoryId: string;
  currentStepIndex: number;
  waiting: boolean;
}

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
  /** Non-null when mode === 'active' */
  activeSession: ActiveSessionInfo | null;
  /** Non-null when mode === 'proposal' */
  topProposal: ProposalInfo | null;
  /** All incoming proposals (unfiltered by dismissals — consumer handles that) */
  incomingProposals: ProposalInfo[];
  /** Raw normalized session state for advanced consumers */
  normalizedSession: NormalizedSessionState;
  /** Whether user is solo (displayMemberCount < 2) */
  isSolo: boolean;
  /** Whether a couple space exists */
  hasSpace: boolean;
}

export function useAppMode(): AppModeState {
  const devState = useDevState();
  const normalizedSession = useNormalizedSessionState();
  const { space, displayMemberCount } = useCoupleSpace();
  const { incomingProposals } = useProposals();

  return useMemo<AppModeState>(() => {
    const hasSpace = !!space;
    const isSolo = displayMemberCount < 2;

    // ── Dev overrides ──
    if (devState) {
      const base = {
        normalizedSession,
        incomingProposals: [] as ProposalInfo[],
        topProposal: null,
        activeSession: null,
        hasSpace: true,
      };

      if (devState === 'solo') {
        return { ...base, mode: 'solo', loading: false, isSolo: true };
      }
      if (devState === 'pairedActive') {
        return {
          ...base,
          mode: 'active',
          loading: false,
          isSolo: false,
          activeSession: {
            sessionId: 'dev-session',
            cardId: DEV_MOCK.mockSession.cardId,
            categoryId: DEV_MOCK.mockSession.categoryId,
            currentStepIndex: DEV_MOCK.mockSession.currentStepIndex,
            waiting: false,
          },
        };
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
        activeSession: null,
        topProposal: null,
        incomingProposals: [],
        normalizedSession,
        isSolo,
        hasSpace,
      };
    }

    // ── Solo ──
    if (isSolo) {
      return {
        mode: 'solo',
        loading: false,
        activeSession: null,
        topProposal: null,
        incomingProposals: [],
        normalizedSession,
        isSolo: true,
        hasSpace,
      };
    }

    // ── Active session ──
    if (normalizedSession.appMode && normalizedSession.sessionId && normalizedSession.cardId) {
      return {
        mode: 'active',
        loading: false,
        activeSession: {
          sessionId: normalizedSession.sessionId,
          cardId: normalizedSession.cardId,
          categoryId: normalizedSession.categoryId || '',
          currentStepIndex: normalizedSession.currentStepIndex,
          waiting: normalizedSession.waiting,
        },
        topProposal: null,
        incomingProposals,
        normalizedSession,
        isSolo: false,
        hasSpace,
      };
    }

    // ── Incoming proposals (paired, idle) ──
    if (incomingProposals.length > 0) {
      return {
        mode: 'proposal',
        loading: false,
        activeSession: null,
        topProposal: incomingProposals[0],
        incomingProposals,
        normalizedSession,
        isSolo: false,
        hasSpace,
      };
    }

    // ── Idle (paired, no session, no proposals) ──
    return {
      mode: 'idle',
      loading: false,
      activeSession: null,
      topProposal: null,
      incomingProposals: [],
      normalizedSession,
      isSolo: false,
      hasSpace,
    };
  }, [devState, normalizedSession, space, displayMemberCount, incomingProposals]);
}
