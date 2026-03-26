/**
 * Still Us — Kids Architecture Product
 *
 * Maps the 20 Still Us cards into a ProductManifest using the 4 clinical
 * layers as categories. This lets the existing kids infrastructure
 * (KidsProductHome → KidsCardPortal → CardView → CompletedSessionView)
 * render Still Us content for A/B comparison.
 *
 * Each card has a single "opening" section with all prompts in a flat
 * sequence (matching the kids single-section model). No scenario or
 * exercise sections in-session — exercises live in gorExercises.ts
 * and are displayed on the completion page.
 */

import type { ProductManifest } from '@/types/product';
import type { Category, Card, Section } from '@/types';
import { cards as stillUsCards } from '@/data/content';
import { CARD_SEQUENCE, LAYERS } from '@/data/stillUsSequence';
import stillUsHero from '@/assets/illustration-still-us-home.png';

// ── Categories (one per layer) ──────────────────────────────

const LAYER_META: { id: string; title: string; subtitle: string; color: string }[] = [
  { id: 'su-mock-vardagen',     title: 'Vardagen',     subtitle: 'Hur livet mellan er ser ut just nu.',                        color: '#3A6E9B' },
  { id: 'su-mock-tillsammans',  title: 'Tillsammans',  subtitle: 'Hur ni möter det som är svårt — och varandra.',             color: '#1E5A8A' },
  { id: 'su-mock-grunden',      title: 'Grunden',      subtitle: 'Det ni bär med er in i relationen.',                        color: '#0D2E6B' },
  { id: 'su-mock-riktningen',   title: 'Riktningen',   subtitle: 'Vart ni är på väg — och vad ni väljer.',                    color: '#0A1628' },
];

const categories: Category[] = LAYER_META.map((l, i) => ({
  id: l.id,
  title: l.title,
  subtitle: l.subtitle,
  description: l.subtitle,
  cardCount: LAYERS[i].cards.length,
  color: l.color,
}));

// ── Cards ───────────────────────────────────────────────────

function buildMockCard(seqEntry: typeof CARD_SEQUENCE[number]): Card | null {
  const source = stillUsCards[seqEntry.index];
  if (!source) return null;

  const categoryId = LAYER_META[seqEntry.layerIndex].id;

  // v3.0: content.ts cards have a single opening section with all prompts.
  // Pass through directly — no merging needed.
  const opening = source.sections.find(s => s.type === 'opening');

  const primarySection: Section = {
    id: `su-mock-primary-${seqEntry.index}`,
    type: 'opening',
    title: 'Frågor',
    content: opening?.content ?? '',
    prompts: opening?.prompts ?? [],
    anchors: opening?.anchors,
  };

  return {
    id: `su-mock-${seqEntry.index}`,
    title: source.title,
    subtitle: source.subtitle,
    categoryId,
    sections: [primarySection],
  };
}

const cards: Card[] = CARD_SEQUENCE.map(buildMockCard).filter((c): c is Card => c !== null);

// ── Intro card (freemium / ice-breaker) ─────────────────────

const introCard: Card = {
  id: 'su-intro',
  title: 'Ert första samtal',
  subtitle: 'Ett första samtal — för att landa tillsammans.',
  categoryId: '__su-intro__',
  sections: [
    {
      id: 'su-intro-opening',
      type: 'opening',
      title: 'Frågor',
      content: '',
      prompts: [
        'Finns det något din partner gör — kanske utan att tänka på det — som alltid får dig att må lite bättre?',
        'När kände du dig senast glad att det är just den här personen som sitter bredvid dig?',
        'Finns det något du önskar att din partner visste om dig just nu — utan att du behövt säga det?',
        'Vad skulle det betyda för er om ni hade de här samtalen regelbundet?',
      ],
    },
  ],
};

// ── Manifest ────────────────────────────────────────────────

export const stillUsProduct: ProductManifest = {
  id: 'still_us',
  heroImage: stillUsHero,
  name: 'Still Us',
  slug: 'still-us',
  tagline: 'Vi finns kvar',
  description: '20 samtal fördelade på fyra lager.',
  headerTitle: 'Still Us',
  accentColor: 'hsl(215, 100%, 34%)',
  accentColorMuted: 'hsl(215, 60%, 80%)',
  secondaryAccent: 'hsl(215, 70%, 18%)',
  backgroundColor: '#4B759B',
  ctaButtonColor: '#94BCE1',
  tileLight: '#94BCE1',
  tileMid: '#6F9CC5',
  tileDeep: '#4B759B',
  pronounMode: 'ni',
  freeCardId: 'su-intro',
  paywallDescription: 'Fördjupa samtalet — vecka för vecka, lager för lager.',
  categories,
  cards: [introCard, ...cards],
};
