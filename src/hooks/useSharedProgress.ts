// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

/**
 * useSharedProgress — WRITE/SYNC DEPRECATED.
 *
 * All remote write behavior (syncToRemote, commitToRemote, debounced upserts)
 * and realtime merge behavior (couple_journey_meta subscription) have been removed.
 *
 * Session progress is now exclusively derived from:
 *   couple_sessions, couple_session_steps, couple_session_completions
 *
 * This hook is kept as a no-op stub so call-sites compile without changes.
 * The AppContext consumer of this hook will be cleaned up in a follow-up pass.
 */

export type SharedSyncStatus = 'idle' | 'syncing' | 'error';

interface SharedProgressData {
  journeyState: null;
}

interface UseSharedProgressReturn {
  initialData: SharedProgressData | null;
  syncToRemote: (journey: unknown) => void;
  ready: boolean;
  syncStatus: SharedSyncStatus;
  lastSyncError: string | null;
  retrySync: () => void;
}

export function useSharedProgress(
  _userId: string | null,
  _coupleSpaceId: string | null,
  _onRemoteUpdate: (data: SharedProgressData) => void,
): UseSharedProgressReturn {
  return {
    initialData: null,
    syncToRemote: () => { /* no-op: writes to couple_journey_meta are deprecated */ },
    ready: true,
    syncStatus: 'idle',
    lastSyncError: null,
    retrySync: () => { /* no-op */ },
  };
}
