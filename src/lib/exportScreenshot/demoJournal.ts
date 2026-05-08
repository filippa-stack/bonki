/**
 * Demo journal data used by Screenshot 2 (Era samtal) and Screenshot 6
 * (Jag i Mig completion takeaway). Edit any string here and the screenshots
 * re-render — no other surface in the app reads from this file.
 *
 * The two APRIL 2026 entries are real reflections from Filippa's account
 * (provided as uploaded screenshots). The two MARS 2026 entries are
 * BONKI-voice fillers anchored to real shipped card titles.
 */

export interface DemoReflection {
  product: 'Vårt Vi' | 'Jag i Mig' | 'Syskon';
  cardTitle: string;
  date: string; // dd månad
  monthLabel: string; // e.g. "APRIL 2026"
  question: string;
  body: string;
}

export const DEMO_REFLECTIONS: DemoReflection[] = [
  {
    product: 'Vårt Vi',
    cardTitle: 'Mitt sätt, ditt sätt',
    date: '10 april',
    monthLabel: 'APRIL 2026',
    question: 'I vilka situationer känner du dig mest trygg i ditt sätt att vara förälder?',
    body:
      'Vi pratade mycket om att jag känner mig trygg i det som är känslomässigt, men mer osäker när det handlar om att stå kvar i regler eller konsekvenser.',
  },
  {
    product: 'Vårt Vi',
    cardTitle: 'Ert minsta "vi"',
    date: '9 april',
    monthLabel: 'APRIL 2026',
    question: 'Vad är det som gör att ni känner er som ett par — bortom det praktiska ni delar?',
    body:
      'Att vi tycker om samma saker, eller kanske mer att vi skrattar åt samma saker och vet att den andre kommer att förstå utan att vi säger något eller ens tittar på varandra.',
  },
  {
    product: 'Jag i Mig',
    cardTitle: 'Glad',
    date: '24 mars',
    monthLabel: 'MARS 2026',
    question: 'När blev du senast riktigt glad för något?',
    body:
      'Att Lova vill bli lärare för att hennes lärare lyssnar på henne på riktigt — hon sa det utan att vi frågade, mitt i en helt vanlig kväll.',
  },
  {
    product: 'Syskon',
    cardTitle: 'Vi blev syskon',
    date: '11 mars',
    monthLabel: 'MARS 2026',
    question: 'Vad minns ni från när ni blev syskon?',
    body:
      'Att de pratar om det som om det alltid varit så — och att det är vi som bär minnet av hur det började.',
  },
];

/** The single takeaway used for Screenshot 6 (Jag i Mig completion). */
export const DEMO_TAKEAWAY = {
  cardTitle: 'Glad',
  body:
    'Att Lova vill bli lärare för att hennes lärare lyssnar på henne på riktigt.',
};
