/**
 * Still Us v3.0 — Tillbaka (maintenance) cards.
 * 12 monthly cards delivered after the 22-week program.
 * Each has 2 sliders and 2 questions.
 *
 * Placeholder content marked with [PLACEHOLDER].
 */

export interface TillbakaCard {
  index: number;
  title: string;
  question1: string;
  question2: string;
  sliders: { id: string; text: string; leftLabel: string; rightLabel: string }[];
}

const tillbakaCards: TillbakaCard[] = [
  {
    index: 0,
    title: 'Tillbaka: Hur mår vi?',
    question1: 'Vad har förändrats i ert förhållande sedan ni avslutade programmet?',
    question2: 'Vad vill ni ta med er från den här insikten?',
    sliders: [
      { id: 'tb0-1', text: 'Hur nära känns ni just nu?', leftLabel: 'Långt bort', rightLabel: 'Väldigt nära' },
      { id: 'tb0-2', text: 'Hur ofta pratar ni om era känslor?', leftLabel: 'Sällan', rightLabel: 'Ofta' },
    ],
  },
  {
    index: 1,
    title: 'Tillbaka: Vardagen',
    question1: 'Hur ser er vardag ut nu jämfört med innan programmet?',
    question2: 'Finns det något ni vill justera?',
    sliders: [
      { id: 'tb1-1', text: 'Hur bra balanserar ni vardag och relation?', leftLabel: 'Dåligt', rightLabel: 'Bra' },
      { id: 'tb1-2', text: 'Hur mycket kvalitetstid har ni haft?', leftLabel: 'Lite', rightLabel: 'Mycket' },
    ],
  },
  {
    index: 2,
    title: 'Tillbaka: Konflikter',
    question1: 'Hur hanterar ni oenigheter idag?',
    question2: 'Vad har ni lärt er om era konflikter?',
    sliders: [
      { id: 'tb2-1', text: 'Hur tryggt är det att vara oense?', leftLabel: 'Hotfullt', rightLabel: 'Helt tryggt' },
      { id: 'tb2-2', text: 'Hur snabbt hittar ni tillbaka till varandra efter bråk?', leftLabel: 'Långsamt', rightLabel: 'Snabbt' },
    ],
  },
  {
    index: 3,
    title: 'Tillbaka: Drömmar',
    question1: 'Vad drömmer ni om för ert förhållande?',
    question2: 'Vad skulle ett steg mot den drömmen kunna vara?',
    sliders: [
      { id: 'tb3-1', text: 'Hur mycket delar ni era drömmar med varandra?', leftLabel: 'Lite', rightLabel: 'Mycket' },
      { id: 'tb3-2', text: 'Hur optimistiska känner ni er om framtiden?', leftLabel: 'Osäkra', rightLabel: 'Hoppfulla' },
    ],
  },
  // 8 placeholder cards — all with 2 sliders
  ...Array.from({ length: 8 }, (_, i) => ({
    index: i + 4,
    title: `[PLACEHOLDER] Tillbaka ${i + 5}`,
    question1: `[PLACEHOLDER] Fråga 1 för Tillbaka-kort ${i + 5}`,
    question2: `[PLACEHOLDER] Fråga 2 för Tillbaka-kort ${i + 5}`,
    sliders: [
      { id: `tb${i + 4}-1`, text: `[PLACEHOLDER] Slider 1 för Tillbaka ${i + 5}`, leftLabel: 'Lite', rightLabel: 'Mycket' },
      { id: `tb${i + 4}-2`, text: `[PLACEHOLDER] Slider 2 för Tillbaka ${i + 5}`, leftLabel: 'Sällan', rightLabel: 'Ofta' },
    ],
  })),
];

export function getTillbakaCard(index: number): TillbakaCard | undefined {
  return tillbakaCards.find((c) => c.index === index);
}

export default tillbakaCards;
