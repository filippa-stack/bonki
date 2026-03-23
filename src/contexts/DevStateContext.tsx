import { createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDevToolsEnabled } from '@/lib/devTools';
import type { DevState } from '@/hooks/useDevState';

const DEV_STATE_STORAGE_KEY = 'bonki-dev-state';

const VALID_STATES: DevState[] = [
  'solo', 'pairedIdle', 'pairedActive', 'proposalIncoming',
  'waiting', 'completed', 'archiveEmpty', 'archiveWithHistory', 'browse', 'library',
  'onboarding', 'productIntro', 'diary',
];

const DevStateContext = createContext<DevState>(null);

export function DevStateProvider({ children }: { children: React.ReactNode }) {
  const [params] = useSearchParams();

  const devState = useMemo<DevState>(() => {
    if (!isDevToolsEnabled()) return null;

    const raw = params.get('devState');
    if (!raw) {
      try {
        const persisted = sessionStorage.getItem(DEV_STATE_STORAGE_KEY);
        if (persisted && VALID_STATES.includes(persisted as DevState)) {
          return persisted as DevState;
        }
      } catch {}
      return null;
    }

    if (VALID_STATES.includes(raw as DevState)) {
      try {
        sessionStorage.setItem(DEV_STATE_STORAGE_KEY, raw);
      } catch {}
      return raw as DevState;
    }

    try {
      sessionStorage.removeItem(DEV_STATE_STORAGE_KEY);
    } catch {}

    console.warn(`[DevState] Unknown devState: "${raw}". Valid: ${VALID_STATES.join(', ')}`);
    return null;
  }, [params]);

  return (
    <DevStateContext.Provider value={devState}>
      {children}
    </DevStateContext.Provider>
  );
}

/** Read the global devState from context. Must be used within DevStateProvider. */
export function useDevState(): DevState {
  return useContext(DevStateContext);
}
