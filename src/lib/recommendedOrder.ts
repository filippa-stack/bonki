import { getProductForCard, allProducts } from '@/data/products';

// Still Us (legacy) recommended order
export const RECOMMENDED_CATEGORY_ORDER = [
  'emotional-intimacy',   // 1. Ni i er
  'communication',        // 2. Vardagen
  'category-8',           // 3. Att hålla kvar
  'individual-needs',     // 4. Det ni bär
  'parenting-together',   // 5. När ni tycker olika
  'category-9',           // 6. Dit ni är på väg
  'category-6',           // 7. Trygghet &
  'daily-life',           // 8. Nära
  'category-10',          // 9. Att välja
] as const;

/**
 * Return the recommended category order for a given card's product.
 * For Bonki products, we use the natural category order from the manifest.
 * For Still Us or unknown, we fall back to the legacy order.
 */
export function getRecommendedCategoryOrder(cardId: string): readonly string[] {
  const product = getProductForCard(cardId);
  if (product) {
    return product.categories.map(c => c.id);
  }
  return RECOMMENDED_CATEGORY_ORDER;
}
