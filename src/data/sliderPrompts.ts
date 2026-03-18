/**
 * Still Us v3.0 — Slider check-in prompts per card.
 * Each card has 2-3 sliders. Phase A = sliders only, Phase B/C add reflection.
 *
 * Placeholder content marked with [PLACEHOLDER].
 * Replace with authored clinical content.
 */

export interface SliderPrompt {
  sliderId: string;
  /** The question shown above the slider */
  text: string;
  leftLabel: string;
  rightLabel: string;
}

export interface CardSliderSet {
  cardIndex: number;
  cardId: string;
  cardTitle: string;
  layerName: string;
  sliders: SliderPrompt[];
  /** Phase B/C reflection prompt (shown after sliders) */
  reflectionPrompt?: string;
}

function layerForIndex(i: number): string {
  if (i <= 3) return 'Griden';
  if (i <= 8) return 'Normen';
  if (i <= 13) return 'Konflikten';
  if (i <= 17) return 'Längtan';
  return 'Valet';
}

const sliderPrompts: CardSliderSet[] = [
  // Card 0 — Minsta vi (authored)
  {
    cardIndex: 0,
    cardId: 'card_1',
    cardTitle: 'Minsta vi',
    layerName: 'Griden',
    sliders: [
      { sliderId: 's0-1', text: 'Hur nära känns vi just nu?', leftLabel: 'Långt bort', rightLabel: 'Väldigt nära' },
      { sliderId: 's0-2', text: 'Hur mycket tid har ni haft för varandra den här veckan?', leftLabel: 'Nästan ingen', rightLabel: 'Massor' },
    ],
  },
  // Card 1 — Rytmen (authored)
  {
    cardIndex: 1,
    cardId: 'card_2',
    cardTitle: 'Rytmen',
    layerName: 'Griden',
    sliders: [
      { sliderId: 's1-1', text: 'Hur bra funkar er vardagsrytm just nu?', leftLabel: 'Kaotiskt', rightLabel: 'Flyter fint' },
      { sliderId: 's1-2', text: 'Hur mycket vila får du i relationen?', leftLabel: 'Ingen alls', rightLabel: 'Mycket' },
    ],
  },
  // Card 2 — Trygga rummet (authored)
  {
    cardIndex: 2,
    cardId: 'card_3',
    cardTitle: 'Trygga rummet',
    layerName: 'Griden',
    sliders: [
      { sliderId: 's2-1', text: 'Hur tryggt känns det att vara ärlig med din partner?', leftLabel: 'Osäkert', rightLabel: 'Helt tryggt' },
      { sliderId: 's2-2', text: 'Hur väl lyssnar ni på varandra?', leftLabel: 'Sällan', rightLabel: 'Alltid' },
    ],
  },
  // Card 3 — Att lyssna (authored)
  {
    cardIndex: 3,
    cardId: 'card_4',
    cardTitle: 'Att lyssna',
    layerName: 'Griden',
    sliders: [
      { sliderId: 's3-1', text: 'Hur ofta känner du dig hörd?', leftLabel: 'Aldrig', rightLabel: 'Alltid' },
      { sliderId: 's3-2', text: 'Hur lätt är det att be om uppmärksamhet?', leftLabel: 'Svårt', rightLabel: 'Lätt' },
    ],
  },
  // Card 4 — Behov (authored)
  {
    cardIndex: 4,
    cardId: 'card_5',
    cardTitle: 'Behov',
    layerName: 'Normen',
    sliders: [
      { sliderId: 's4-1', text: 'Hur bra vet du vad du behöver just nu?', leftLabel: 'Osäker', rightLabel: 'Helt klar' },
      { sliderId: 's4-2', text: 'Hur lätt är det att uttrycka dina behov?', leftLabel: 'Svårt', rightLabel: 'Lätt' },
      { sliderId: 's4-3', text: 'Hur väl möter din partner dina behov?', leftLabel: 'Sällan', rightLabel: 'Ofta' },
    ],
  },
  // Cards 5-21: placeholder
  ...Array.from({ length: 17 }, (_, i) => {
    const idx = i + 5;
    return {
      cardIndex: idx,
      cardId: `card_${idx + 1}`,
      cardTitle: `[PLACEHOLDER] Vecka ${idx + 1}`,
      layerName: layerForIndex(idx),
      sliders: [
        { sliderId: `s${idx}-1`, text: `[PLACEHOLDER] Slider 1 för vecka ${idx + 1}`, leftLabel: 'Lite', rightLabel: 'Mycket' },
        { sliderId: `s${idx}-2`, text: `[PLACEHOLDER] Slider 2 för vecka ${idx + 1}`, leftLabel: 'Sällan', rightLabel: 'Ofta' },
      ],
      // Phase B (cards 7-14) and C (15-21) get reflection prompts
      ...(idx >= 7 ? { reflectionPrompt: `[PLACEHOLDER] Reflektionsfråga för vecka ${idx + 1}` } : {}),
    } satisfies CardSliderSet;
  }),
];

export function getSliderSet(cardIndex: number): CardSliderSet | undefined {
  return sliderPrompts.find((s) => s.cardIndex === cardIndex);
}

export default sliderPrompts;
