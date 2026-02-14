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

// --- Merge helpers ---

function mergeNumberArrays(a: number[] | undefined, b: number[] | undefined): number[] {
  const set = new Set([...(a || []), ...(b || [])]);
  return Array.from(set).sort((x, y) => x - y);
}

function mergeUserCompletions(
  a: Record<string, number[]> | undefined,
  b: Record<string, number[]> | undefined,
): Record<string, number[]> {
  const result: Record<string, number[]> = { ...(a || {}) };
  for (const [uid, steps] of Object.entries(b || {})) {
    result[uid] = mergeNumberArrays(result[uid], steps);
  }
  return result;
}

function mergeSessions(local: SessionData | null | undefined, remote: SessionData | null | undefined): SessionData | null {
  if (!local && !remote) return null;
  if (!local) return remote ?? null;
  if (!remote) return local ?? null;

  // Different card sessions — remote wins (partner started something new)
  if (local.cardId !== remote.cardId) return remote;

  const localStart = local.startedAt instanceof Date ? local.startedAt : new Date(local.startedAt);
  const remoteStart = remote.startedAt instanceof Date ? remote.startedAt : new Date(remote.startedAt);
  const localActivity = local.lastActivityAt instanceof Date ? local.lastActivityAt : new Date(local.lastActivityAt);
  const remoteActivity = remote.lastActivityAt instanceof Date ? remote.lastActivityAt : new Date(remote.lastActivityAt);

  return {
    categoryId: remote.categoryId,
    cardId: remote.cardId,
    currentStepIndex: Math.max(local.currentStepIndex, remote.currentStepIndex),
    completedSteps: mergeNumberArrays(local.completedSteps, remote.completedSteps),
    userCompletions: mergeUserCompletions(local.userCompletions, remote.userCompletions),
    startedAt: localStart < remoteStart ? localStart : remoteStart,
    lastActivityAt: localActivity > remoteActivity ? localActivity : remoteActivity,
  };
}

function mergeJourneyStates(local: JourneyState | null | undefined, remote: JourneyState | null | undefined): JourneyState | null {
  if (!local && !remote) return null;
  if (!local) return remote ?? null;
  if (!remote) return local ?? null;

  // Union exploredCardIds
  const exploredSet = new Set([...(local.exploredCardIds || []), ...(remote.exploredCardIds || [])]);

  // Merge sessionProgress
  const mergedProgress: JourneyState['sessionProgress'] = { ...(local.sessionProgress || {}) };
  for (const [cardId, data] of Object.entries(remote.sessionProgress || {})) {
    if (!mergedProgress[cardId]) {
      mergedProgress[cardId] = data;
    } else {
      const mergedPerUser: Record<string, { completedSteps: number[] }> = { ...mergedProgress[cardId].perUser };
      for (const [uid, udata] of Object.entries(data.perUser)) {
        mergedPerUser[uid] = {
          completedSteps: mergeNumberArrays(mergedPerUser[uid]?.completedSteps, udata.completedSteps),
        };
      }
      mergedProgress[cardId] = { perUser: mergedPerUser };
    }
  }

  // For scalar fields, take the remote (latest writer) but keep union data
  return {
    ...remote,
    exploredCardIds: Array.from(exploredSet),
    sessionProgress: mergedProgress,
  };
}

// --- Hook ---

export function useSharedProgress(
  userId: string | null,
  coupleSpaceId: string | null,
  onRemoteUpdate: (data: SharedProgressData) => void,
): UseSharedProgressReturn {
  const [initialData, setInitialData] = useState<SharedProgressData | null>(null);
  const [ready, setReady] = useState(false);
  const lastPushed = useRef<string>('');
  const isSyncing = useRef(false);
  const localSessionRef = useRef<SessionData | null>(null);
  const localJourneyRef = useRef<JourneyState | null>(null);

  // Load initial data
  useEffect(() => {
    setInitialData(null);

    if (!userId || !coupleSpaceId) {
      setReady(true);
      return;
    }

    setReady(false);
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
          localSessionRef.current = parsed.currentSession ?? null;
          localJourneyRef.current = parsed.journeyState ?? null;
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

          const remoteSession = deserializeSession(row.current_session);
          const remoteJourney = row.journey_state as unknown as JourneyState | null;

          const merged: SharedProgressData = {
            currentSession: mergeSessions(localSessionRef.current, remoteSession),
            journeyState: mergeJourneyStates(localJourneyRef.current, remoteJourney),
          };

          // Update local refs with merged result
          localSessionRef.current = merged.currentSession ?? null;
          localJourneyRef.current = merged.journeyState ?? null;

          onRemoteUpdate(merged);
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

      // Update local refs
      localSessionRef.current = session ?? null;
      localJourneyRef.current = journey ?? null;

      const payload = JSON.stringify({ session, journey });
      if (payload === lastPushed.current) return;
      lastPushed.current = payload;

      isSyncing.current = true;

      (async () => {
        try {
          // Fetch latest remote to merge
          const { data: remoteRow } = await supabase
            .from('couple_progress')
            .select('current_session, journey_state')
            .eq('couple_space_id', coupleSpaceId)
            .maybeSingle();

          const remoteSession = remoteRow ? deserializeSession(remoteRow.current_session) : null;
          const remoteJourney = remoteRow ? (remoteRow.journey_state as unknown as JourneyState | null) : null;

          const mergedSession = mergeSessions(session, remoteSession);
          const mergedJourney = mergeJourneyStates(journey, remoteJourney);

          const sessionJson = mergedSession
            ? JSON.parse(JSON.stringify({
                ...mergedSession,
                startedAt: mergedSession.startedAt instanceof Date ? mergedSession.startedAt.toISOString() : mergedSession.startedAt,
                lastActivityAt: mergedSession.lastActivityAt instanceof Date ? mergedSession.lastActivityAt.toISOString() : mergedSession.lastActivityAt,
              }))
            : null;

          const { error } = await supabase
            .from('couple_progress')
            .upsert(
              {
                couple_space_id: coupleSpaceId,
                current_session: sessionJson,
                journey_state: mergedJourney ? JSON.parse(JSON.stringify(mergedJourney)) : null,
                updated_by: userId,
              },
              { onConflict: 'couple_space_id' }
            );
          if (error) console.error('Error syncing progress:', error);
        } catch (err) {
          console.error('Error syncing progress (thrown):', err);
        } finally {
          isSyncing.current = false;
        }
      })();
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
