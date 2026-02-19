import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';

export type ReflectionState = 'draft' | 'ready' | 'revealed' | 'locked';

export interface StepReflection {
  id: string;
  sessionId: string;
  stepIndex: number;
  userId: string;
  text: string;
  state: ReflectionState;
  updatedAt: string;
}

interface UseSessionReflectionsReturn {
  sessionId: string | null;
  loading: boolean;
  /** Current user's reflection for the active step */
  myReflection: StepReflection | null;
  /** Current state of the user's reflection */
  state: ReflectionState;
  /** Update draft text (autosaved) */
  setText: (text: string) => void;
  /**
   * Transition draft → ready.
   * In the single-writer model this is the terminal action for a step.
   */
  markReady: () => Promise<void>;
}

const AUTOSAVE_DELAY = 800;

/**
 * Single-writer reflection hook.
 * One reflection row per (session_id, step_index, user_id).
 * No A/B protocol, no partner gating, no reveal state.
 *
 * State machine: draft → ready  (terminal for this step)
 */
export function useSessionReflections(
  normalizedSessionId: string | null,
  stepIndex: number,
): UseSessionReflectionsReturn {
  const { user } = useAuth();
  const devState = useDevState();
  const sessionId = normalizedSessionId;
  const sessionIdRef = useRef<string | null>(normalizedSessionId);

  const [loading, setLoading] = useState(true);
  const [myReflection, setMyReflection] = useState<StepReflection | null>(null);
  const [localText, setLocalText] = useState('');
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync so callbacks always see the latest sessionId
  useEffect(() => {
    sessionIdRef.current = normalizedSessionId;
  }, [normalizedSessionId]);

  // ─── 1. Reset state when session or step changes ───
  useEffect(() => {
    setMyReflection(null);
    setLocalText('');
    setLoading(true);
  }, [normalizedSessionId, stepIndex]);

  // ─── 2. Fetch reflection for current step ───
  useEffect(() => {
    if (!sessionId || !user) {
      setLoading(false);
      return;
    }
    if (devState) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchReflection = async () => {
      const { data, error } = await supabase
        .from('step_reflections')
        .select('*')
        .eq('session_id', sessionId)
        .eq('step_index', stepIndex)
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error('Failed to fetch step_reflection:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setMyReflection(mapRow(data));
        setLocalText(data.text);
      }
      setLoading(false);
    };

    fetchReflection();
    return () => { cancelled = true; };
  }, [sessionId, stepIndex, user, devState]);

  // ─── 3. Realtime subscription ───
  useEffect(() => {
    if (!sessionId || !user || devState) return;

    const channel = supabase
      .channel(`step_reflections_${sessionId}_${stepIndex}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'step_reflections',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') return;
          const row = payload.new as any;
          if (row.step_index !== stepIndex) return;
          if (row.user_id !== user.id) return;

          const reflection = mapRow(row);
          setMyReflection(reflection);
          if (reflection.state !== 'draft') {
            setLocalText(reflection.text);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, stepIndex, user, devState]);

  // ─── 4. Autosave draft text ───
  const setText = useCallback((text: string) => {
    setLocalText(text);
    setMyReflection(prev => prev ? { ...prev, text } : null);

    if (pendingSave.current) clearTimeout(pendingSave.current);
    if (devState) return;

    pendingSave.current = setTimeout(async () => {
      if (!user || !sessionIdRef.current) return;

      const { error } = await supabase
        .from('step_reflections')
        .upsert(
          {
            session_id: sessionIdRef.current,
            step_index: stepIndex,
            user_id: user.id,
            text,
            state: 'draft' as any,
          },
          { onConflict: 'session_id,step_index,user_id' }
        );

      if (error) console.error('Failed to save reflection:', error);
    }, AUTOSAVE_DELAY);
  }, [user, stepIndex, devState]);

  // ─── 5. Mark ready: draft → ready (terminal action) ───
  const markReady = useCallback(async () => {
    if (!user) return;

    if (!devState && sessionIdRef.current) {
      const { error } = await supabase
        .from('step_reflections')
        .upsert(
          {
            session_id: sessionIdRef.current,
            step_index: stepIndex,
            user_id: user.id,
            text: localText,
            state: 'ready' as any,
          },
          { onConflict: 'session_id,step_index,user_id' }
        );

      if (error) {
        console.error('Failed to mark reflection as ready:', error);
        return;
      }
    }

    setMyReflection(prev =>
      prev
        ? { ...prev, state: 'ready', text: localText }
        : {
            id: '',
            sessionId: sessionIdRef.current || 'dev-session',
            stepIndex,
            userId: user.id,
            text: localText,
            state: 'ready',
            updatedAt: new Date().toISOString(),
          }
    );
  }, [user, stepIndex, localText, devState]);

  // Cleanup pending autosave on unmount
  useEffect(() => {
    return () => {
      if (pendingSave.current) clearTimeout(pendingSave.current);
    };
  }, []);

  const state: ReflectionState = myReflection?.state || 'draft';

  return {
    sessionId,
    loading,
    myReflection,
    state,
    setText,
    markReady,
  };
}

function mapRow(row: any): StepReflection {
  return {
    id: row.id,
    sessionId: row.session_id,
    stepIndex: row.step_index,
    userId: row.user_id,
    text: row.text,
    state: row.state as ReflectionState,
    updatedAt: row.updated_at,
  };
}
