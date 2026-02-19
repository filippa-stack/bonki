/**
 * useAppMode — Volume 1 macro state.
 *
 * Mode derives solely from normalized session state:
 *   loading → active → idle
 */

import { useMemo } from 'react';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useDevState } from '@/contexts/DevStateContext';

export type MacroMode = 'loading' | 'active' | 'idle';

export interface AppModeState {
  mode: MacroMode;
  loading: boolean;
  hasSpace: boolean;
}

export function useAppMode(): AppModeState {
  const devState = useDevState();
  const normalizedSession = useNormalizedSessionContext();

  return useMemo<AppModeState>(() => {
    if (devState) {
      if (devState === 'pairedActive') {
        return { mode: 'active', loading: false, hasSpace: true };
      }
      return { mode: 'idle', loading: false, hasSpace: true };
    }

    if (normalizedSession.loading) {
      return { mode: 'loading', loading: true, hasSpace: true };
    }

    if (normalizedSession.sessionId && normalizedSession.cardId) {
      return { mode: 'active', loading: false, hasSpace: true };
    }

    return { mode: 'idle', loading: false, hasSpace: true };
  }, [devState, normalizedSession]);
}
