import { getProductForCard, allProducts } from '@/data/products';

// Still Us (legacy) recommended order
export const RECOMMENDED_CATEGORY_ORDER = [
  'emotional-intimacy',   // 1. Vi i oss
  'communication',        // 2. Vardagen mellan oss
  'category-8',           // 3. Att hålla kvar varandra
  'parenting-together',   // 4. När vi tycker olika
  'individual-needs',     // 5. Det vi bär med oss
  'category-9',           // 6. Dit vi är på väg
  'category-6',           // 7. Trygghet & mod
  'daily-life',           // 8. Vi nära
  'category-10',          // 9. Att välja oss
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
