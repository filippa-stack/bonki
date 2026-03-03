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
  secondaryAccent: string;   // Complementary accent (like saffron in Still Us)
  /** Product page background color (hex), e.g. '#FFFDF8' */
  backgroundColor: string;
  /** Pronoun mode: 'ni' for couple products, 'du' for solo products */
  pronounMode: 'du' | 'ni';
  /** Card ID that is free to play without purchase */
  freeCardId?: string;
  /** Age label shown in UI, e.g. '3+', '6+', '13+' */
  ageLabel?: string;
  categories: Category[];
  cards: Card[];
}
