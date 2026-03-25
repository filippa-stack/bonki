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

// ── Intro card (freemium / ice-breaker) ─────────────────────

const introCard: Card = {
  id: 'su-intro',
  title: 'Ert första samtal',
  subtitle: 'Ett första samtal — för att landa tillsammans.',
  categoryId: '__su-intro__',            // standalone — not part of any category
  sections: [
    {
      id: 'su-intro-opening',
      type: 'opening',
      title: 'Öppna',
      content: '',
      prompts: [
        'Finns det något din partner gör — kanske utan att tänka på det — som alltid får dig att må lite bättre?',
        'När kände du dig senast glad att det är just den här personen som sitter bredvid dig?',
      ],
    },
    {
      id: 'su-intro-reflective',
      type: 'reflective',
      title: 'Fördjupa',
      content: '',
      prompts: [
        'Finns det något du önskar att din partner visste om dig just nu — utan att du behövt säga det?',
        'Hur ofta pratar ni om er på det här sättet?',
      ],
    },
    {
      id: 'su-intro-scenario',
      type: 'scenario',
      title: 'Framåt',
      content: '',
      prompts: [
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
  description: '22 samtal fördelade på fyra lager.',
  headerTitle: 'Still Us',
  accentColor: 'hsl(215, 100%, 34%)',       // cobalt blue #0047AB
  accentColorMuted: 'hsl(215, 60%, 80%)',
  secondaryAccent: 'hsl(215, 70%, 18%)',   // deep navy tone
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
