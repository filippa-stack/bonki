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
  /** Load shared progress on mount; returns initial data or null */
  initialData: SharedProgressData | null;
  /** Push local state changes to the shared table */
  syncToRemote: (session: SessionData | undefined, journey: JourneyState | undefined) => void;
  /** Whether initial load is done */
  ready: boolean;
  /** Current sync status for UI indicators */
  syncStatus: SharedSyncStatus;
  /** Last sync error message, if any */
  lastSyncError: string | null;
  /** Retry a failed sync */
  retrySync: () => void;
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

function sortCardIds(ids: string[]): string[] {
  return [...ids].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
}

function mergeJourneyStates(local: JourneyState | null | undefined, remote: JourneyState | null | undefined): JourneyState | null {
  if (!local && !remote) return null;
  if (!local) return { ...remote!, exploredCardIds: sortCardIds(remote!.exploredCardIds || []) };
  if (!remote) return { ...local!, exploredCardIds: sortCardIds(local!.exploredCardIds || []) };

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

  // Merge cardVisitDates — keep latest per card
  const mergedVisitDates: Record<string, string> = { ...(local.cardVisitDates || {}) };
  for (const [cardId, date] of Object.entries(remote.cardVisitDates || {})) {
    if (!mergedVisitDates[cardId] || date > mergedVisitDates[cardId]) {
      mergedVisitDates[cardId] = date;
    }
  }

  // For scalar fields, take the remote (latest writer) but keep union data
  return {
    ...remote,
    exploredCardIds: sortCardIds(Array.from(exploredSet)),
    sessionProgress: mergedProgress,
    cardVisitDates: mergedVisitDates,
  };
}

function logSyncError(params: {
  stage: 'fetchRemote' | 'upsertProgress' | 'thrown';
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
    stage,
    coupleSpaceId,
    userId,
    cardId,
    code,
    message,
    details: error?.details,
    hint: error?.hint,
    extra,
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
  const localSessionRef = useRef<SessionData | null>(null);
  const localJourneyRef = useRef<JourneyState | null>(null);
  const pendingWriteRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<{ session: SessionData | undefined; journey: JourneyState | undefined } | null>(null);
  const needsAnotherCommitRef = useRef(false);

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
    return () => {
      cancelled = true;
      // Clear any pending write on context change
      if (pendingWriteRef.current) {
        clearTimeout(pendingWriteRef.current);
        pendingWriteRef.current = null;
      }
    };
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
          const row = payload.new as any;
          if (!row) return;

          const remoteSession = deserializeSession(row.current_session);
          const remoteJourney = row.journey_state as unknown as JourneyState | null;

          // current_session: server is authoritative (edge functions only)
          // journey_state: merge local + remote (client writes journey metadata)
          const merged: SharedProgressData = {
            currentSession: remoteSession,
            journeyState: mergeJourneyStates(localJourneyRef.current, remoteJourney),
          };

          // Update local refs with result
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

  const SYNC_DEBOUNCE_MS = 900;

  const commitToRemote = useCallback(async () => {
    const pending = pendingDataRef.current;
    if (!pending || !userId || !coupleSpaceId) return;

    // If already syncing, queue another commit after this one finishes
    if (isSyncing.current) {
      needsAnotherCommitRef.current = true;
      return;
    }

    // Clear any pending debounce timer before committing
    if (pendingWriteRef.current) {
      clearTimeout(pendingWriteRef.current);
      pendingWriteRef.current = null;
    }

    isSyncing.current = true;
    setSyncStatus('syncing');
    const { session, journey } = pending;

    try {
      const { data: remoteRow, error: remoteErr } = await supabase
        .from('couple_progress')
        .select('journey_state')
        .eq('couple_space_id', coupleSpaceId)
        .maybeSingle();

      if (remoteErr) {
        logSyncError({
          stage: 'fetchRemote',
          coupleSpaceId,
          userId,
          cardId: session?.cardId ?? null,
          error: remoteErr,
        });
      }

      const remoteJourney = remoteRow
        ? (remoteRow.journey_state as unknown as JourneyState | null)
        : null;

      const mergedJourney = mergeJourneyStates(journey, remoteJourney);

      // Only write journey_state — current_session is managed by edge functions
      const upsertPayload: Record<string, any> = {
        couple_space_id: coupleSpaceId,
        journey_state: mergedJourney
          ? JSON.parse(JSON.stringify(mergedJourney))
          : null,
        updated_by: userId,
      };

      const { error: upsertErr } = await supabase
        .from('couple_progress')
        .upsert(
          upsertPayload as any,
          { onConflict: 'couple_space_id' }
        );

      if (upsertErr) {
        logSyncError({
          stage: 'upsertProgress',
          coupleSpaceId,
          userId,
          cardId: session?.cardId ?? null,
          error: upsertErr,
        });
        setLastSyncError(upsertErr.message || 'Kunde inte spara');
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
        cardId: pendingDataRef.current?.session?.cardId ?? null,
        error: err,
      });
      setLastSyncError(err instanceof Error ? err.message : 'Kunde inte spara');
      setSyncStatus('error');
    } finally {
      isSyncing.current = false;
      // If new changes happened during sync, flush immediately
      if (needsAnotherCommitRef.current) {
        needsAnotherCommitRef.current = false;
        setTimeout(() => commitToRemote(), 0);
      }
    }
  }, [userId, coupleSpaceId]);

  // Push local changes to database (debounced)
  const syncToRemote = useCallback(
    (session: SessionData | undefined, journey: JourneyState | undefined) => {
      if (!userId || !coupleSpaceId) return;

      // Update local refs immediately
      localSessionRef.current = session ?? null;
      localJourneyRef.current = journey ?? null;

      const payload = JSON.stringify({ session, journey });
      if (payload === lastPushed.current) return;
      lastPushed.current = payload;

      // Store pending data
      pendingDataRef.current = { session, journey };

      // If a commit is in-flight, flag for re-commit after it finishes
      if (isSyncing.current) {
        needsAnotherCommitRef.current = true;
        if (pendingWriteRef.current) {
          clearTimeout(pendingWriteRef.current);
          pendingWriteRef.current = null;
        }
        return;
      }

      // Debounce the actual write
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

  // Cleanup pending write on unmount
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
