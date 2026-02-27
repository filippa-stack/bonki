import { Category, Card } from '@/types';

export interface ProductManifest {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  headerTitle: string;
  accentColor: string;       // HSL string, e.g. 'hsl(158, 35%, 18%)'
  accentColorMuted: string;  // Lighter variant for backgrounds
  categories: Category[];
  cards: Card[];
}
