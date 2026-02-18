/**
 * spaceSnapshotSelectors.ts
 *
 * Pure, deterministic, side-effect-free selectors over SpaceSnapshot.
 *
 * Default scope = 'space': aggregates across ALL members of the space.
 * Pass options.scope = 'viewer' (with options.userId) to narrow to one user.
 *
 * All selectors accept SpaceSnapshot | null and return a safe default when null.
 */

import type { SpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import type { Card, Category } from '@/types';

// ---------------------------------------------------------------------------
// Shared options type
// ---------------------------------------------------------------------------

export interface SelectorOptions {
  userId?: string;
  scope?: 'space' | 'viewer';
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function filterVisits(snapshot: SpaceSnapshot, options?: SelectorOptions) {
  const scope = options?.scope ?? 'space';
  if (scope === 'viewer' && options?.userId) {
    return snapshot.visits.filter((v) => v.user_id === options.userId);
  }
  return snapshot.visits;
}

// ---------------------------------------------------------------------------
// selectLastActivityAt
// ---------------------------------------------------------------------------

/**
 * Returns the most recent activity timestamp.
 * Space-level by default: max(last_visited_at) across ALL users + session completions.
 */
export function selectLastActivityAt(
  snapshot: SpaceSnapshot | null,
  options?: SelectorOptions,
): Date | null {
  if (!snapshot) return null;

  const candidates: string[] = [];

  for (const v of filterVisits(snapshot, options)) {
    candidates.push(v.last_visited_at);
  }

  // Session completions are always space-level signals
  if ((options?.scope ?? 'space') === 'space' && snapshot.sessions) {
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
 * Returns Record<cardId, ISO timestamp> with the most recent visit date per card.
 * Space-level by default: max across all users for each card.
 */
export function selectCardVisitDates(
  snapshot: SpaceSnapshot | null,
  options?: SelectorOptions,
): Record<string, string> {
  if (!snapshot) return {};

  const result: Record<string, string> = {};

  for (const v of filterVisits(snapshot, options)) {
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
 * A card is "explored" if it has at least one visit row.
 * Space-level by default: any visit from any member counts.
 * Returns a stable sorted array of card IDs.
 */
export function selectExploredCardIds(
  snapshot: SpaceSnapshot | null,
  options?: SelectorOptions,
): string[] {
  if (!snapshot) return [];

  const ids = new Set<string>();

  for (const v of filterVisits(snapshot, options)) {
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
 * Returns the card_id with the latest max(last_visited_at).
 * Space-level by default: picks the globally most recently visited card.
 */
export function selectLastOpenedCardId(
  snapshot: SpaceSnapshot | null,
  options?: SelectorOptions,
): string | null {
  if (!snapshot || snapshot.visits.length === 0) return null;

  const visits = filterVisits(snapshot, options);
  if (visits.length === 0) {
    // Viewer scope with no visits → fall back to space level
    return selectLastOpenedCardId(snapshot);
  }

  const maxPerCard: Record<string, string> = {};
  for (const v of visits) {
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
// selectLastCompletedCardId
// ---------------------------------------------------------------------------

/**
 * Space-level: returns null (completion state is tracked via sessions, not visits).
 * Kept for backward compat.
 */
export function selectLastCompletedCardId(_snapshot: SpaceSnapshot | null): string | null {
  return null;
}

// ---------------------------------------------------------------------------
// selectSuggestedNextCardId
// ---------------------------------------------------------------------------

/**
 * Derives the next suggested card using space-level explored set:
 * 1. Next unexplored card in the same category (wrap around).
 * 2. If none, scan subsequent categories for any unexplored card.
 * 3. Returns null if all cards are explored.
 */
export function selectSuggestedNextCardId(
  snapshot: SpaceSnapshot | null,
  allCategories: Category[],
  allCards: Card[],
  options?: SelectorOptions,
): string | null {
  if (!snapshot || !snapshot.sessions) return null;

  const { card_id: currentCardId, category_id: currentCategoryId } = snapshot.sessions.session;
  if (!currentCardId || !currentCategoryId) return null;

  // Always use space-level explored set to avoid drift
  const exploredSet = new Set(selectExploredCardIds(snapshot, { scope: 'space' }));

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
// Space-named aliases (explicit, non-deprecated)
// ---------------------------------------------------------------------------

export const selectSpaceLastActivityAt = selectLastActivityAt;
export const selectSpaceCardVisitDates = selectCardVisitDates;
export const selectSpaceExploredCardIds = selectExploredCardIds;
export const selectSpaceLastOpenedCardId = selectLastOpenedCardId;

// ---------------------------------------------------------------------------
// Viewer-scoped convenience (pass-throughs with scope forced)
// ---------------------------------------------------------------------------

export function selectViewerLastOpenedCardId(
  snapshot: SpaceSnapshot | null,
  userId?: string,
): string | null {
  return selectLastOpenedCardId(snapshot, { scope: 'viewer', userId });
}
