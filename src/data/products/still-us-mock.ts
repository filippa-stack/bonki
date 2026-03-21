/**
 * Still Us — Kids Architecture Product
 *
 * Maps the 22 Still Us cards into a ProductManifest using the 4 clinical
 * layers as categories. This lets the existing kids infrastructure
 * (KidsProductHome → KidsCardPortal → CardView → CompletedSessionView)
 * render Still Us content for A/B comparison.
 *
 * Each card merges Opening + Reflective prompts into a single "opening"
 * section (matching the kids single-section model). Scenario + Exercise
 * are kept as separate sections so CardView renders them with the stage
 * interstitial transition and the completion bonus.
 */

import type { ProductManifest } from '@/types/product';
import type { Category, Card, Section } from '@/types';
import { cards as stillUsCards } from '@/data/content';
import { CARD_SEQUENCE, LAYERS } from '@/data/stillUsSequence';
import stillUsHero from '@/assets/illustration-still-us-home.png';

// ── Categories (one per layer) ──────────────────────────────

const LAYER_META: { id: string; title: string; subtitle: string; color: string }[] = [
  { id: 'su-mock-vardagen',     title: 'Vardagen',     subtitle: 'Hur livet mellan er ser ut just nu.',                        color: '#5A3E0A' },
  { id: 'su-mock-tillsammans',  title: 'Tillsammans',  subtitle: 'Hur ni möter det som är svårt — och varandra.',             color: '#4A3308' },
  { id: 'su-mock-grunden',      title: 'Grunden',      subtitle: 'Det ni bär med er in i relationen.',                        color: '#3D2A06' },
  { id: 'su-mock-riktningen',   title: 'Riktningen',   subtitle: 'Vart ni är på väg — och vad ni väljer.',                    color: '#302104' },
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
  // Map CARD_SEQUENCE slug → content.ts card by matching title
  const source = stillUsCards[seqEntry.index];
  if (!source) return null;

  const categoryId = LAYER_META[seqEntry.layerIndex].id;

  // Merge opening + reflective into one section (kids model)
  const opening = source.sections.find(s => s.type === 'opening');
  const reflective = source.sections.find(s => s.type === 'reflective');
  const scenario = source.sections.find(s => s.type === 'scenario');
  const exercise = source.sections.find(s => s.type === 'exercise');

  const mergedPrompts = [
    ...(opening?.prompts ?? []),
    ...(reflective?.prompts ?? []),
  ];

  const primarySection: Section = {
    id: `su-mock-primary-${seqEntry.index}`,
    type: 'opening',
    title: 'Frågor',
    content: opening?.content ?? '',
    prompts: mergedPrompts,
    anchors: [
      ...(opening?.anchors ?? []),
      ...(reflective?.anchors ?? []).map(a => ({
        ...a,
        promptIndex: a.promptIndex + (opening?.prompts?.length ?? 0),
      })),
    ].length > 0
      ? [
          ...(opening?.anchors ?? []),
          ...(reflective?.anchors ?? []).map(a => ({
            ...a,
            promptIndex: a.promptIndex + (opening?.prompts?.length ?? 0),
          })),
        ]
      : undefined,
  };

  const sections: Section[] = [primarySection];

  // Keep scenario in-session, but merge intro + question into a single prompt
  // so it behaves like the kids products' final question pattern.
  if (scenario) {
    sections.push({
      ...scenario,
      id: `su-mock-scenario-${seqEntry.index}`,
      content: '',
      prompts: (scenario.prompts ?? []).map((prompt) => {
        const questionText = typeof prompt === 'string' ? prompt : prompt.text;
        const mergedText = [scenario.content?.trim(), questionText.trim()].filter(Boolean).join('\n\n');

        return typeof prompt === 'string'
          ? mergedText
          : { ...prompt, text: mergedText };
      }),
    });
  }
  if (exercise) sections.push({ ...exercise, id: `su-mock-exercise-${seqEntry.index}` });

  return {
    id: `su-mock-${seqEntry.index}`,
    title: source.title,
    subtitle: source.subtitle,
    categoryId,
    sections,
  };
}

const cards: Card[] = CARD_SEQUENCE.map(buildMockCard).filter((c): c is Card => c !== null);

// ── Manifest ────────────────────────────────────────────────

export const stillUsProduct: ProductManifest = {
  id: 'still_us',
  heroImage: stillUsHero,
  name: 'Still Us',
  slug: 'still-us',
  tagline: 'Vi finns kvar',
  description: '22 samtal fördelade på fyra lager.',
  headerTitle: 'Still Us',
  accentColor: 'hsl(28, 80%, 57%)',       // deep saffron
  accentColorMuted: 'hsl(28, 60%, 85%)',
  secondaryAccent: 'hsl(280, 20%, 22%)',   // ember tone
  backgroundColor: '#1A0806',
  ctaButtonColor: '#E8913A',
  tileLight: '#2E1A0A',                    // deep burnt umber (library tile)
  tileMid: '#4A3308',
  tileDeep: '#352606',
  pronounMode: 'ni',
  paywallDescription: 'Fördjupa samtalet — vecka för vecka, lager för lager.',
  categories,
  cards,
};
