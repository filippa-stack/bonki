/**
 * spaceSnapshotSelectors.ts
 *
 * Pure, deterministic, side-effect-free selectors over SpaceSnapshot.
 * These replace journeyState-derived computations with normalized-table data.
 *
 * All selectors accept SpaceSnapshot | null and return a safe default when null.
 */

import type { SpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import type { Card, Category } from '@/types';

// ---------------------------------------------------------------------------
// selectLastActivityAt
// ---------------------------------------------------------------------------

/**
 * Returns the most recent activity timestamp across:
 *   - all card visits (any member of the space)
 *   - all step completions for the active session
 *
 * Returns null if no activity exists.
 */
export function selectLastActivityAt(snapshot: SpaceSnapshot | null): Date | null {
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
// selectCardVisitDates
// ---------------------------------------------------------------------------

/**
 * Returns a Record<cardId, ISO timestamp> with the most recent visit date
 * per card, aggregated across all members of the space.
 */
export function selectCardVisitDates(snapshot: SpaceSnapshot | null): Record<string, string> {
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
// selectExploredCardIds
// ---------------------------------------------------------------------------

/**
 * A card is "explored" if it has at least one visit row for the space.
 *
 * Note: Future iterations may tighten this to require both members to have
 * completed all steps. For now, any visit marks the card as explored to
 * match the existing UX baseline.
 *
 * Returns a stable sorted array of card IDs.
 */
export function selectExploredCardIds(snapshot: SpaceSnapshot | null): string[] {
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
// selectLastOpenedCardId
// ---------------------------------------------------------------------------

/**
 * Returns the card_id of the most recently visited card by the viewer.
 * Falls back to the most recent visit across the whole space if the viewer
 * has no visits.
 */
export function selectLastOpenedCardId(snapshot: SpaceSnapshot | null): string | null {
  if (!snapshot || snapshot.visits.length === 0) return null;

  const { userId } = snapshot.viewer;

  // Prefer the viewer's own visits
  const viewerVisits = snapshot.visits.filter((v) => v.user_id === userId);
  const pool = viewerVisits.length > 0 ? viewerVisits : snapshot.visits;

  // Visits are already ordered descending by last_visited_at from the query
  return pool[0]?.card_id ?? null;
}

// ---------------------------------------------------------------------------
// selectLastCompletedCardId
// ---------------------------------------------------------------------------

/**
 * Returns the card_id from the most recently completed step the viewer was
 * involved in. Uses the session on snapshot if present; otherwise null.
 *
 * Matches the prior UX: reflects the active session's card (which is the
 * card the couple is currently working on / last completed).
 */
export function selectLastCompletedCardId(snapshot: SpaceSnapshot | null): string | null {
  if (!snapshot || !snapshot.sessions) return null;

  const { userId } = snapshot.viewer;
  const { completions, session } = snapshot.sessions;

  // Find the most recent completion by the viewer
  const viewerCompletions = completions
    .filter((c) => c.user_id === userId)
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at));

  if (viewerCompletions.length > 0) {
    return session.card_id;
  }

  return null;
}

// ---------------------------------------------------------------------------
// selectSuggestedNextCardId
// ---------------------------------------------------------------------------

/**
 * Derives the next suggested card using the same algorithm as AppContext.endSession:
 *
 * 1. Look for the next unexplored card in the same category (wrap around).
 * 2. If none found, scan subsequent categories in order for any unexplored card.
 * 3. Returns null if all cards are explored.
 *
 * Requires the full ordered content arrays (categories, cards) passed in —
 * this selector does NOT import from content.ts to stay pure and testable.
 */
export function selectSuggestedNextCardId(
  snapshot: SpaceSnapshot | null,
  allCategories: Category[],
  allCards: Card[],
): string | null {
  if (!snapshot || !snapshot.sessions) return null;

  const { card_id: currentCardId, category_id: currentCategoryId } = snapshot.sessions.session;
  if (!currentCardId || !currentCategoryId) return null;

  const exploredIds = selectExploredCardIds(snapshot);
  const exploredSet = new Set(exploredIds);

  const categoryCards = allCards.filter((c) => c.categoryId === currentCategoryId);
  const currentIndex = categoryCards.findIndex((c) => c.id === currentCardId);

  // 1. Next unexplored in same category
  for (let i = 1; i <= categoryCards.length; i++) {
    const next = categoryCards[(currentIndex + i) % categoryCards.length];
    if (!exploredSet.has(next.id)) {
      return next.id;
    }
  }

  // 2. Next unexplored in subsequent categories
  const catIndex = allCategories.findIndex((c) => c.id === currentCategoryId);
  for (let ci = 1; ci <= allCategories.length; ci++) {
    const nextCat = allCategories[(catIndex + ci) % allCategories.length];
    const nextCatCards = allCards.filter((c) => c.categoryId === nextCat.id);
    const unexplored = nextCatCards.find((c) => !exploredSet.has(c.id));
    if (unexplored) return unexplored.id;
  }

  return null;
}
