/**
 * useCardImage — returns the URL for a card's illustration.
 * All images are served as standalone files from /card-images/{cardId}.webp.
 *
 * Still Us cards (su-mock-N) resolve via bare card id (e.g. expressing-needs)
 * looked up through CARD_SEQUENCE, so reordering the sequence does not break
 * visuals. Falls back to legacy /card-images/su-mock-N.webp if no bare-id
 * file is registered.
 */
import { CARD_SEQUENCE, bareIdFromSlug } from '@/data/stillUsSequence';

/** Set of all card IDs that have illustrations */
const CARD_IDS_WITH_IMAGES = new Set([
  // ── Vårt Vi (bare ids — new ID-bound pattern) ──
  'thoughtful-space', 'expressing-needs', 'behind-the-scenes', 'smallest-we',
  'self-esteem-wavering', 'parenting-exhaustion', 'love-languages',
  'different-parenting-styles', 'worth-spending-on', 'when-life-tilts',
  'family-ab', 'conflict-repair', 'facing-adversity', 'parenting-boundaries',
  'listening-presence', 'adrift', 'our-traditions', 'identity-shift',

  // ── Jag i Mig ──
  'jim-trygg', 'jim-ensam', 'jim-stress', 'jim-glad', 'jim-ledsen',
  'jim-arg', 'jim-radd', 'jim-vild', 'jim-besviken', 'jim-acklad',
  'jim-avsky', 'jim-skam', 'jim-avundsjuk', 'jim-svartsjuk', 'jim-utanfor',
  'jim-stolt', 'jim-bestamd', 'jim-karlek', 'jim-nyfiken', 'jim-forvanad', 'jim-jag',

  // ── Jag med Andra ──
  'jma-vanskap', 'jma-kontakt', 'jma-annorlunda', 'jma-utanfor', 'jma-duktig',
  'jma-tavla', 'jma-utseende', 'jma-avund', 'jma-konflikt', 'jma-misslyckas',
  'jma-kritik', 'jma-skam', 'jma-skuld', 'jma-stopp', 'jma-integritet',
  'jma-modig', 'jma-respekt', 'jma-sanning', 'jma-lika-varde', 'jma-acceptans',
  'jma-kluringen',

  // ── Jag i Världen ──
  'jiv-halsa', 'jiv-prestation', 'jiv-bekraftelse', 'jiv-sjalvkansla',
  'jiv-identitet', 'jiv-roller', 'jiv-frihet', 'jiv-karlek', 'jiv-vanskap',
  'jiv-kommunikation', 'jiv-konflikt', 'jiv-medkansla', 'jiv-mobbning',
  'jiv-fordomar', 'jiv-social-media', 'jiv-psykisk-ohalsa', 'jiv-sexualitet',
  'jiv-moral-etik', 'jiv-aktivism', 'jiv-existens',

  // ── Vardagskort ──
  'vk-morgon', 'vk-rutiner', 'vk-skola', 'vk-hur-var-din-dag', 'vk-kvall',
  'vk-sova', 'vk-helg', 'vk-mat', 'vk-hushall', 'vk-syskon',
  'vk-underhallning', 'vk-aktiviteter', 'vk-tonar', 'vk-arbete', 'vk-kompisar',

  // ── Sexualitetskort ──
  'sex-konsidentitet', 'sex-sexuell-laggning', 'sex-onani', 'sex-kroppsideal',
  'sex-normer', 'sex-pornografi', 'sex-sexuella-tabun', 'sex-sex-och-karlek',
  'sex-samtycke', 'sex-sex-och-ansvar', 'sex-sexuella-misstag',
  'sex-konsekvenser-av-sex', 'sex-sexuella-overgrepp', 'sex-sex-som-hot',

  // ── Syskonkort ──
  'sk-att-fa-ett-syskon', 'sk-syskonminnen', 'sk-syskonkunskap', 'sk-vanskap',
  'sk-vanskap-relation', 'sk-unik', 'sk-aldst-mitten-yngst', 'sk-bonussyskon',
  'sk-konflikt', 'sk-dela', 'sk-rattvisa', 'sk-uppmarksamhet', 'sk-sjukdom',
  'sk-forlora-ett-syskon', 'sk-framtid', 'sk-funktionsvariation',

  // ── Still Us Mock ──
  'su-mock-0', 'su-mock-1', 'su-mock-2', 'su-mock-3', 'su-mock-4',
  'su-mock-5', 'su-mock-6', 'su-mock-7', 'su-mock-8', 'su-mock-9',
  'su-mock-10', 'su-mock-11', 'su-mock-12', 'su-mock-13', 'su-mock-14',
  'su-mock-15', 'su-mock-16', 'su-mock-17', 'su-mock-18', 'su-mock-19',
  'su-mock-20',
]);

/**
 * Returns the URL for a card's illustration, or null if no image exists.
 * Synchronous — no async loading, no ZIP parsing.
 *
 * For Still Us (`su-mock-N`), prefers the bare-id file (id-bound) and falls
 * back to the legacy indexed file.
 */
export function useCardImage(cardId: string | null | undefined): string | null {
  if (!cardId) return null;

  if (cardId.startsWith('su-mock-')) {
    const n = Number(cardId.slice('su-mock-'.length));
    if (Number.isFinite(n)) {
      const seq = CARD_SEQUENCE[n];
      if (seq) {
        const bare = bareIdFromSlug(seq.cardId);
        if (CARD_IDS_WITH_IMAGES.has(bare)) return `/card-images/${bare}.webp`;
      }
    }
    if (CARD_IDS_WITH_IMAGES.has(cardId)) return `/card-images/${cardId}.webp`;
    return null;
  }

  if (!CARD_IDS_WITH_IMAGES.has(cardId)) return null;
  return `/card-images/${cardId}.webp`;
}

/** Check if a card has an image mapped */
export function hasCardImage(cardId: string): boolean {
  return CARD_IDS_WITH_IMAGES.has(cardId);
}

/**
 * @deprecated ZIP preloading is no longer needed — images are standalone files.
 */
export function preloadZip(_source: string): void {
  // no-op
}

/**
 * @deprecated ZIP mapping is no longer needed.
 */
export const PRODUCT_ZIP_MAP: Record<string, string> = {};
