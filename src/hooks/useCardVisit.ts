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
    // Handled by upsert_card_visit SECURITY DEFINER function.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.rpc as any)('upsert_card_visit', {
      p_couple_space_id: space.id,
      p_user_id: user.id,
      p_card_id: cardId,
      p_visited_at: now,
    });
  }, [user?.id, space?.id]);

  return { recordVisit };
}
