import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyState, AppState } from '@/types';

type SessionData = AppState['currentSession'];

interface SharedProgressData {
  currentSession: SessionData | null;
  journeyState: JourneyState | null;
}

interface UseSharedProgressReturn {
  /** Load shared progress on mount; returns initial data or null */
  initialData: SharedProgressData | null;
  /** Push local state changes to the shared table */
  syncToRemote: (session: SessionData | undefined, journey: JourneyState | undefined) => void;
  /** Whether initial load is done */
  ready: boolean;
}

export function useSharedProgress(
  userId: string | null,
  coupleSpaceId: string | null,
  onRemoteUpdate: (data: SharedProgressData) => void,
): UseSharedProgressReturn {
  const [initialData, setInitialData] = useState<SharedProgressData | null>(null);
  const [ready, setReady] = useState(false);
  const lastPushed = useRef<string>('');
  const isSyncing = useRef(false);

  // Load initial data
  useEffect(() => {
    if (!userId || !coupleSpaceId) {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('couple_progress')
          .select('*')
          .eq('couple_space_id', coupleSpaceId!)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('Error loading shared progress:', error);
          setReady(true);
          return;
        }

        if (data) {
          const parsed: SharedProgressData = {
            currentSession: deserializeSession(data.current_session),
            journeyState: data.journey_state as unknown as JourneyState | null,
          };
          setInitialData(parsed);
        }
      } catch (err) {
        console.error('Failed to load shared progress:', err);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId, coupleSpaceId]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!userId || !coupleSpaceId) return;

    const channel = supabase
      .channel(`couple_progress_${coupleSpaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_progress',
          filter: `couple_space_id=eq.${coupleSpaceId}`,
        },
        (payload) => {
          // Ignore changes we just pushed
          const row = payload.new as any;
          if (!row || row.updated_by === userId) return;

          const parsed: SharedProgressData = {
            currentSession: deserializeSession(row.current_session),
            journeyState: row.journey_state as unknown as JourneyState | null,
          };
          onRemoteUpdate(parsed);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, coupleSpaceId, onRemoteUpdate]);

  // Push local changes to database
  const syncToRemote = useCallback(
    (session: SessionData | undefined, journey: JourneyState | undefined) => {
      if (!userId || !coupleSpaceId || isSyncing.current) return;

      const payload = JSON.stringify({ session, journey });
      if (payload === lastPushed.current) return;
      lastPushed.current = payload;

      isSyncing.current = true;

      const sessionJson = session
        ? JSON.parse(JSON.stringify({
            ...session,
            startedAt: session.startedAt instanceof Date ? session.startedAt.toISOString() : session.startedAt,
            lastActivityAt: session.lastActivityAt instanceof Date ? session.lastActivityAt.toISOString() : session.lastActivityAt,
          }))
        : null;

      supabase
        .from('couple_progress')
        .upsert(
          {
            couple_space_id: coupleSpaceId,
            current_session: sessionJson,
            journey_state: journey ? JSON.parse(JSON.stringify(journey)) : null,
            updated_by: userId,
          },
          { onConflict: 'couple_space_id' }
        )
        .then(({ error }) => {
          if (error) console.error('Error syncing progress:', error);
          isSyncing.current = false;
        });
    },
    [userId, coupleSpaceId]
  );

  return { initialData, syncToRemote, ready };
}

function deserializeSession(raw: any): SessionData | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ...raw,
    startedAt: new Date(raw.startedAt),
    lastActivityAt: new Date(raw.lastActivityAt),
    completedSteps: raw.completedSteps || [],
    userCompletions: raw.userCompletions || {},
  };
}
