export { jagIMigProduct } from './jag-i-mig';
export { jagMedAndraProduct } from './jag-med-andra';
export { jagIVarldenProduct } from './jag-i-varlden';
export { vardagskortProduct } from './vardagskort';
export { syskonkortProduct } from './syskonkort';
export { sexualitetskortProduct } from './sexualitetskort';

import type { ProductManifest } from '@/types/product';
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
