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
  /** @deprecated Shared progress JSON is removed. Always null. */
  journeyState: null;
}

interface UseSharedProgressReturn {
  initialData: SharedProgressData | null;
  /** @deprecated No-op. Shared JSON sync is removed. */
  syncToRemote: (journey?: never) => void;
  ready: boolean;
  syncStatus: SharedSyncStatus;
  lastSyncError: string | null;
  /** @deprecated No-op. */
  retrySync: () => void;
}

const warnDeprecatedSync = () => {
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn('[useSharedProgress] Deprecated sync invoked (no-op). Remove call-site usage.');
  }
};

export function useSharedProgress(
  _userId: string | null,
  _coupleSpaceId: string | null,
  _onRemoteUpdate: (data: SharedProgressData) => void,
): UseSharedProgressReturn {
  return {
    initialData: null,
    syncToRemote: () => warnDeprecatedSync(),
    ready: true,
    syncStatus: 'idle',
    lastSyncError: null,
    retrySync: () => {},
  };
}
