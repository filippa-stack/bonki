import { Category, Card } from '@/types';

export interface ProductManifest {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  headerTitle: string;
  categories: Category[];
  cards: Card[];
}
