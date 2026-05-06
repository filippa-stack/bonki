/**
 * Vårt Vi v3.1 — Canonical 18-card sequence & phase constants.
 *
 * v3.1 (final):
 *  - Removed 3 cards (first-conversation, our-philosophy, choosing-to-stay)
 *  - 4 thematic layers (4/5/5/4) — membership by id, not by sequence position.
 *  - CARD_SEQUENCE is the recommended "Nästa" order; LAYERS are filter chips.
 *    The two are independent.
 */

export const TOTAL_PROGRAM_CARDS = 18;
export const FREE_TRIAL_CARDS = 1;
export const TOTAL_TILLBAKA_CARDS = 12;
export const RESTART_MIN_TILLBAKA = 4;

/** Layer membership — by bare card id, independent of sequence position. */
export const LAYERS = [
  {
    id: 'layer-vardagen',
    name: 'Vardagen',
    cardIds: ['smallest-we', 'worth-spending-on', 'adrift', 'love-languages'],
  },
  {
    id: 'layer-tillsammans',
    name: 'Tillsammans',
    cardIds: ['listening-presence', 'expressing-needs', 'facing-adversity', 'conflict-repair', 'when-life-tilts'],
  },
  {
    id: 'layer-grunden',
    name: 'Grunden',
    cardIds: ['our-traditions', 'identity-shift', 'behind-the-scenes', 'thoughtful-space', 'self-esteem-wavering'],
  },
  {
    id: 'layer-riktningen',
    name: 'Riktningen',
    cardIds: ['family-ab', 'parenting-boundaries', 'different-parenting-styles', 'parenting-exhaustion'],
  },
] as const;

/** Slider check-in phase progression */
export type SliderPhase = 'A' | 'B' | 'C';

export function getSliderPhase(cardIndex: number): SliderPhase {
  if (cardIndex <= 5) return 'A';
  if (cardIndex <= 11) return 'B';
  return 'C';
}

/** Look up a layer by bare card id. */
export function getLayerForCardId(bareId: string): typeof LAYERS[number] | undefined {
  return LAYERS.find((l) => (l.cardIds as readonly string[]).includes(bareId));
}

/** Strip the `su-NN-` prefix from a sequence cardId to get the bare id. */
export function bareIdFromSlug(slug: string): string {
  return slug.replace(/^su-\d{2}-/, '');
}

/**
 * The canonical 18-card recommended order ("Nästa" walks this).
 * `cardId` is the prefixed slug used in routes.
 * `layerIndex` is the index in LAYERS for the bare id.
 */
export const CARD_SEQUENCE: { index: number; cardId: string; title: string; layerIndex: number }[] = [
  { index: 0,  cardId: 'su-00-our-traditions',           title: 'Vår uppväxt',                  layerIndex: 2 },
  { index: 1,  cardId: 'su-01-identity-shift',           title: 'Utvecklingen',                 layerIndex: 2 },
  { index: 2,  cardId: 'su-02-listening-presence',       title: 'Att bli sedd på riktigt',      layerIndex: 1 },
  { index: 3,  cardId: 'su-03-expressing-needs',         title: 'Det som förblir osagt',        layerIndex: 1 },
  { index: 4,  cardId: 'su-04-behind-the-scenes',        title: 'Vänskapens betydelse',         layerIndex: 2 },
  { index: 5,  cardId: 'su-05-thoughtful-space',         title: 'Rösterna utifrån',             layerIndex: 2 },
  { index: 6,  cardId: 'su-06-self-esteem-wavering',     title: 'Det egna utrymmet',            layerIndex: 2 },
  { index: 7,  cardId: 'su-07-smallest-we',              title: 'Det osynliga ansvaret',        layerIndex: 0 },
  { index: 8,  cardId: 'su-08-worth-spending-on',        title: 'Pengarnas symbolik',           layerIndex: 0 },
  { index: 9,  cardId: 'su-09-facing-adversity',         title: 'Att bära och bli buren',       layerIndex: 1 },
  { index: 10, cardId: 'su-10-conflict-repair',          title: 'Den tysta muren',              layerIndex: 1 },
  { index: 11, cardId: 'su-11-adrift',                   title: 'Begäret och avståndet',        layerIndex: 0 },
  { index: 12, cardId: 'su-12-love-languages',           title: 'Den outtalade längtan',        layerIndex: 0 },
  { index: 13, cardId: 'su-13-when-life-tilts',          title: 'Vägen tillbaka',               layerIndex: 1 },
  { index: 14, cardId: 'su-14-family-ab',                title: 'Uppmärksamhet åt annat håll',  layerIndex: 3 },
  { index: 15, cardId: 'su-15-parenting-boundaries',     title: 'De röda linjerna',             layerIndex: 3 },
  { index: 16, cardId: 'su-16-different-parenting-styles', title: 'Frågan om barn',             layerIndex: 3 },
  { index: 17, cardId: 'su-17-parenting-exhaustion',     title: 'Drömmens pris',                layerIndex: 3 },
];

/** Stale card thresholds */
export const STALE_SKIP_AVAILABLE_DAYS = 14;
export const STALE_AUTO_ADVANCE_DAYS = 21;
export const DORMANCY_THRESHOLD_DAYS = 7;
