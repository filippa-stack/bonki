// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';

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
  const { space, memberCount } = useCoupleSpaceContext();
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const userId = user?.id;
  const spaceId = space?.id;

  const fetchState = useCallback(async () => {
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

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchState();
    return () => { mountedRef.current = false; };
  }, [fetchState]);

  // Re-fetch when memberCount transitions to 2 (partner just joined)
  // so session state reflects the correct member count immediately.
  const prevMemberCountRef = useRef(memberCount);
  useEffect(() => {
    if (prevMemberCountRef.current < 2 && memberCount >= 2) {
      fetchState();
    }
    prevMemberCountRef.current = memberCount;
  }, [memberCount, fetchState]);

  // Debounced refetch helper — coalesces bursts into a single RPC call
  const debouncedRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (mountedRef.current) fetchState();
    }, 300);
  }, [fetchState]);

  // Realtime subscriptions scoped to active couple_space_id
  useEffect(() => {
    if (!userId || !spaceId) return;

    const channel = supabase
      .channel(`norm-session-rt-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_sessions',
          filter: `couple_space_id=eq.${spaceId}`,
        },
        () => debouncedRefetch()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_session_completions',
          filter: `couple_space_id=eq.${spaceId}`,
        },
        () => debouncedRefetch()
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [userId, spaceId, debouncedRefetch]);

  return { ...state, loading, refetch: fetchState };
}
