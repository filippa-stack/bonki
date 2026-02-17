import React, { createContext, useContext } from 'react';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';

type CoupleSpaceContextValue = ReturnType<typeof useCoupleSpace>;

const CoupleSpaceContext = createContext<CoupleSpaceContextValue | null>(null);

export function CoupleSpaceProvider({ children }: { children: React.ReactNode }) {
  const value = useCoupleSpace();
  return (
    <CoupleSpaceContext.Provider value={value}>
      {children}
    </CoupleSpaceContext.Provider>
  );
}

export function useCoupleSpaceContext(): CoupleSpaceContextValue {
  const ctx = useContext(CoupleSpaceContext);
  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn(
        'useCoupleSpaceContext called outside CoupleSpaceProvider. ' +
        'Wrap your component tree with <CoupleSpaceProvider>.'
      );
    }
    throw new Error('useCoupleSpaceContext must be used within CoupleSpaceProvider');
  }
  return ctx;
}
