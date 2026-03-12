import { useLocation } from 'react-router-dom';
import { allProducts, getProductForCard } from '@/data/products';
import type { ProductManifest } from '@/types/product';

/**
 * Derives the current product from the active route.
 * Returns undefined when on library/login/other non-product pages.
 */
export function useCurrentProduct(): ProductManifest | undefined {
  const { pathname } = useLocation();

  // /product/:slug
  const productMatch = pathname.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    return allProducts.find((p) => p.slug === productMatch[1]);
  }

  // /category/:categoryId → find owning product
  const catMatch = pathname.match(/^\/category\/([^/]+)/);
  if (catMatch) {
    return allProducts.find((p) => p.categories.some((c) => c.id === catMatch[1]));
  }

  // /card/:cardId → find owning product
  const cardMatch = pathname.match(/^\/card\/([^/]+)/);
  if (cardMatch) {
    return getProductForCard(cardMatch[1]);
  }

  // /diary/:productId
  const diaryMatch = pathname.match(/^\/diary\/([^/]+)/);
  if (diaryMatch) {
    return allProducts.find((p) => p.id === diaryMatch[1] || p.slug === diaryMatch[1]);
  }

  return undefined;
}
