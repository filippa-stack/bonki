// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import React, { createContext, useContext } from 'react';
import { useNormalizedSessionState, type NormalizedSessionState } from '@/hooks/useNormalizedSessionState';

const NormalizedSessionContext = createContext<NormalizedSessionState | null>(null);

export function NormalizedSessionProvider({ children }: { children: React.ReactNode }) {
  const value = useNormalizedSessionState();
  return (
    <NormalizedSessionContext.Provider value={value}>
      {children}
    </NormalizedSessionContext.Provider>
  );
}

export function useNormalizedSessionContext(): NormalizedSessionState {
  const ctx = useContext(NormalizedSessionContext);
  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn(
        'useNormalizedSessionContext called outside NormalizedSessionProvider. ' +
        'Wrap your component tree with <NormalizedSessionProvider>.'
      );
    }
    throw new Error('useNormalizedSessionContext must be used within NormalizedSessionProvider');
  }
  return ctx;
}
