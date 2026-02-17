// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppMode = 'SESSION_ACTIVE' | 'SESSION_WAITING' | null;

export interface NormalizedSessionState {
  appMode: AppMode;
  sessionId: string | null;
  cardId: string | null;
  categoryId: string | null;
  currentStepIndex: number;
  waiting: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useNormalizedSessionState(): NormalizedSessionState {
  const { user } = useAuth();
  const [state, setState] = useState<Omit<NormalizedSessionState, 'loading' | 'refetch'>>({
    appMode: null,
    sessionId: null,
    cardId: null,
    categoryId: null,
    currentStepIndex: 0,
    waiting: false,
  });
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const userId = user?.id;

  const fetch = useCallback(async () => {
    if (!userId) {
      setState({ appMode: null, sessionId: null, cardId: null, categoryId: null, currentStepIndex: 0, waiting: false });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('get_active_session_state');

    if (!mountedRef.current) return;

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      setState({ appMode: null, sessionId: null, cardId: null, categoryId: null, currentStepIndex: 0, waiting: false });
    } else {
      const row = Array.isArray(data) ? data[0] : data;
      const mode = (row.mode as AppMode) || null;
      setState({
        appMode: mode,
        sessionId: row.session_id ?? null,
        cardId: row.card_id ?? null,
        categoryId: row.category_id ?? null,
        currentStepIndex: row.current_step_index ?? 0,
        waiting: mode === 'SESSION_WAITING',
      });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { ...state, loading, refetch: fetch };
}
