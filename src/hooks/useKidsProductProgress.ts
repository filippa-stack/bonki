/**
 * useKidsProductProgress — Progress, expiring completions, and "next" logic for kids products.
 *
 * - Fetches completed sessions (with ended_at) for a specific product
 * - Applies 14-day expiry: completion markers disappear after 14 days
 * - Determines "next suggested" card and category
 * - Fetches active session for resume banner
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import type { ProductManifest } from '@/types/product';

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

/** All kids product IDs */
export const KIDS_PRODUCT_IDS = [
  'jag_i_mig', 'jag_med_andra', 'jag_i_varlden',
  'vardagskort', 'syskonkort', 'sexualitetskort',
];

/** @deprecated All kids products now use 1-step sessions (prompts flattened) */
export const TYPE_A_PRODUCTS: string[] = [];

/** @deprecated No longer relevant — all kids products use 1-step sessions */
export function isTypeAProduct(_productId: string): boolean {
  return false;
}

export interface KidsProductProgress {
  /** Card IDs with recent (< 14 days) completion */
  recentlyCompletedCardIds: string[];
  /** Card IDs with active session */
  activeCardIds: string[];
  /** Active session details (for resume banner) */
  activeSession: {
    sessionId: string;
    cardId: string;
    categoryId: string;
    currentStepIndex: number;
  } | null;
  /** The first uncompleted card ID in sequence (across all categories) */
  nextSuggestedCardId: string | null;
  /** The category ID containing the next suggested card */
  nextSuggestedCategoryId: string | null;
  /** Per-category completion counts: { categoryId: { completed: n, total: n, allDone: bool } } */
  categoryProgress: Record<string, { completed: number; total: number; allDone: boolean }>;
  loading: boolean;
}

export function useKidsProductProgress(product: ProductManifest | undefined): KidsProductProgress {
  const { space } = useCoupleSpaceContext();
  const [completedSessions, setCompletedSessions] = useState<{ card_id: string; ended_at: string }[]>([]);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    cardId: string;
    categoryId: string;
  } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const productId = product?.id;

  useEffect(() => {
    if (!space?.id || !productId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Fetch completed sessions for this product
    const fetchCompleted = supabase
      .from('couple_sessions')
      .select('card_id, ended_at')
      .eq('couple_space_id', space.id)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .order('ended_at', { ascending: false });

    // Fetch active session for this product
    const fetchActive = supabase
      .from('couple_sessions')
      .select('id, card_id, category_id')
      .eq('couple_space_id', space.id)
      .eq('product_id', productId)
      .eq('status', 'active')
      .limit(1);

    Promise.all([fetchCompleted, fetchActive]).then(async ([completedRes, activeRes]) => {
      if (cancelled) return;

      if (completedRes.data) {
        setCompletedSessions(
          completedRes.data
            .filter(s => s.card_id && s.ended_at)
            .map(s => ({ card_id: s.card_id!, ended_at: s.ended_at! }))
        );
      }

      if (activeRes.data && activeRes.data.length > 0) {
        const session = activeRes.data[0];
        setActiveSession({
          sessionId: session.id,
          cardId: session.card_id!,
          categoryId: session.category_id!,
        });

        // Fetch current step index for resume
        const { data: completions } = await supabase
          .from('couple_session_completions')
          .select('step_index')
          .eq('session_id', session.id);

        if (!cancelled) {
          const completedSteps = new Set((completions || []).map(c => c.step_index));
          // Find first incomplete step
          const { data: steps } = await supabase
            .from('couple_session_steps')
            .select('step_index')
            .eq('session_id', session.id)
            .order('step_index');

          if (!cancelled && steps) {
            const firstIncomplete = steps.find(s => !completedSteps.has(s.step_index));
            setCurrentStepIndex(firstIncomplete?.step_index ?? 0);
          }
        }
      } else {
        setActiveSession(null);
      }

      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [space?.id, productId]);

  // Apply 14-day expiry
  const recentlyCompletedCardIds = useMemo(() => {
    const now = Date.now();
    const seen = new Set<string>();
    const result: string[] = [];
    for (const s of completedSessions) {
      if (seen.has(s.card_id)) continue;
      seen.add(s.card_id);
      const elapsed = now - new Date(s.ended_at).getTime();
      if (elapsed < FOURTEEN_DAYS_MS) {
        result.push(s.card_id);
      }
    }
    return result;
  }, [completedSessions]);

  // Determine next suggested card and category
  const { nextSuggestedCardId, nextSuggestedCategoryId, categoryProgress } = useMemo(() => {
    if (!product) {
      return { nextSuggestedCardId: null, nextSuggestedCategoryId: null, categoryProgress: {} };
    }

    const completedSet = new Set(recentlyCompletedCardIds);
    const activeCardId = activeSession?.cardId;
    const progress: Record<string, { completed: number; total: number; allDone: boolean }> = {};
    let nextCardId: string | null = null;
    let nextCatId: string | null = null;

    for (const cat of product.categories) {
      const catCards = product.cards.filter(c => c.categoryId === cat.id);
      const completedCount = catCards.filter(c => completedSet.has(c.id)).length;
      const allDone = catCards.length > 0 && completedCount === catCards.length;
      progress[cat.id] = { completed: completedCount, total: catCards.length, allDone };

      // Find the first "next" card (first uncompleted in first incomplete category)
      // Also skip cards with an active session (resume banner handles those)
      if (!nextCardId && !allDone) {
        for (const card of catCards) {
          if (!completedSet.has(card.id) && card.id !== activeCardId) {
            nextCardId = card.id;
            nextCatId = cat.id;
            break;
          }
        }
      }
    }

    return {
      nextSuggestedCardId: nextCardId,
      nextSuggestedCategoryId: nextCatId,
      categoryProgress: progress,
    };
  }, [product, recentlyCompletedCardIds, activeSession?.cardId]);

  return {
    recentlyCompletedCardIds,
    activeCardIds: activeSession ? [activeSession.cardId] : [],
    activeSession: activeSession ? { ...activeSession, currentStepIndex } : null,
    nextSuggestedCardId,
    nextSuggestedCategoryId,
    categoryProgress,
    loading,
  };
}
