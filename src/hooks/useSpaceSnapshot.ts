// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

/**
 * useSpaceSnapshot — read-only aggregated view of a couple space.
 *
 * Fetches in a single Promise.all():
 *   - couple_members (memberCount)
 *   - couple_card_visits (all rows for the space)
 *   - couple_sessions (active session + steps + completions)
 *   - topic_proposals (all proposals for the space)
 *
 * No polling. Call refresh() to re-fetch.
 * No writes performed here — this hook is strictly read-only.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// ---------------------------------------------------------------------------
// Snapshot shape
// ---------------------------------------------------------------------------

export interface CardVisitRow {
  id: string;
  couple_space_id: string;
  user_id: string;
  card_id: string;
  last_visited_at: string;
}

export interface SessionSnapshot {
  session: Pick<
    Tables<'couple_sessions'>,
    'id' | 'card_id' | 'category_id' | 'status' | 'started_at' | 'created_by'
  >;
  steps: Array<Pick<Tables<'couple_session_steps'>, 'session_id' | 'step_index'>>;
  completions: Array<Pick<Tables<'couple_session_completions'>, 'session_id' | 'step_index' | 'user_id' | 'completed_at'>>;
}

export interface SpaceSnapshot {
  viewer: { userId: string };
  space: { id: string; memberCount: number };
  visits: CardVisitRow[];
  sessions: SessionSnapshot | null;
  proposals: Array<Pick<
    Tables<'topic_proposals'>,
    'id' | 'card_id' | 'category_id' | 'status' | 'proposed_by' | 'message' | 'created_at' | 'expires_at'
  >>;
}

export interface UseSpaceSnapshotReturn {
  snapshot: SpaceSnapshot | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSpaceSnapshot(
  userId: string | null,
  coupleSpaceId: string | null,
): UseSpaceSnapshotReturn {
  const [snapshot, setSnapshot] = useState<SpaceSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId || !coupleSpaceId) {
      setSnapshot(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        membersResult,
        visitsResult,
        sessionsResult,
        proposalsResult,
      ] = await Promise.all([
        // 1. Member count
        supabase
          .from('couple_members')
          .select('id', { count: 'exact', head: true })
          .eq('couple_space_id', coupleSpaceId)
          .is('left_at', null)
          .eq('status', 'active'),

        // 2. Card visits for this space
        supabase
          .from('couple_card_visits' as any)
          .select('id, couple_space_id, user_id, card_id, last_visited_at')
          .eq('couple_space_id', coupleSpaceId)
          .order('last_visited_at', { ascending: false }),

        // 3. Active session (at most one)
        supabase
          .from('couple_sessions')
          .select('id, card_id, category_id, status, started_at, created_by')
          .eq('couple_space_id', coupleSpaceId)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle(),

        // 4. Proposals for this space
        supabase
          .from('topic_proposals')
          .select('id, card_id, category_id, status, proposed_by, message, created_at, expires_at')
          .eq('couple_space_id', coupleSpaceId)
          .order('created_at', { ascending: false }),
      ]);

      // Collect errors
      const errs = [
        membersResult.error,
        visitsResult.error,
        sessionsResult.error,
        proposalsResult.error,
      ].filter(Boolean);

      if (errs.length) {
        const msg = errs.map((e) => e!.message).join('; ');
        console.error('[useSpaceSnapshot] fetch errors:', msg);
        setError(msg);
        setIsLoading(false);
        return;
      }

      // Build session snapshot if active session exists
      let sessionSnapshot: SessionSnapshot | null = null;
      const activeSession = sessionsResult.data;
      if (activeSession) {
        const [stepsResult, completionsResult] = await Promise.all([
          supabase
            .from('couple_session_steps')
            .select('session_id, step_index')
            .eq('session_id', activeSession.id),
          supabase
            .from('couple_session_completions')
            .select('session_id, step_index, user_id, completed_at')
            .eq('session_id', activeSession.id),
        ]);

        if (stepsResult.error || completionsResult.error) {
          const msg = [stepsResult.error, completionsResult.error]
            .filter(Boolean)
            .map((e) => e!.message)
            .join('; ');
          console.error('[useSpaceSnapshot] session detail errors:', msg);
          setError(msg);
          setIsLoading(false);
          return;
        }

        sessionSnapshot = {
          session: activeSession,
          steps: stepsResult.data ?? [],
          completions: completionsResult.data ?? [],
        };
      }

      setSnapshot({
        viewer: { userId },
        space: { id: coupleSpaceId, memberCount: membersResult.count ?? 0 },
        visits: (visitsResult.data as unknown as CardVisitRow[]) ?? [],
        sessions: sessionSnapshot,
        proposals: proposalsResult.data ?? [],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useSpaceSnapshot] unexpected error:', msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [userId, coupleSpaceId]);

  // Fetch on mount and when inputs change
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { snapshot, isLoading, error, refresh };
}
