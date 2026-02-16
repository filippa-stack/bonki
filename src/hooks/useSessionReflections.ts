import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { supabase } from '@/integrations/supabase/client';

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
  /** Partner's reflection (only visible when revealed or locked) */
  partnerReflection: StepReflection | null;
  /** Current state of the user's reflection */
  state: ReflectionState;
  /** Update draft text (autosaved) */
  setText: (text: string) => void;
  /** Transition draft → ready */
  markReady: () => Promise<void>;
  /** Transition revealed → locked (both users) */
  lockStep: () => Promise<void>;
}

const AUTOSAVE_DELAY = 800;

/**
 * Manages session-based reflections with strict state transitions.
 * 
 * State machine: draft → ready → revealed → locked
 * - draft: user is writing, text autosaved
 * - ready: user pressed "Klar", invisible to partner
 * - revealed: both users ready, both reflections visible
 * - locked: immutable, step permanently closed
 */
export function useSessionReflections(
  cardId: string | undefined,
  stepIndex: number,
): UseSessionReflectionsReturn {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [myReflection, setMyReflection] = useState<StepReflection | null>(null);
  const [partnerReflection, setPartnerReflection] = useState<StepReflection | null>(null);
  const [localText, setLocalText] = useState('');
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // ─── 1. Find or create card_session ───
  useEffect(() => {
    if (!user || !space || !cardId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const initSession = async () => {
      setLoading(true);

      // Find latest uncompleted session for this card
      const { data: existing } = await supabase
        .from('card_sessions')
        .select('id')
        .eq('couple_space_id', space.id)
        .eq('card_id', cardId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (cancelled) return;

      if (existing) {
        setSessionId(existing.id);
        sessionIdRef.current = existing.id;
      } else {
        // Create a new session
        const { data: created, error } = await supabase
          .from('card_sessions')
          .insert({ couple_space_id: space.id, card_id: cardId })
          .select('id')
          .single();

        if (cancelled) return;
        if (error) {
          console.error('Failed to create card_session:', error);
          setLoading(false);
          return;
        }
        setSessionId(created.id);
        sessionIdRef.current = created.id;
      }
    };

    initSession();
    return () => { cancelled = true; };
  }, [user, space, cardId]);

  // ─── 2. Fetch reflections for current step ───
  useEffect(() => {
    if (!sessionId || !user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchReflections = async () => {
      const { data, error } = await supabase
        .from('step_reflections')
        .select('*')
        .eq('session_id', sessionId)
        .eq('step_index', stepIndex);

      if (cancelled) return;
      if (error) {
        console.error('Failed to fetch step_reflections:', error);
        setLoading(false);
        return;
      }

      for (const row of data || []) {
        const reflection = mapRow(row);
        if (row.user_id === user.id) {
          setMyReflection(reflection);
          setLocalText(reflection.text);
        } else {
          setPartnerReflection(reflection);
        }
      }
      setLoading(false);
    };

    fetchReflections();
    return () => { cancelled = true; };
  }, [sessionId, stepIndex, user]);

  // ─── 3. Realtime subscription for state changes ───
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`step_reflections_${sessionId}_${stepIndex}`)
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

          const reflection = mapRow(row);
          if (row.user_id === user?.id) {
            setMyReflection(reflection);
            // Don't overwrite local text during draft to avoid cursor jumps
            if (reflection.state !== 'draft') {
              setLocalText(reflection.text);
            }
          } else {
            setPartnerReflection(reflection);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, stepIndex, user]);

  // ─── 4. Autosave draft text ───
  const setText = useCallback((text: string) => {
    setLocalText(text);

    // Optimistic local update
    setMyReflection(prev => prev ? { ...prev, text } : null);

    if (pendingSave.current) clearTimeout(pendingSave.current);
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
  }, [user, stepIndex]);

  // ─── 5. Mark ready: draft → ready ───
  const markReady = useCallback(async () => {
    if (!user || !sessionIdRef.current) return;

    // Ensure the row exists with current text, then set to ready
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

    // Optimistic update (trigger may upgrade to 'revealed')
    setMyReflection(prev => prev ? { ...prev, state: 'ready', text: localText } : {
      id: '',
      sessionId: sessionIdRef.current!,
      stepIndex,
      userId: user.id,
      text: localText,
      state: 'ready',
      updatedAt: new Date().toISOString(),
    });
  }, [user, stepIndex, localText]);

  // ─── 6. Lock step: revealed → locked ───
  const lockStep = useCallback(async () => {
    if (!sessionIdRef.current) return;

    const { error } = await supabase.rpc('lock_step_reflections', {
      _session_id: sessionIdRef.current,
      _step_index: stepIndex,
    });

    if (error) {
      console.error('Failed to lock step:', error);
    }
  }, [stepIndex]);

  // Cleanup
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
    partnerReflection,
    state,
    setText,
    markReady,
    lockStep,
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
