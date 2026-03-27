/**
 * Cross-product recommendation engine.
 *
 * Given the product the user just completed and a set of product slugs
 * they've already completed, returns the next recommended product slug
 * or null if nothing left to recommend.
 *
 * The recommendation chain follows the child's developmental arc:
 *   Jag i Mig (3+) → Vardagskort (4+) → Jag med Andra (6+) →
 *   Syskonkort (7+) → Jag i Världen (13+) → Sexualitetskort (15+)
 *
 * Each product has an ordered fallback list. The first product in the
 * list that the user has NOT completed is recommended.
 *
 * Still Us has no cross-product recommendations (adult products will
 * get their own logic when the adult family expands).
 */

const RECOMMENDATION_CHAINS: Record<string, string[]> = {
  'jag-i-mig':        ['vardagskort', 'syskonkort', 'jag-med-andra', 'jag-i-varlden', 'sexualitetskort'],
  'vardagskort':      ['jag-i-mig', 'syskonkort', 'jag-med-andra', 'jag-i-varlden', 'sexualitetskort'],
  'jag-med-andra':    ['jag-i-varlden', 'jag-i-mig', 'vardagskort', 'syskonkort', 'sexualitetskort'],
  'syskonkort':       ['jag-i-mig', 'vardagskort', 'jag-med-andra', 'jag-i-varlden', 'sexualitetskort'],
  'jag-i-varlden':    ['sexualitetskort', 'jag-med-andra', 'jag-i-mig', 'vardagskort', 'syskonkort'],
  'sexualitetskort':  ['jag-i-varlden', 'jag-med-andra', 'jag-i-mig', 'vardagskort', 'syskonkort'],
};

/** Human-readable product names for banner display */
const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  'jag-i-mig':       'Jag i Mig',
  'vardagskort':     'Vardagskort',
  'jag-med-andra':   'Jag med Andra',
  'syskonkort':      'Syskonkort',
  'jag-i-varlden':   'Jag i Världen',
  'sexualitetskort': 'Sexualitetskort',
};

export interface ProductRecommendation {
  slug: string;
  displayName: string;
}

/**
 * Returns the next recommended product, or null.
 *
 * @param currentProductSlug - The slug of the product the user just completed all cards in
 * @param completedProductSlugs - Set of product slugs where the user has completed all cards
 */
export function getNextProductRecommendation(
  currentProductSlug: string,
  completedProductSlugs: Set<string>,
): ProductRecommendation | null {
  const chain = RECOMMENDATION_CHAINS[currentProductSlug];
  if (!chain) return null; // Still Us or unknown product

  for (const slug of chain) {
    if (!completedProductSlugs.has(slug)) {
      const displayName = PRODUCT_DISPLAY_NAMES[slug];
      if (displayName) return { slug, displayName };
    }
  }

  return null; // All products completed
}
