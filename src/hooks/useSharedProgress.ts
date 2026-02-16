import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyState, AppState } from '@/types';

type SessionData = AppState['currentSession'];

interface SharedProgressData {
  currentSession: SessionData | null;
  journeyState: JourneyState | null;
}

export type SharedSyncStatus = 'idle' | 'syncing' | 'error';

interface UseSharedProgressReturn {
  initialData: SharedProgressData | null;
  syncToRemote: (session: SessionData | undefined, journey: JourneyState | undefined) => void;
  ready: boolean;
  syncStatus: SharedSyncStatus;
  lastSyncError: string | null;
  retrySync: () => void;
}

// --- Merge helpers ---

function mergeNumberArrays(a: number[] | undefined, b: number[] | undefined): number[] {
  const set = new Set([...(a || []), ...(b || [])]);
  return Array.from(set).sort((x, y) => x - y);
}

function sortCardIds(ids: string[]): string[] {
  return [...ids].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
}

function mergeJourneyStates(
  local: JourneyState | null | undefined,
  remote: JourneyState | null | undefined,
): JourneyState | null {
  if (!local && !remote) return null;
  if (!local) return { ...remote!, exploredCardIds: sortCardIds(remote!.exploredCardIds || []) };
  if (!remote) return { ...local!, exploredCardIds: sortCardIds(local!.exploredCardIds || []) };

  const exploredSet = new Set([...(local.exploredCardIds || []), ...(remote.exploredCardIds || [])]);

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

  const mergedVisitDates: Record<string, string> = { ...(local.cardVisitDates || {}) };
  for (const [cardId, date] of Object.entries(remote.cardVisitDates || {})) {
    if (!mergedVisitDates[cardId] || date > mergedVisitDates[cardId]) {
      mergedVisitDates[cardId] = date;
    }
  }

  return {
    ...remote,
    exploredCardIds: sortCardIds(Array.from(exploredSet)),
    sessionProgress: mergedProgress,
    cardVisitDates: mergedVisitDates,
  };
}

function logSyncError(params: {
  stage: 'fetchRemote' | 'upsertJourneyMeta' | 'thrown';
  coupleSpaceId: string | null;
  userId: string | null;
  cardId?: string | null;
  error: any;
  extra?: Record<string, any>;
}) {
  const { stage, coupleSpaceId, userId, cardId, error, extra } = params;
  const code = error?.code ?? error?.status ?? error?.name ?? 'unknown';
  const message = error?.message ?? String(error);
  console.error('[SharedProgressSync]', {
    stage, coupleSpaceId, userId, cardId, code, message,
    details: error?.details, hint: error?.hint, extra,
  });
}

// --- Hook ---

export function useSharedProgress(
  userId: string | null,
  coupleSpaceId: string | null,
  onRemoteUpdate: (data: SharedProgressData) => void,
): UseSharedProgressReturn {
  const [initialData, setInitialData] = useState<SharedProgressData | null>(null);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SharedSyncStatus>('idle');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const lastPushed = useRef<string>('');
  const isSyncing = useRef(false);
  const localJourneyRef = useRef<JourneyState | null>(null);
  const pendingWriteRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<{ journey: JourneyState | undefined } | null>(null);
  const needsAnotherCommitRef = useRef(false);

  // Load initial data: session from couple_progress, journey from couple_journey_meta
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
        // Fetch session (server-authoritative) and own journey meta in parallel
        const [progressRes, metaRes] = await Promise.all([
          supabase
            .from('couple_progress')
            .select('current_session')
            .eq('couple_space_id', coupleSpaceId!)
            .maybeSingle(),
          supabase
            .from('couple_journey_meta' as any)
            .select('journey_state')
            .eq('couple_space_id', coupleSpaceId!)
            .eq('user_id', userId!)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (progressRes.error) {
          console.error('Error loading couple_progress:', progressRes.error);
        }
        if (metaRes.error) {
          console.error('Error loading couple_journey_meta:', metaRes.error);
        }

        const parsed: SharedProgressData = {
          currentSession: deserializeSession(progressRes.data?.current_session ?? null),
          journeyState: (metaRes.data as any)?.journey_state as JourneyState | null ?? null,
        };
        localJourneyRef.current = parsed.journeyState;
        setInitialData(parsed);
      } catch (err) {
        console.error('Failed to load shared progress:', err);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (pendingWriteRef.current) {
        clearTimeout(pendingWriteRef.current);
        pendingWriteRef.current = null;
      }
    };
  }, [userId, coupleSpaceId]);

  // Subscribe to realtime: couple_progress for session, couple_journey_meta for partner journey
  useEffect(() => {
    if (!userId || !coupleSpaceId) return;

    const channel = supabase
      .channel(`shared_progress_${coupleSpaceId}`)
      // Server-authoritative session changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_progress',
          filter: `couple_space_id=eq.${coupleSpaceId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;
          const remoteSession = deserializeSession(row.current_session);
          onRemoteUpdate({
            currentSession: remoteSession,
            journeyState: localJourneyRef.current,
          });
        }
      )
      // Partner's journey meta changes (merge with own)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_journey_meta',
          filter: `couple_space_id=eq.${coupleSpaceId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row || row.user_id === userId) return; // Skip own writes
          const remoteJourney = row.journey_state as JourneyState | null;
          const merged = mergeJourneyStates(localJourneyRef.current, remoteJourney);
          localJourneyRef.current = merged;
          onRemoteUpdate({
            currentSession: null, // session unchanged, consumer merges
            journeyState: merged,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, coupleSpaceId, onRemoteUpdate]);

  const SYNC_DEBOUNCE_MS = 900;

  const commitToRemote = useCallback(async () => {
    const pending = pendingDataRef.current;
    if (!pending || !userId || !coupleSpaceId) return;

    if (isSyncing.current) {
      needsAnotherCommitRef.current = true;
      return;
    }

    if (pendingWriteRef.current) {
      clearTimeout(pendingWriteRef.current);
      pendingWriteRef.current = null;
    }

    isSyncing.current = true;
    setSyncStatus('syncing');
    const { journey } = pending;

    try {
      // Read remote journey meta for merge
      const { data: remoteRow, error: remoteErr } = await supabase
        .from('couple_journey_meta' as any)
        .select('journey_state')
        .eq('couple_space_id', coupleSpaceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (remoteErr) {
        logSyncError({
          stage: 'fetchRemote',
          coupleSpaceId,
          userId,
          error: remoteErr,
        });
      }

      const remoteJourney = remoteRow
        ? ((remoteRow as any).journey_state as JourneyState | null)
        : null;

      const mergedJourney = mergeJourneyStates(journey, remoteJourney);
      const journeyPayload = mergedJourney
        ? JSON.parse(JSON.stringify(mergedJourney))
        : {};

      // Upsert into couple_journey_meta (user owns their own row)
      const { error: writeErr } = await supabase
        .from('couple_journey_meta' as any)
        .upsert(
          {
            couple_space_id: coupleSpaceId,
            user_id: userId,
            journey_state: journeyPayload,
          } as any,
          { onConflict: 'couple_space_id,user_id' }
        );

      if (writeErr) {
        logSyncError({
          stage: 'upsertJourneyMeta',
          coupleSpaceId,
          userId,
          error: writeErr,
        });
        setLastSyncError(writeErr.message || 'Kunde inte spara');
        setSyncStatus('error');
      } else {
        setLastSyncError(null);
        setSyncStatus('idle');
      }
    } catch (err) {
      logSyncError({
        stage: 'thrown',
        coupleSpaceId,
        userId,
        error: err,
      });
      setLastSyncError(err instanceof Error ? err.message : 'Kunde inte spara');
      setSyncStatus('error');
    } finally {
      isSyncing.current = false;
      if (needsAnotherCommitRef.current) {
        needsAnotherCommitRef.current = false;
        setTimeout(() => commitToRemote(), 0);
      }
    }
  }, [userId, coupleSpaceId]);

  // syncToRemote now only writes journey_state to couple_journey_meta
  // session param is kept in signature for API compatibility but not written
  const syncToRemote = useCallback(
    (_session: SessionData | undefined, journey: JourneyState | undefined) => {
      if (!userId || !coupleSpaceId) return;

      localJourneyRef.current = journey ?? null;

      const payload = JSON.stringify({ journey });
      if (payload === lastPushed.current) return;
      lastPushed.current = payload;

      pendingDataRef.current = { journey };

      if (isSyncing.current) {
        needsAnotherCommitRef.current = true;
        if (pendingWriteRef.current) {
          clearTimeout(pendingWriteRef.current);
          pendingWriteRef.current = null;
        }
        return;
      }

      if (pendingWriteRef.current) {
        clearTimeout(pendingWriteRef.current);
      }
      pendingWriteRef.current = setTimeout(() => {
        pendingWriteRef.current = null;
        commitToRemote();
      }, SYNC_DEBOUNCE_MS);
    },
    [userId, coupleSpaceId, commitToRemote]
  );

  useEffect(() => {
    return () => {
      if (pendingWriteRef.current) {
        clearTimeout(pendingWriteRef.current);
        pendingWriteRef.current = null;
      }
    };
  }, []);

  const retrySync = useCallback(() => {
    if (pendingDataRef.current && !isSyncing.current) {
      setLastSyncError(null);
      setSyncStatus('idle');
      commitToRemote();
    }
  }, [commitToRemote]);

  return { initialData, syncToRemote, ready, syncStatus, lastSyncError, retrySync };
}

function deserializeSession(raw: any): SessionData | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ...raw,
    startedAt: new Date(raw.startedAt),
    lastActivityAt: new Date(raw.lastActivityAt),
    userCompletions: raw.userCompletions || {},
  };
}
