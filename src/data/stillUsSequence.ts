/**
 * Vårt Vi v3.1 — Canonical 18-card sequence & phase constants.
 * Cards are delivered in this exact clinical order. No user choice.
 *
 * v3.1 changes vs v3.0:
 *  - Removed 3 cards (first-conversation, our-philosophy, choosing-to-stay)
 *  - Re-grouped remaining 18 cards into 4 thematic layers (4/5/5/4)
 *    per the D1 thematic split (NOT positional buckets).
 */

export const TOTAL_PROGRAM_CARDS = 18;
export const FREE_TRIAL_CARDS = 1; // Card 0 is free
export const TOTAL_TILLBAKA_CARDS = 12;
export const RESTART_MIN_TILLBAKA = 4;

/** Layer boundaries (0-indexed card ranges) — derived from CARD_SEQUENCE below */
export const LAYERS = [
  { id: 'layer-1', name: 'Vardagen',    cards: [0, 1, 2, 3] },
  { id: 'layer-2', name: 'Tillsammans', cards: [4, 5, 6, 7, 8] },
  { id: 'layer-3', name: 'Grunden',     cards: [9, 10, 11, 12, 13] },
  { id: 'layer-4', name: 'Riktningen',  cards: [14, 15, 16, 17] },
] as const;

/** Slider check-in phase progression */
export type SliderPhase = 'A' | 'B' | 'C';

export function getSliderPhase(cardIndex: number): SliderPhase {
  if (cardIndex <= 5) return 'A';   // Cards 0-5
  if (cardIndex <= 11) return 'B';  // Cards 6-11
  return 'C';                        // Cards 12-17
}

/** The canonical 18-card order — D1 thematic grouping (4/5/5/4) */
export const CARD_SEQUENCE: { index: number; cardId: string; title: string; layerIndex: number }[] = [
  // Vardagen (4) — everyday mechanics
  { index: 0,  cardId: 'su-00-smallest-we',              title: 'Ert minsta "vi"',            layerIndex: 0 },
  { index: 1,  cardId: 'su-01-worth-spending-on',        title: 'Värt att spendera på',       layerIndex: 0 },
  { index: 2,  cardId: 'su-02-adrift',                   title: 'På drift',                   layerIndex: 0 },
  { index: 3,  cardId: 'su-03-love-languages',           title: 'Att nå fram',                layerIndex: 0 },
  // Tillsammans (5) — emotional
  { index: 4,  cardId: 'su-04-listening-presence',       title: 'När dagen är slut',          layerIndex: 1 },
  { index: 5,  cardId: 'su-05-expressing-needs',         title: 'Mitt sätt, ditt sätt',       layerIndex: 1 },
  { index: 6,  cardId: 'su-06-facing-adversity',         title: 'Att möta motgångar',         layerIndex: 1 },
  { index: 7,  cardId: 'su-07-conflict-repair',          title: 'Rollerna ni tar',            layerIndex: 1 },
  { index: 8,  cardId: 'su-08-when-life-tilts',          title: 'När livet lutar',            layerIndex: 1 },
  // Grunden (5) — formative
  { index: 9,  cardId: 'su-09-our-traditions',           title: 'Era traditioner',            layerIndex: 2 },
  { index: 10, cardId: 'su-10-identity-shift',           title: 'Identitetsskiftet',          layerIndex: 2 },
  { index: 11, cardId: 'su-11-behind-the-scenes',        title: 'Bakom kulisserna',           layerIndex: 2 },
  { index: 12, cardId: 'su-12-thoughtful-space',         title: 'Omtänksamt utrymme',         layerIndex: 2 },
  { index: 13, cardId: 'su-13-self-esteem-wavering',     title: 'När jag vacklar',            layerIndex: 2 },
  // Riktningen (4) — direction & parenting
  { index: 14, cardId: 'su-14-family-ab',                title: 'Familjen AB',                layerIndex: 3 },
  { index: 15, cardId: 'su-15-parenting-boundaries',     title: 'Att säga ifrån',             layerIndex: 3 },
  { index: 16, cardId: 'su-16-different-parenting-styles', title: 'Uppfostran ni ärvt',       layerIndex: 3 },
  { index: 17, cardId: 'su-17-parenting-exhaustion',     title: 'Era värderingar',            layerIndex: 3 },
];

/** Stale card thresholds */
export const STALE_SKIP_AVAILABLE_DAYS = 14;
export const STALE_AUTO_ADVANCE_DAYS = 21;
export const DORMANCY_THRESHOLD_DAYS = 7;
