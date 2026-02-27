export { jagIMigProduct } from './jag-i-mig';
export { jagMedAndraProduct } from './jag-med-andra';
export { jagIVarldenProduct } from './jag-i-varlden';
export { vardagskortProduct } from './vardagskort';
export { syskonkortProduct } from './syskonkort';
export { sexualitetskortProduct } from './sexualitetskort';

import type { ProductManifest } from '@/types/product';
import type { Card, Category } from '@/types';
import { jagIMigProduct } from './jag-i-mig';
import { jagMedAndraProduct } from './jag-med-andra';
import { jagIVarldenProduct } from './jag-i-varlden';
import { vardagskortProduct } from './vardagskort';
import { syskonkortProduct } from './syskonkort';
import { sexualitetskortProduct } from './sexualitetskort';

export const allProducts: ProductManifest[] = [
  jagIMigProduct,
  jagMedAndraProduct,
  jagIVarldenProduct,
  vardagskortProduct,
  syskonkortProduct,
  sexualitetskortProduct,
];

export function getProductById(id: string): ProductManifest | undefined {
  return allProducts.find(p => p.id === id);
}

/** Find the product a card belongs to (by card ID) */
export function getProductForCard(cardId: string): ProductManifest | undefined {
  return allProducts.find(p => p.cards.some(c => c.id === cardId));
}

/** Get all product cards (flat) */
export function getAllProductCards(): Card[] {
  return allProducts.flatMap(p => p.cards);
}

/** Get all product categories (flat) */
export function getAllProductCategories(): Category[] {
  return allProducts.flatMap(p => p.categories);
}
