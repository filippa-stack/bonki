/**
 * Still Us v3.0 — Canonical 20-card sequence & phase constants.
 * Cards are delivered in this exact clinical order. No user choice.
 */

export const TOTAL_PROGRAM_CARDS = 20;
export const FREE_TRIAL_CARDS = 1; // Card 0 is free
export const TOTAL_TILLBAKA_CARDS = 12;
export const RESTART_MIN_TILLBAKA = 4;

/** Layer boundaries (0-indexed card ranges) */
export const LAYERS = [
  { id: 'layer-1', name: 'Vardagen', cards: [0, 1, 2, 3] },
  { id: 'layer-2', name: 'Tillsammans', cards: [4, 5, 6, 7, 8, 9] },
  { id: 'layer-3', name: 'Grunden', cards: [10, 11, 12, 13, 14, 15] },
  { id: 'layer-4', name: 'Riktningen', cards: [16, 17, 18, 19] },
] as const;

/** Slider check-in phase progression */
export type SliderPhase = 'A' | 'B' | 'C';

export function getSliderPhase(cardIndex: number): SliderPhase {
  if (cardIndex <= 5) return 'A';   // Cards 0-5: sliders only
  if (cardIndex <= 12) return 'B';  // Cards 6-12: sliders + reflection
  return 'C';                        // Cards 13-19: sliders + deeper reflection
}

/** The canonical 20-card order — card IDs mapped to index */
export const CARD_SEQUENCE: { index: number; cardId: string; title: string; layerIndex: number }[] = [
  { index: 0, cardId: 'su-01-smallest-we', title: 'Ert minsta "vi"', layerIndex: 0 },
  { index: 1, cardId: 'su-02-family-ab', title: 'När ert "vi" blir "Familjen AB"', layerIndex: 0 },
  { index: 2, cardId: 'su-03-identity-shift', title: 'Identitetsskiftet', layerIndex: 0 },
  { index: 3, cardId: 'su-04-day-is-over', title: 'När dagen är slut', layerIndex: 0 },
  { index: 4, cardId: 'su-05-roles', title: 'Rollerna ni tar (och får)', layerIndex: 1 },
  { index: 5, cardId: 'su-06-my-way-your-way', title: 'Mitt sätt, ditt sätt', layerIndex: 1 },
  { index: 6, cardId: 'su-07-adversity', title: 'Att möta motgångar', layerIndex: 1 },
  { index: 7, cardId: 'su-08-behind-scenes', title: 'Framför och bakom kulisserna', layerIndex: 1 },
  { index: 8, cardId: 'su-09-thoughtful-space', title: 'Omtänksamt utrymme', layerIndex: 1 },
  { index: 9, cardId: 'su-10-self-esteem', title: 'När självkänslan svajar', layerIndex: 1 },
  { index: 10, cardId: 'su-11-inherited-parenting', title: 'Uppfostran ni ärvt', layerIndex: 2 },
  { index: 11, cardId: 'su-12-boundaries', title: 'Att säga ifrån', layerIndex: 2 },
  { index: 12, cardId: 'su-13-values', title: 'Mina, dina, era värderingar', layerIndex: 2 },
  { index: 13, cardId: 'su-14-traditions', title: 'Mina, dina, era traditioner', layerIndex: 2 },
  { index: 14, cardId: 'su-15-philosophy', title: 'Er filosofi', layerIndex: 2 },
  { index: 15, cardId: 'su-16-life-tilts', title: 'När livet lutar', layerIndex: 2 },
  { index: 16, cardId: 'su-17-worth-spending', title: 'Värt att spendera på', layerIndex: 3 },
  { index: 17, cardId: 'su-18-adrift', title: 'På drift', layerIndex: 3 },
  { index: 18, cardId: 'su-19-att-na-fram', title: 'Att nå fram', layerIndex: 3 },
  { index: 19, cardId: 'su-20-choosing', title: 'Att fortsätta välja', layerIndex: 3 },
];

/** Stale card thresholds */
export const STALE_SKIP_AVAILABLE_DAYS = 14;
export const STALE_AUTO_ADVANCE_DAYS = 21;
export const DORMANCY_THRESHOLD_DAYS = 7;
