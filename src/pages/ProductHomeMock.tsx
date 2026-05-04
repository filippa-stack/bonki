/**
 * ProductHomeMock page wrapper — sandboxed product home at
 * /product-home-mock/:productId. Mirrors LibraryMock pattern.
 */

import ProductHomeMock from '@/components/ProductHomeMock';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';

export default function ProductHomeMockPage() {
  useThemeSwitcher();
  return <ProductHomeMock />;
}
