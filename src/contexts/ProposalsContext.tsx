import React, { createContext, useContext } from 'react';
import { useProposals } from '@/hooks/useProposals';

type ProposalsContextValue = ReturnType<typeof useProposals>;

const ProposalsContext = createContext<ProposalsContextValue | null>(null);

export function ProposalsProvider({ children }: { children: React.ReactNode }) {
  const value = useProposals();
  return (
    <ProposalsContext.Provider value={value}>
      {children}
    </ProposalsContext.Provider>
  );
}

export function useProposalsContext(): ProposalsContextValue {
  const ctx = useContext(ProposalsContext);
  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn(
        'useProposalsContext called outside ProposalsProvider. ' +
        'Wrap your component tree with <ProposalsProvider>.'
      );
    }
    throw new Error('useProposalsContext must be used within ProposalsProvider');
  }
  return ctx;
}

// Re-export the Proposal type for consumers
export type { Proposal } from '@/hooks/useProposals';
