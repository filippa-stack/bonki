/**
 * spaceSnapshotSelectors.ts
 *
 * Pure, deterministic, side-effect-free selectors over SpaceSnapshot.
 * These replace journeyState-derived computations with normalized-table data.
 *
 * Defaults are SPACE-LEVEL (aggregate across all members) to prevent device drift.
 * Viewer-level behavior is available via options: { scope: 'viewer' }.
 */

import type { SpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import type { Card, Category } from '@/types';

type SelectorScope = 'space' | 'viewer';
type SelectorOptions = {
  scope?: SelectorScope;     // default: 'space'
  userId?: string | null;    // optional override when scope='viewer'
};

function scopeOf(options?: SelectorOptions): SelectorScope {
  return options?.scope ?? 'space';
}

function viewerIdOf(snapshot: SpaceSnapshot | null, options?: SelectorOptions): string | null {
  return options?.userId ?? snapshot?.viewer?.userId ?? null;
}

function toMs(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

// ---------------------------------------------------------------------------
// selectLastActivityAt
// ---------------------------------------------------------------------------

/**
 * Returns the most recent activity timestamp across:
 *   - all card visits (any member of the space)
 *   - all step completions for the active session
 *
 * Returns null if no activity exists.
 *
 * NOTE: This is always SPACE-LEVEL (by design).
 */
export function selectLastActivityAt(snapshot: SpaceSnapshot | null): Date | null {
  if (!snapshot) return null;

  let bestMs = 0;

  for (const v of snapshot.visits) {
    bestMs = Math.max(bestMs, toMs(v.last_visited_at));
  }

  if (snapshot.sessions) {
    bestMs = Math.max(bestMs, toMs(snapshot.sessions.session.started_at));
    for (const c of snapshot.sessions.completions) {
      bestMs = Math.max(bestMs, toMs(c.completed_at));
    }
  }

  if (bestMs === 0) return null;
  return new Date(bestMs);
}

// ---------------------------------------------------------------------------
// selectCardVisitDates
// ---------------------------------------------------------------------------

/**
 * Returns a Record<cardId, ISO timestamp> with the most recent visit date
 * per card, aggregated across all members of the space (SPACE-LEVEL).
 */
export function selectCardVisitDates(snapshot: SpaceSnapshot | null): Record<string, string> {
  if (!snapshot) return {};

  const result: Record<string, string> = {};

  for (const v of snapshot.visits) {
    const existing = result[v.card_id];
    if (!existing || toMs(v.last_visited_at) > toMs(existing)) {
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
 * SPACE-LEVEL by default (union across all members).
 *
 * Returns a stable sorted array of card IDs.
 */
export function selectExploredCardIds(snapshot: SpaceSnapshot | null): string[] {
  if (!snapshot) return [];

  const ids = new Set<string>();
  for (const v of snapshot.visits) ids.add(v.card_id);

  return Array.from(ids).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
}

// ---------------------------------------------------------------------------
// selectLastOpenedCardId
// ---------------------------------------------------------------------------

/**
 * Returns the card_id of the most recently visited card.
 *
 * Default: SPACE-LEVEL (most recent visit across the whole space).
 * Optional: viewer-level via options { scope: 'viewer' }.
 */
export function selectLastOpenedCardId(
  snapshot: SpaceSnapshot | null,
  options?: SelectorOptions
): string | null {
  if (!snapshot || snapshot.visits.length === 0) return null;

  const scope = scopeOf(options);

  let pool = snapshot.visits;

  if (scope === 'viewer') {
    const uid = viewerIdOf(snapshot, options);
    if (!uid) return null;
    pool = snapshot.visits.filter((v) => v.user_id === uid);
    if (pool.length === 0) return null;
  }

  // Do NOT assume query order; compute max timestamp deterministically.
  let best = pool[0];
  let bestMs = toMs(best.last_visited_at);

  for (let i = 1; i < pool.length; i++) {
    const ms = toMs(pool[i].last_visited_at);
    if (ms > bestMs) {
      bestMs = ms;
      best = pool[i];
    }
  }

  return best?.card_id ?? null;
}

// ---------------------------------------------------------------------------
// selectLastCompletedCardId
// ---------------------------------------------------------------------------

/**
 * Returns the card_id associated with the most recent completion.
 *
 * Default: SPACE-LEVEL (most recent completion across all members).
 * Optional: viewer-level via options { scope: 'viewer' }.
 *
 * If sessions are not present on snapshot, returns null.
 */
export function selectLastCompletedCardId(
  snapshot: SpaceSnapshot | null,
  options?: SelectorOptions
): string | null {
  if (!snapshot || !snapshot.sessions) return null;

  const scope = scopeOf(options);
  const uid = scope === 'viewer' ? viewerIdOf(snapshot, options) : null;

  const { completions } = snapshot.sessions;
  if (!completions || completions.length === 0) return null;

  let best = null as null | { completed_at: string; card_id?: string };
  let bestMs = 0;

  for (const c of completions) {
    if (scope === 'viewer' && uid && c.user_id !== uid) continue;
    const ms = toMs(c.completed_at);
    if (ms > bestMs) {
      bestMs = ms;
      best = c as any;
    }
  }

  if (!best || bestMs === 0) return null;

  // Prefer completion.card_id if present; fall back to active session card_id.
  return (best as any).card_id ?? snapshot.sessions.session.card_id ?? null;
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
 * Uses SPACE-LEVEL exploredIds (default) to prevent drift.
 */
export function selectSuggestedNextCardId(
  snapshot: SpaceSnapshot | null,
  allCategories: Category[],
  allCards: Card[],
): string | null {
  if (!snapshot || !snapshot.sessions) return null;

  const { card_id: currentCardId, category_id: currentCategoryId } = snapshot.sessions.session;
  if (!currentCardId || !currentCategoryId) return null;

  const exploredIds = selectExploredCardIds(snapshot); // space-level
  const exploredSet = new Set(exploredIds);

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
    const nextCatCards = allCards.filter((c) => c.categoryId === nextCat.id);
    const unexplored = nextCatCards.find((c) => !exploredSet.has(c.id));
    if (unexplored) return unexplored.id;
  }

  return null;
}
