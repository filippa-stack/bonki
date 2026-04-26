// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import React, { createContext, useContext } from 'react';
import { useNormalizedSessionState, type NormalizedSessionState } from '@/hooks/useNormalizedSessionState';
import { useCurrentProduct } from '@/hooks/useCurrentProduct';

const NormalizedSessionContext = createContext<NormalizedSessionState | null>(null);

/**
 * Provides the active couple session, scoped to the product implied by the
 * current route (via `useCurrentProduct`).
 *
 * Why route-scoped: each product can hold its own active session in parallel.
 * On a product home / category / card route, consumers (resume banners, the
 * product-home "Fortsätt" CTA) should see the session for THIS product only.
 * On product-agnostic routes (library, journal, login), `useCurrentProduct`
 * returns undefined and the provider falls back to "any active session" —
 * which preserves legacy behavior for the global Header indicator and the
 * ActiveSessionGuard loading skeleton.
 */
export function NormalizedSessionProvider({ children }: { children: React.ReactNode }) {
  const product = useCurrentProduct();
  const value = useNormalizedSessionState(product?.id ?? null);
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
