/**
 * Still Us v2.5 — Slider check-in prompts per card.
 * Each card has 2-3 sliders. Phase A = sliders only, Phase B/C add reflection.
 *
 * Placeholder content marked with [PLACEHOLDER].
 * Replace with authored clinical content.
 */

export interface SliderPrompt {
  id: string;
  /** The question shown above the slider */
  text: string;
  /** Left label (low end) */
  labelMin: string;
  /** Right label (high end) */
  labelMax: string;
}

export interface CardSliderSet {
  cardIndex: number;
  sliders: SliderPrompt[];
  /** Phase B/C reflection prompt (shown after sliders) */
  reflectionPrompt?: string;
}

const sliderPrompts: CardSliderSet[] = [
  // Card 0 — Minsta vi (authored)
  {
    cardIndex: 0,
    sliders: [
      { id: 's0-1', text: 'Hur nära känns vi just nu?', labelMin: 'Långt bort', labelMax: 'Väldigt nära' },
      { id: 's0-2', text: 'Hur mycket tid har ni haft för varandra den här veckan?', labelMin: 'Nästan ingen', labelMax: 'Massor' },
    ],
  },
  // Card 1 — Rytmen (authored)
  {
    cardIndex: 1,
    sliders: [
      { id: 's1-1', text: 'Hur bra funkar er vardagsrytm just nu?', labelMin: 'Kaotiskt', labelMax: 'Flyter fint' },
      { id: 's1-2', text: 'Hur mycket vila får du i relationen?', labelMin: 'Ingen alls', labelMax: 'Mycket' },
    ],
  },
  // Card 2 — Trygga rummet (authored)
  {
    cardIndex: 2,
    sliders: [
      { id: 's2-1', text: 'Hur tryggt känns det att vara ärlig med din partner?', labelMin: 'Osäkert', labelMax: 'Helt tryggt' },
      { id: 's2-2', text: 'Hur väl lyssnar ni på varandra?', labelMin: 'Sällan', labelMax: 'Alltid' },
    ],
  },
  // Card 3 — Att lyssna (authored)
  {
    cardIndex: 3,
    sliders: [
      { id: 's3-1', text: 'Hur ofta känner du dig hörd?', labelMin: 'Aldrig', labelMax: 'Alltid' },
      { id: 's3-2', text: 'Hur lätt är det att be om uppmärksamhet?', labelMin: 'Svårt', labelMax: 'Lätt' },
    ],
  },
  // Card 4 — Behov (authored)
  {
    cardIndex: 4,
    sliders: [
      { id: 's4-1', text: 'Hur bra vet du vad du behöver just nu?', labelMin: 'Osäker', labelMax: 'Helt klar' },
      { id: 's4-2', text: 'Hur lätt är det att uttrycka dina behov?', labelMin: 'Svårt', labelMax: 'Lätt' },
      { id: 's4-3', text: 'Hur väl möter din partner dina behov?', labelMin: 'Sällan', labelMax: 'Ofta' },
    ],
  },
  // Cards 5-21: placeholder
  ...Array.from({ length: 17 }, (_, i) => {
    const idx = i + 5;
    return {
      cardIndex: idx,
      sliders: [
        { id: `s${idx}-1`, text: `[PLACEHOLDER] Slider 1 för vecka ${idx + 1}`, labelMin: 'Lite', labelMax: 'Mycket' },
        { id: `s${idx}-2`, text: `[PLACEHOLDER] Slider 2 för vecka ${idx + 1}`, labelMin: 'Sällan', labelMax: 'Ofta' },
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
