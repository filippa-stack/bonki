/**
 * useCardVisit
 *
 * Upserts a card visit record into couple_card_visits whenever a user opens a card.
 * Uses GREATEST semantics so last_visited_at never decreases.
 *
 * Call recordVisit(cardId) once when the card view mounts.
 * No-ops silently when the user is unauthenticated or has no couple space.
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';

export function useCardVisit() {
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const recordVisit = useCallback(async (cardId: string) => {
    if (!cardId) return;

    // Wait briefly for space/user to be available (covers async loading race)
    const userId = user?.id;
    const spaceId = space?.id;
    if (!userId || !spaceId) {
      if (import.meta.env?.DEV) {
        console.warn('[useCardVisit] Skipped: user or space not ready', { userId: !!userId, spaceId: !!spaceId, cardId });
      }
      return;
    }

    const now = new Date().toISOString();

    // Upsert with GREATEST semantics so last_visited_at never decreases.
    // Handled by upsert_card_visit SECURITY DEFINER function.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)('upsert_card_visit', {
      p_couple_space_id: spaceId,
      p_user_id: userId,
      p_card_id: cardId,
      p_visited_at: now,
    });
    if (error) {
      console.error('[useCardVisit] upsert_card_visit failed:', error.message, { spaceId, userId, cardId });
    }
  }, [user?.id, space?.id]);

  return { recordVisit };
}
