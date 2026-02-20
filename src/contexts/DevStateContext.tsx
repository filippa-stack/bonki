import { createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDevToolsEnabled } from '@/lib/devTools';
import type { DevState } from '@/hooks/useDevState';

const VALID_STATES: DevState[] = [
  'solo', 'pairedIdle', 'pairedActive', 'proposalIncoming',
  'waiting', 'completed', 'archiveEmpty', 'archiveWithHistory', 'browse',
];

const DevStateContext = createContext<DevState>(null);

export function DevStateProvider({ children }: { children: React.ReactNode }) {
  const [params] = useSearchParams();

  const devState = useMemo<DevState>(() => {
    if (!isDevToolsEnabled()) return null;

    const raw = params.get('devState');
    if (!raw) return null;

    if (VALID_STATES.includes(raw as DevState)) {
      return raw as DevState;
    }

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
