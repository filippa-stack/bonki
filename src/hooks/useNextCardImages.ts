/**
 * useNextCardImages — returns the illustration for the first uncompleted card
 * per category. Falls back to the first card if all are completed.
 */

import { useMemo } from 'react';
import { useCardImage } from '@/hooks/useCardImage';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';

/**
 * For each category, pick the first card that is NOT in the completed set.
 * If all cards in a category are completed, fall back to the first card.
 * Returns up to 6 card IDs (hook-safe fixed call count).
 */
export function useNextCardImages(
  product: ProductManifest | undefined,
  progress: KidsProductProgress,
): (string | undefined)[] {
  const completedSet = useMemo(
    () => new Set(progress.recentlyCompletedCardIds),
    [progress.recentlyCompletedCardIds],
  );

  const cardIds = useMemo(() => {
    if (!product) return ['', '', '', '', '', ''];
    return product.categories.map(cat => {
      const catCards = product.cards.filter(c => c.categoryId === cat.id);
      const next = catCards.find(c => !completedSet.has(c.id));
      return (next ?? catCards[0])?.id ?? '';
    });
  }, [product, completedSet]);

  // Fixed hook call count (max 6 categories)
  const img0 = useCardImage(cardIds[0] || undefined);
  const img1 = useCardImage(cardIds[1] || undefined);
  const img2 = useCardImage(cardIds[2] || undefined);
  const img3 = useCardImage(cardIds[3] || undefined);
  const img4 = useCardImage(cardIds[4] || undefined);
  const img5 = useCardImage(cardIds[5] || undefined);

  return useMemo(() => {
    const all = [img0, img1, img2, img3, img4, img5];
    return (product?.categories ?? []).map((_, i) => all[i] ?? undefined);
  }, [img0, img1, img2, img3, img4, img5, product?.categories]);
}
