// src/selectors/spaceSnapshotSelectors.ts

type Scope = 'space' | 'viewer';

type SnapshotVisit = {
  card_id: string;
  user_id: string;
  last_visited_at: string; // ISO
};

type SpaceSnapshot = {
  viewer?: { userId?: string | null };
  visits?: SnapshotVisit[];
  // Optional fields (may exist later)
  completions?: Array<{ card_id: string; created_at: string; user_id?: string | null }>;
} | null | undefined;

type SelectorOptions = {
  scope?: Scope;          // default: 'space'
  userId?: string | null; // used when scope='viewer'
};

function getScope(options?: SelectorOptions): Scope {
  return options?.scope ?? 'space';
}

function getUserId(snapshot: SpaceSnapshot, options?: SelectorOptions): string | null {
  return options?.userId ?? snapshot?.viewer?.userId ?? null;
}

function filteredVisits(snapshot: SpaceSnapshot, options?: SelectorOptions): SnapshotVisit[] {
  const visits = snapshot?.visits ?? [];
  const scope = getScope(options);
  if (scope === 'viewer') {
    const uid = getUserId(snapshot, options);
    if (!uid) return [];
    return visits.filter(v => v.user_id === uid);
  }
  return visits;
}

function maxIsoDate(a: string, b: string): string {
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

/** SPACE-LEVEL by default: max across all users */
export function selectLastActivityAt(snapshot: SpaceSnapshot, options?: SelectorOptions): Date | null {
  const visits = filteredVisits(snapshot, options);
  if (visits.length === 0) return null;
  let maxTs = visits[0].last_visited_at;
  for (let i = 1; i < visits.length; i++) {
    maxTs = maxIsoDate(maxTs, visits[i].last_visited_at);
  }
  const d = new Date(maxTs);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** SPACE-LEVEL by default: union across all users */
export function selectExploredCardIds(snapshot: SpaceSnapshot, options?: SelectorOptions): string[] {
  const visits = filteredVisits(snapshot, options);
  const set = new Set<string>();
  for (const v of visits) set.add(v.card_id);
  return Array.from(set);
}

/** SPACE-LEVEL by default: per card max(last_visited_at) across all users */
export function selectCardVisitDates(snapshot: SpaceSnapshot, options?: SelectorOptions): Record<string, string> {
  const visits = filteredVisits(snapshot, options);
  const map: Record<string, string> = {};
  for (const v of visits) {
    const existing = map[v.card_id];
    map[v.card_id] = existing ? maxIsoDate(existing, v.last_visited_at) : v.last_visited_at;
  }
  return map;
}

/** SPACE-LEVEL by default: card with the most recent max(last_visited_at) */
export function selectLastOpenedCardId(snapshot: SpaceSnapshot, options?: SelectorOptions): string | null {
  const visitDates = selectCardVisitDates(snapshot, options);
  let bestCardId: string | null = null;
  let bestTs: string | null = null;

  for (const [cardId, ts] of Object.entries(visitDates)) {
    if (!bestTs || new Date(ts).getTime() > new Date(bestTs).getTime()) {
      bestTs = ts;
      bestCardId = cardId;
    }
  }
  return bestCardId;
}

/**
 * Default SPACE-LEVEL: if snapshot.completions exists, pick the most recent completion by created_at.
 * If completions not provided yet, return null (Home already handles fallbacks).
 */
export function selectLastCompletedCardId(snapshot: SpaceSnapshot, options?: SelectorOptions): string | null {
  const completions = snapshot?.completions ?? [];
  if (completions.length === 0) return null;

  const scope = getScope(options);
  const uid = scope === 'viewer' ? getUserId(snapshot, options) : null;

  let best: { card_id: string; created_at: string } | null = null;
  for (const c of completions) {
    if (scope === 'viewer' && uid && c.user_id && c.user_id !== uid) continue;
    if (!best || new Date(c.created_at).getTime() > new Date(best.created_at).getTime()) {
      best = { card_id: c.card_id, created_at: c.created_at };
    }
  }
  return best?.card_id ?? null;
}

/**
 * Suggested-next selector: keep your existing algorithm, but ensure it uses SPACE-LEVEL exploredIds by default.
 * Signature matches your Home.tsx usage: selectSuggestedNextCardId(snapshot, allCategories, allCards)
 */
export function selectSuggestedNextCardId(
  snapshot: SpaceSnapshot,
  allCategories: Array<{ id: string }>,
  allCards: Array<{ id: string; categoryId: string }>,
  options?: SelectorOptions
): string | null {
  const explored = new Set(selectExploredCardIds(snapshot, options)); // default space-level

  // If nothing explored, suggest first card in first category (stable)
  if (explored.size === 0) {
    const firstCat = allCategories[0];
    if (!firstCat) return null;
    const firstCard = allCards.find(c => c.categoryId === firstCat.id);
    return firstCard?.id ?? null;
  }

  // Simple deterministic suggestion: first unexplored card in category order, then next categories
  for (const cat of allCategories) {
    const catCards = allCards.filter(c => c.categoryId === cat.id);
    const next = catCards.find(c => !explored.has(c.id));
    if (next) return next.id;
  }

  return null;
}
