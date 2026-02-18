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
    if (!user?.id || !space?.id || !cardId) return;

    const now = new Date().toISOString();

    // Upsert with GREATEST semantics so last_visited_at never decreases.
    // The unique constraint on (couple_space_id, user_id, card_id) triggers the ON CONFLICT path.
    await supabase.rpc('upsert_card_visit' as never, {
      p_couple_space_id: space.id,
      p_user_id: user.id,
      p_card_id: cardId,
      p_visited_at: now,
    } as never);
  }, [user?.id, space?.id]);

  return { recordVisit };
}
