/**
 * Still Us v2.5 — Canonical 22-card sequence & phase constants.
 * Cards are delivered in this exact clinical order. No user choice.
 */

export const TOTAL_PROGRAM_CARDS = 22;
export const FREE_TRIAL_CARDS = 1; // Card 0 is free
export const TOTAL_TILLBAKA_CARDS = 12;
export const RESTART_MIN_TILLBAKA = 4;

/** Layer boundaries (0-indexed card ranges) */
export const LAYERS = [
  { id: 'layer-1', name: 'Grunden', cards: [0, 1, 2, 3] },
  { id: 'layer-2', name: 'Det inre', cards: [4, 5, 6, 7, 8] },
  { id: 'layer-3', name: 'Det svåra', cards: [9, 10, 11, 12, 13] },
  { id: 'layer-4', name: 'Det öppna', cards: [14, 15, 16, 17] },
  { id: 'layer-5', name: 'Framåt', cards: [18, 19, 20, 21] },
] as const;

/** Slider check-in phase progression */
export type SliderPhase = 'A' | 'B' | 'C';

export function getSliderPhase(cardIndex: number): SliderPhase {
  if (cardIndex <= 6) return 'A';   // Cards 0-6: sliders only
  if (cardIndex <= 14) return 'B';  // Cards 7-14: sliders + reflection
  return 'C';                        // Cards 15-21: sliders + deeper reflection
}

/** The canonical 22-card order — card IDs mapped to index */
export const CARD_SEQUENCE: { index: number; cardId: string; title: string; layerIndex: number }[] = [
  { index: 0, cardId: 'su-01-smallest-we', title: 'Minsta vi', layerIndex: 0 },
  { index: 1, cardId: 'su-02-rhythm', title: 'Rytmen', layerIndex: 0 },
  { index: 2, cardId: 'su-03-safe-space', title: 'Trygga rummet', layerIndex: 0 },
  { index: 3, cardId: 'su-04-listening', title: 'Att lyssna', layerIndex: 0 },
  { index: 4, cardId: 'su-05-needs', title: 'Behov', layerIndex: 1 },
  { index: 5, cardId: 'su-06-boundaries', title: 'Gränser', layerIndex: 1 },
  { index: 6, cardId: 'su-07-patterns', title: 'Mönster', layerIndex: 1 },
  { index: 7, cardId: 'su-08-conflict', title: 'Konflikt', layerIndex: 1 },
  { index: 8, cardId: 'su-09-repair', title: 'Reparation', layerIndex: 1 },
  { index: 9, cardId: 'su-10-vulnerability', title: 'Sårbarhet', layerIndex: 2 },
  { index: 10, cardId: 'su-11-shame', title: 'Skam', layerIndex: 2 },
  { index: 11, cardId: 'su-12-control', title: 'Kontroll', layerIndex: 2 },
  { index: 12, cardId: 'su-13-loss', title: 'Förlust', layerIndex: 2 },
  { index: 13, cardId: 'su-14-anger', title: 'Ilska', layerIndex: 2 },
  { index: 14, cardId: 'su-15-desire', title: 'Längtan', layerIndex: 3 },
  { index: 15, cardId: 'su-16-intimacy', title: 'Intimitet', layerIndex: 3 },
  { index: 16, cardId: 'su-17-trust', title: 'Tillit', layerIndex: 3 },
  { index: 17, cardId: 'su-18-forgiveness', title: 'Förlåtelse', layerIndex: 3 },
  { index: 18, cardId: 'su-19-growth', title: 'Växande', layerIndex: 4 },
  { index: 19, cardId: 'su-20-future', title: 'Framtid', layerIndex: 4 },
  { index: 20, cardId: 'su-21-gratitude', title: 'Tacksamhet', layerIndex: 4 },
  { index: 21, cardId: 'su-22-legacy', title: 'Arvet', layerIndex: 4 },
];

/** Stale card thresholds */
export const STALE_SKIP_AVAILABLE_DAYS = 14;
export const STALE_AUTO_ADVANCE_DAYS = 21;
export const DORMANCY_THRESHOLD_DAYS = 7;
