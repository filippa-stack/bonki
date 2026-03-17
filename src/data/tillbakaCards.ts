/**
 * Still Us v2.5 — Tillbaka (maintenance) cards.
 * 12 monthly cards delivered after the 22-week program.
 * Each has a simplified 2-question session format.
 *
 * Placeholder content marked with [PLACEHOLDER].
 */

export interface TillbakaCard {
  index: number;
  title: string;
  question1: string;
  question2: string;
  sliders: { id: string; text: string; labelMin: string; labelMax: string }[];
}

const tillbakaCards: TillbakaCard[] = [
  // 4 authored
  {
    index: 0,
    title: 'Tillbaka: Hur mår vi?',
    question1: 'Vad har förändrats i ert förhållande sedan ni avslutade programmet?',
    question2: 'Vad vill ni ta med er från den här insikten?',
    sliders: [
      { id: 'tb0-1', text: 'Hur nära känns ni just nu?', labelMin: 'Långt bort', labelMax: 'Väldigt nära' },
      { id: 'tb0-2', text: 'Hur ofta pratar ni om era känslor?', labelMin: 'Sällan', labelMax: 'Ofta' },
    ],
  },
  {
    index: 1,
    title: 'Tillbaka: Vardagen',
    question1: 'Hur ser er vardag ut nu jämfört med innan programmet?',
    question2: 'Finns det något ni vill justera?',
    sliders: [
      { id: 'tb1-1', text: 'Hur bra balanserar ni vardag och relation?', labelMin: 'Dåligt', labelMax: 'Bra' },
    ],
  },
  {
    index: 2,
    title: 'Tillbaka: Konflikter',
    question1: 'Hur hanterar ni oenigheter idag?',
    question2: 'Vad har ni lärt er om era konflikter?',
    sliders: [
      { id: 'tb2-1', text: 'Hur tryggt är det att vara oense?', labelMin: 'Hotfullt', labelMax: 'Helt tryggt' },
    ],
  },
  {
    index: 3,
    title: 'Tillbaka: Drömmar',
    question1: 'Vad drömmer ni om för ert förhållande?',
    question2: 'Vad skulle ett steg mot den drömmen kunna vara?',
    sliders: [
      { id: 'tb3-1', text: 'Hur mycket delar ni era drömmar med varandra?', labelMin: 'Lite', labelMax: 'Mycket' },
    ],
  },
  // 8 placeholder cards
  ...Array.from({ length: 8 }, (_, i) => ({
    index: i + 4,
    title: `[PLACEHOLDER] Tillbaka ${i + 5}`,
    question1: `[PLACEHOLDER] Fråga 1 för Tillbaka-kort ${i + 5}`,
    question2: `[PLACEHOLDER] Fråga 2 för Tillbaka-kort ${i + 5}`,
    sliders: [
      { id: `tb${i + 4}-1`, text: `[PLACEHOLDER] Slider för Tillbaka ${i + 5}`, labelMin: 'Lite', labelMax: 'Mycket' },
    ],
  })),
];

export function getTillbakaCard(index: number): TillbakaCard | undefined {
  return tillbakaCards.find((c) => c.index === index);
}

export default tillbakaCards;
