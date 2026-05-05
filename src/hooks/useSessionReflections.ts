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
  myReflection: StepReflection | null;
  state: ReflectionState;
  setText: (text: string) => void;
  markReady: (explicitText?: string) => Promise<void>;
}

const AUTOSAVE_DELAY = 800;

/**
 * Single source of truth for writing to step_reflections.
 * All save paths (autosave, reset-flush, markReady, unmount-flush, buffered-flush)
 * funnel through this helper.
 */
async function upsertStepReflection(args: {
  sessionId: string;
  stepIndex: number;
  userId: string;
  text: string;
  state: 'draft' | 'ready';
}) {
  const { error } = await supabase
    .from('step_reflections')
    .upsert(
      {
        session_id: args.sessionId,
        step_index: args.stepIndex,
        user_id: args.userId,
        text: args.text,
        state: args.state as any,
      },
      { onConflict: 'session_id,step_index,user_id' }
    );
  if (error) throw error;
}

/**
 * Single-writer reflection hook.
 * One reflection row per (session_id, step_index, user_id).
 *
 * Buffer-and-flush guarantee: writes attempted before sessionId resolves are
 * stored in pendingWritesRef and flushed when sessionId becomes valid. This
 * prevents silent data loss on direct deep-link entries to CardView.
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

  // Buffer for writes attempted before sessionId resolves.
  // Keyed by stepIndex so rapid typing on the same step overwrites instead of queuing.
  const pendingWritesRef = useRef<
    Map<number, { text: string; state: 'draft' | 'ready'; updatedAt: number }>
  >(new Map());
  const previousSessionIdRef = useRef<string | null>(null);

  // Keep userId ref in sync
  useEffect(() => { userIdRef.current = user?.id ?? null; }, [user]);

  // ─── 1. Reset state when session or step changes ───
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
        upsertStepReflection({
          sessionId: sid,
          stepIndex: si,
          userId: uid,
          text,
          state: 'draft',
        }).catch((err) => console.error('Reset flush failed:', err));
      }
    }

    prevSessionIdRef.current = normalizedSessionId;
    prevStepIndexRef.current = stepIndex;
    if (normalizedSessionId) {
      sessionIdRef.current = normalizedSessionId;
    }
    if (stepIndex !== undefined && stepIndex >= 0) {
      stepIndexRef.current = stepIndex;
    }

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
      } else if (sessionId && user.id) {
        upsertStepReflection({
          sessionId,
          stepIndex,
          userId: user.id,
          text: '',
          state: 'draft',
        }).catch((err) => console.error('Failed to create draft marker:', err));
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

  // ─── 3b. Flush buffered writes when sessionId resolves ───
  useEffect(() => {
    const prev = previousSessionIdRef.current;
    const curr = sessionId;
    previousSessionIdRef.current = curr ?? null;

    if (!prev && curr && pendingWritesRef.current.size > 0 && userIdRef.current) {
      const uid = userIdRef.current;
      const entries = Array.from(pendingWritesRef.current.entries());
      console.log(`[useSessionReflections] flushed ${entries.length} buffered writes`);
      entries.forEach(async ([stepIdx, entry]) => {
        try {
          await upsertStepReflection({
            sessionId: curr,
            stepIndex: stepIdx,
            userId: uid,
            text: entry.text,
            state: entry.state,
          });
          pendingWritesRef.current.delete(stepIdx);
        } catch (err) {
          console.error('[useSessionReflections] flush write failed, will retry', err);
        }
      });
    }
  }, [sessionId]);

  // ─── 4. Autosave draft text ───
  const setText = useCallback((text: string) => {
    setLocalText(text);
    localTextRef.current = text;
    setMyReflection(prev =>
      prev
        ? { ...prev, text }
        : {
            id: '',
            sessionId: sessionIdRef.current || '',
            stepIndex: stepIndexRef.current,
            userId: userIdRef.current || '',
            text,
            state: 'draft' as ReflectionState,
            updatedAt: new Date().toISOString(),
          }
    );

    if (pendingSave.current) clearTimeout(pendingSave.current);

    pendingSave.current = setTimeout(async () => {
      const sid = sessionIdRef.current;
      const uid = userIdRef.current;
      const si = stepIndexRef.current;
      if (!uid) return;

      // Buffer-and-flush: if sessionId hasn't resolved yet, store the write
      // for replay when it does. Do not silently drop.
      if (!sid) {
        pendingWritesRef.current.set(si, {
          text,
          state: 'draft',
          updatedAt: Date.now(),
        });
        console.debug('[useSessionReflections] buffered write awaiting sessionId resolution');
        return;
      }

      try {
        await upsertStepReflection({
          sessionId: sid,
          stepIndex: si,
          userId: uid,
          text,
          state: 'draft',
        });
      } catch (err) {
        console.error('Failed to save reflection:', err);
      }
    }, AUTOSAVE_DELAY);
  }, []);

  // ─── 5. Mark ready: draft → ready (terminal action) ───
  const markReady = useCallback(async (explicitText?: string) => {
    if (!user) return;

    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
      pendingSave.current = null;
    }

    const currentText = explicitText ?? localTextRef.current;

    if (!devState) {
      if (currentText.trim()) {
        const sid = sessionIdRef.current;
        if (!sid) {
          // Buffer the ready-state write; flush effect will replay it.
          pendingWritesRef.current.set(stepIndex, {
            text: currentText,
            state: 'ready',
            updatedAt: Date.now(),
          });
          console.debug('[useSessionReflections] buffered ready write awaiting sessionId resolution');
        } else {
          try {
            await upsertStepReflection({
              sessionId: sid,
              stepIndex,
              userId: user.id,
              text: currentText,
              state: 'ready',
            });
          } catch (err) {
            console.error('Failed to mark reflection as ready:', err);
            return;
          }
        }
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

  // Flush pending autosave + buffered writes on unmount
  useEffect(() => {
    return () => {
      // Flush in-flight debounced autosave
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
        pendingSave.current = null;
        const text = localTextRef.current;
        const sid = sessionIdRef.current;
        const uid = userIdRef.current;
        const si = stepIndexRef.current;
        if (text?.trim() && sid && uid) {
          upsertStepReflection({
            sessionId: sid,
            stepIndex: si,
            userId: uid,
            text,
            state: 'draft',
          }).catch((err) => console.error('Flush save failed:', err));
        } else if (text?.trim() && uid && !sid) {
          // No sessionId yet — buffer it so a future hook instance could in
          // theory replay it. In practice the buffer dies with the hook, so
          // we also warn below.
          pendingWritesRef.current.set(si, {
            text,
            state: 'draft',
            updatedAt: Date.now(),
          });
        }
      }

      // Flush buffered writes that never made it to the DB
      if (pendingWritesRef.current.size > 0) {
        const sid = sessionIdRef.current;
        const uid = userIdRef.current;
        if (sid && uid) {
          const entries = Array.from(pendingWritesRef.current.entries());
          entries.forEach(([stepIdx, entry]) => {
            upsertStepReflection({
              sessionId: sid,
              stepIndex: stepIdx,
              userId: uid,
              text: entry.text,
              state: entry.state,
            }).catch((err) =>
              console.error('[useSessionReflections] unmount flush failed', err)
            );
          });
        } else {
          console.warn(
            `[useSessionReflections] component unmounting with ${pendingWritesRef.current.size} unflushed writes and no sessionId — data may be lost`
          );
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
