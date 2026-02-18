/**
 * spaceSnapshotSelectors.ts
 *
 * Pure, deterministic, side-effect-free selectors over SpaceSnapshot.
 * All selectors are SPACE-LEVEL: they aggregate across all members of the space.
 *
 * All selectors accept SpaceSnapshot | null and return a safe default when null.
 */

import type { SpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import type { Card, Category } from '@/types';

// ---------------------------------------------------------------------------
// selectSpaceLastActivityAt
// ---------------------------------------------------------------------------

/**
 * Returns the most recent activity timestamp across:
 *   - all card visits (any member of the space)
 *   - all step completions for the active session
 *
 * Returns null if no activity exists.
 */
export function selectSpaceLastActivityAt(snapshot: SpaceSnapshot | null): Date | null {
  if (!snapshot) return null;

  const candidates: string[] = [];

  for (const v of snapshot.visits) {
    candidates.push(v.last_visited_at);
  }

  if (snapshot.sessions) {
    for (const c of snapshot.sessions.completions) {
      candidates.push(c.completed_at);
    }
    candidates.push(snapshot.sessions.session.started_at);
  }

  if (candidates.length === 0) return null;

  return new Date(candidates.reduce((max, ts) => (ts > max ? ts : max)));
}

// ---------------------------------------------------------------------------
// selectSpaceCardVisitDates
// ---------------------------------------------------------------------------

/**
 * Returns a Record<cardId, ISO timestamp> with the most recent visit date
 * per card, aggregated across all members of the space.
 */
export function selectSpaceCardVisitDates(snapshot: SpaceSnapshot | null): Record<string, string> {
  if (!snapshot) return {};

  const result: Record<string, string> = {};

  for (const v of snapshot.visits) {
    const existing = result[v.card_id];
    if (!existing || v.last_visited_at > existing) {
      result[v.card_id] = v.last_visited_at;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// selectSpaceExploredCardIds
// ---------------------------------------------------------------------------

/**
 * A card is "explored" if it has at least one visit row for the space.
 *
 * Returns a stable sorted array of card IDs.
 */
export function selectSpaceExploredCardIds(snapshot: SpaceSnapshot | null): string[] {
  if (!snapshot) return [];

  const ids = new Set<string>();

  for (const v of snapshot.visits) {
    ids.add(v.card_id);
  }

  return Array.from(ids).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
}

// ---------------------------------------------------------------------------
// selectSpaceLastOpenedCardId
// ---------------------------------------------------------------------------

/**
 * Returns the card_id with the latest max(last_visited_at) across all space members.
 */
export function selectSpaceLastOpenedCardId(snapshot: SpaceSnapshot | null): string | null {
  if (!snapshot || snapshot.visits.length === 0) return null;

  // Aggregate max per card across all users
  const maxPerCard: Record<string, string> = {};
  for (const v of snapshot.visits) {
    const existing = maxPerCard[v.card_id];
    if (!existing || v.last_visited_at > existing) {
      maxPerCard[v.card_id] = v.last_visited_at;
    }
  }

  let bestCard: string | null = null;
  let bestTs = '';
  for (const [cardId, ts] of Object.entries(maxPerCard)) {
    if (ts > bestTs) {
      bestTs = ts;
      bestCard = cardId;
    }
  }

  return bestCard;
}

// ---------------------------------------------------------------------------
// selectViewerLastOpenedCardId  (viewer-scoped helper)
// ---------------------------------------------------------------------------

/**
 * Returns the card_id of the most recently visited card by the viewer.
 * Falls back to the space-level last opened card if the viewer has no visits.
 */
export function selectViewerLastOpenedCardId(snapshot: SpaceSnapshot | null): string | null {
  if (!snapshot || snapshot.visits.length === 0) return null;

  const { userId } = snapshot.viewer;
  const viewerVisits = snapshot.visits.filter((v) => v.user_id === userId);
  const pool = viewerVisits.length > 0 ? viewerVisits : snapshot.visits;

  // Visits are ordered descending by last_visited_at from the query
  return pool[0]?.card_id ?? null;
}

// ---------------------------------------------------------------------------
// selectSuggestedNextCardId
// ---------------------------------------------------------------------------

/**
 * Derives the next suggested card:
 * 1. Next unexplored card in the same category (wrap around).
 * 2. If none, scan subsequent categories for any unexplored card.
 * 3. Returns null if all cards are explored.
 */
export function selectSuggestedNextCardId(
  snapshot: SpaceSnapshot | null,
  allCategories: Category[],
  allCards: Card[],
): string | null {
  if (!snapshot || !snapshot.sessions) return null;

  const { card_id: currentCardId, category_id: currentCategoryId } = snapshot.sessions.session;
  if (!currentCardId || !currentCategoryId) return null;

  const exploredSet = new Set(selectSpaceExploredCardIds(snapshot));

  const categoryCards = allCards.filter((c) => c.categoryId === currentCategoryId);
  const currentIndex = categoryCards.findIndex((c) => c.id === currentCardId);

  // 1. Next unexplored in same category
  for (let i = 1; i <= categoryCards.length; i++) {
    const next = categoryCards[(currentIndex + i) % categoryCards.length];
    if (!exploredSet.has(next.id)) return next.id;
  }

  // 2. Next unexplored in subsequent categories
  const catIndex = allCategories.findIndex((c) => c.id === currentCategoryId);
  for (let ci = 1; ci <= allCategories.length; ci++) {
    const nextCat = allCategories[(catIndex + ci) % allCategories.length];
    const unexplored = allCards.find(
      (c) => c.categoryId === nextCat.id && !exploredSet.has(c.id)
    );
    if (unexplored) return unexplored.id;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Legacy aliases (backward compat with existing imports)
// ---------------------------------------------------------------------------

/** @deprecated Use selectSpaceLastActivityAt */
export const selectLastActivityAt = selectSpaceLastActivityAt;
/** @deprecated Use selectSpaceCardVisitDates */
export const selectCardVisitDates = selectSpaceCardVisitDates;
/** @deprecated Use selectSpaceExploredCardIds */
export const selectExploredCardIds = selectSpaceExploredCardIds;
/** @deprecated Use selectViewerLastOpenedCardId */
export const selectLastOpenedCardId = selectViewerLastOpenedCardId;
/** @deprecated No longer meaningful — returns null */
export const selectLastCompletedCardId = (_snapshot: SpaceSnapshot | null): string | null => null;
