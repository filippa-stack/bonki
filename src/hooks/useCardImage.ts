/**
 * useCardImage — returns the URL for a card's illustration.
 * All images are served as standalone files from /card-images/{cardId}.png.
 * No ZIP extraction needed.
 */

/** Set of all card IDs that have illustrations */
const CARD_IDS_WITH_IMAGES = new Set([
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
 */
export function useCardImage(cardId: string | null | undefined): string | null {
  if (!cardId || !CARD_IDS_WITH_IMAGES.has(cardId)) return null;
  return `/card-images/${cardId}.png`;
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
