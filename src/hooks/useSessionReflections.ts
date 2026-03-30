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
   * Accepts an explicit text override to avoid stale-ref issues.
   */
  markReady: (explicitText?: string) => Promise<void>;
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
  const prevSessionIdRef = useRef<string | null>(normalizedSessionId);

  const [loading, setLoading] = useState(true);
  const [myReflection, setMyReflection] = useState<StepReflection | null>(null);
  const [localText, setLocalText] = useState('');
  const localTextRef = useRef('');
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(stepIndex);
  const prevStepIndexRef = useRef(stepIndex);
  const userIdRef = useRef<string | null>(user?.id ?? null);

  // Keep userId ref in sync (user changes independently of step/session)
  useEffect(() => { userIdRef.current = user?.id ?? null; }, [user]);

  // ─── 1. Reset state when session or step changes ───
  // IMPORTANT: This effect also updates sessionIdRef and stepIndexRef AFTER flushing.
  // Do NOT add separate useEffect blocks to sync these refs — that reintroduces
  // the timing bug where refs update before the flush reads them.
  useEffect(() => {
    // Flush any pending save to the PREVIOUS step/session before resetting
    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
      pendingSave.current = null;
      const text = localTextRef.current;
      const sid = prevSessionIdRef.current;
      const uid = userIdRef.current;
      const si = prevStepIndexRef.current;
      if (text?.trim() && sid && uid) {
        supabase
          .from('step_reflections')
          .upsert(
            {
              session_id: sid,
              step_index: si,
              user_id: uid,
              text,
              state: 'draft' as any,
            },
            { onConflict: 'session_id,step_index,user_id' }
          )
          .then(({ error }) => {
            if (error) console.error('Reset flush failed:', error);
          });
      }
    }

    // Now update refs to the NEW values (after flush used the old ones)
    prevSessionIdRef.current = normalizedSessionId;
    prevStepIndexRef.current = stepIndex;
    if (normalizedSessionId) {
      sessionIdRef.current = normalizedSessionId;
    }
    if (stepIndex !== undefined && stepIndex >= 0) {
      stepIndexRef.current = stepIndex;
    }

    // Reset local state for the new step/session
    setMyReflection(null);
    setLocalText('');
    localTextRef.current = '';
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
        localTextRef.current = data.text;
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
    localTextRef.current = text;
    setMyReflection(prev => prev ? { ...prev, text } : null);

    if (pendingSave.current) clearTimeout(pendingSave.current);

    pendingSave.current = setTimeout(async () => {
      
      const sid = sessionIdRef.current;
      const uid = userIdRef.current;
      const si = stepIndexRef.current;
      if (!uid || !sid) return;

      const { error } = await supabase
        .from('step_reflections')
        .upsert(
          {
            session_id: sid,
            step_index: si,
            user_id: uid,
            text,
            state: 'draft' as any,
          },
          { onConflict: 'session_id,step_index,user_id' }
        );

      if (error) console.error('Failed to save reflection:', error);
    }, AUTOSAVE_DELAY);
  }, []);

  // ─── 5. Mark ready: draft → ready (terminal action) ───
  const markReady = useCallback(async (explicitText?: string) => {
    if (!user) return;

    // Cancel any pending autosave to prevent draft overwriting ready state
    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
      pendingSave.current = null;
    }

    // Use explicit text if provided, otherwise fall back to ref
    const currentText = explicitText ?? localTextRef.current;

    if (!devState && sessionIdRef.current) {
      // Skip DB write if text is empty — no point saving an empty reflection
      if (!currentText.trim()) {
        return;
      }

      const { error } = await supabase
        .from('step_reflections')
        .upsert(
          {
            session_id: sessionIdRef.current,
            step_index: stepIndex,
            user_id: user.id,
            text: currentText,
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
        ? { ...prev, state: 'ready', text: currentText }
        : {
            id: '',
            sessionId: sessionIdRef.current || 'dev-session',
            stepIndex,
            userId: user.id,
            text: currentText,
            state: 'ready',
            updatedAt: new Date().toISOString(),
          }
    );
  }, [user, stepIndex, devState]);

  // Flush pending autosave on unmount (fire-and-forget)
  useEffect(() => {
    return () => {
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
        pendingSave.current = null;
        const text = localTextRef.current;
        const sid = sessionIdRef.current;
        const uid = userIdRef.current;
        const si = stepIndexRef.current;
        if (text?.trim() && sid && uid) {
          supabase
            .from('step_reflections')
            .upsert(
              {
                session_id: sid,
                step_index: si,
                user_id: uid,
                text,
                state: 'draft' as any,
              },
              { onConflict: 'session_id,step_index,user_id' }
            )
            .then(({ error }) => {
              if (error) console.error('Flush save failed:', error);
            });
        }
      }
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
