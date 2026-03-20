/**
 * Still Us — Kids Architecture Mock
 *
 * Maps the 22 Still Us cards into a ProductManifest using the 5 clinical
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
  { id: 'su-mock-grunden',    title: 'Grunden',    subtitle: 'Det som bär er — och det som saknas.',            color: '#343E4E' },
  { id: 'su-mock-normen',     title: 'Normen',     subtitle: 'Reglerna ni lever efter — de uttalade och de tysta.', color: '#2A3241' },
  { id: 'su-mock-konflikten', title: 'Konflikten', subtitle: 'Det som skaver — det ni undviker.',               color: '#263041' },
  { id: 'su-mock-langtan',    title: 'Längtan',    subtitle: 'Önskningar, drömmar och det som kostar.',         color: '#222A37' },
  { id: 'su-mock-valet',      title: 'Valet',      subtitle: 'Att stanna, förändra, fortsätta välja.',          color: '#1C222E' },
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

export const stillUsMockProduct: ProductManifest = {
  id: 'still_us_mock',
  heroImage: stillUsHero,
  name: 'Still Us (test)',
  slug: 'still-us-mock',
  tagline: 'Ert samtal — vecka för vecka',
  description: '22 samtal fördelade på fem lager. Testversion i barnproduktformat.',
  headerTitle: 'Still Us',
  accentColor: 'hsl(28, 80%, 57%)',       // saffron
  accentColorMuted: 'hsl(28, 60%, 85%)',
  secondaryAccent: 'hsl(215, 25%, 20%)',   // steel blue
  backgroundColor: '#141822',
  ctaButtonColor: '#E8913A',
  tileLight: '#343E4E',
  tileMid: '#2A3241',
  tileDeep: '#263041',
  pronounMode: 'ni',
  paywallDescription: 'Fördjupa samtalet — vecka för vecka, lager för lager.',
  categories,
  cards,
};
