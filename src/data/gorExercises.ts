/**
 * Vårt Vi v3.1 — Gör Exercises (Teamwork).
 * 18 entries, keyed by bare card id.
 */

export interface GorExercise {
  cardId: string;
  title: string;
  instructionText: string;
}

const gorExercises: Record<string, GorExercise> = {
  'our-traditions': {
    cardId: 'our-traditions',
    title: 'Vår uppväxt',
    instructionText: 'Kom överens om en mening att säga till varandra nästa gång ni märker att den andre har fastnat i ett gammalt mönster. Något omtänksamt som ni båda kan ta till er utan att gå i försvarsställning. Skriv ner den.',
  },
  'identity-shift': {
    cardId: 'identity-shift',
    title: 'Utvecklingen',
    instructionText: 'Säg till varandra: en förändring jag har sett hos dig som jag uppskattar, och en som jag fortfarande försöker förstå. Två meningar var. Inget mer.',
  },
  'listening-presence': {
    cardId: 'listening-presence',
    title: 'Att bli sedd på riktigt',
    instructionText: 'Berätta för varandra om en sak du vill att den andre ska se hos dig, som du tror att de missar. Den som lyssnar svarar endast: "Tack för att du delade med dig."',
  },
  'expressing-needs': {
    cardId: 'expressing-needs',
    title: 'Det som förblir osagt',
    instructionText: 'Säg en liten sanning till varandra. Inte den största. En sak du har tänkt men inte sagt. Lyssnaren svarar: "Tack för att du delade med dig."',
  },
  'behind-the-scenes': {
    cardId: 'behind-the-scenes',
    title: 'Vänskapens betydelse',
    instructionText: 'Berätta för varandra om en vän du vill att den andre ska lära känna bättre, för att personen då skulle förstå dig på ett nytt sätt. Bestäm en kväll inom en månad då detta faktiskt ska ske.',
  },
  'thoughtful-space': {
    cardId: 'thoughtful-space',
    title: 'Rösterna utifrån',
    instructionText: 'Berätta för varandra om en person vars åsikt om oss jag har låtit påverka mig mer än jag borde. Två meningar var. Inget mer.',
  },
  'self-esteem-wavering': {
    cardId: 'self-esteem-wavering',
    title: 'Det egna utrymmet',
    instructionText: 'Kom överens om en konkret förändring: en kväll i veckan, en eftermiddag eller en helg i månaden – skapa ett skyddat utrymme för det egna jaget. Var specifik. När börjar ni? Skriv ner det.',
  },
  'smallest-we': {
    cardId: 'smallest-we',
    title: 'Det osynliga ansvaret',
    instructionText: 'Välj en konkret sak som ni förändrar eller delar på ett nytt sätt från och med imorgon. Bara en sak. Skriv ner den. Bestäm när ni ska stämma av om två veckor.',
  },
  'worth-spending-on': {
    cardId: 'worth-spending-on',
    title: 'Pengarnas symbolik',
    instructionText: 'Dela med varandra: en sak du är tacksam för i hur ni hanterar er ekonomi, och en sak du önskar vore annorlunda. Två meningar var.',
  },
  'facing-adversity': {
    cardId: 'facing-adversity',
    title: 'Att bära och bli buren',
    instructionText: 'Berätta för varandra: När jag kämpar vill jag att du finns nära på det här specifika sättet. Var konkret. Säg inte bara "var där för mig" – beskriv något du faktiskt kan göra. Båda berättar, båda lyssnar.',
  },
  'conflict-repair': {
    cardId: 'conflict-repair',
    title: 'Den tysta muren',
    instructionText: 'Säg till varandra: nästa gång jag drar mig undan vill jag att du gör precis det här. Inte något generellt, utan en konkret handling. Säg varsin sak och skriv ner båda.',
  },
  'adrift': {
    cardId: 'adrift',
    title: 'Begäret och avståndet',
    instructionText: 'Berätta för varandra: en sak, förutom sex, som får mig att känna mig nära dig. Var konkret. Bestäm därefter när ni ska göra mer av detta under de kommande två veckorna.',
  },
  'love-languages': {
    cardId: 'love-languages',
    title: 'Den outtalade längtan',
    instructionText: 'Dela en outtalad önskan med varandra. Inte den största, utan en liten. Den som lyssnar svarar bara: "Tack för att du delade med dig."',
  },
  'when-life-tilts': {
    cardId: 'when-life-tilts',
    title: 'Vägen tillbaka',
    instructionText: 'Skapa ert reparationsprotokoll. Bestäm tre saker: en mening den som sårat kan säga för att inleda en försoning, en tidsram för när ni senast måste prata om det, samt en specifik plats där ni gör det. Skriv ner alla tre och spara dem.',
  },
  'family-ab': {
    cardId: 'family-ab',
    title: 'Uppmärksamhet åt annat håll',
    instructionText: 'Bestäm er: vad vill ni att den andre ska göra om en dragning till någon annan uppstår? Var ärliga och tydliga. Skriv ner vad ni kommer överens om.',
  },
  'parenting-boundaries': {
    cardId: 'parenting-boundaries',
    title: 'De röda linjerna',
    instructionText: 'Den här sessionen var den tyngsta hittills. Säg till varandra: "Det här är vad jag har delat ikväll. Du har hört det. Jag litar på dig med det." Den andre svarar: "Jag tar emot det. Jag bär det varsamt."',
  },
  'different-parenting-styles': {
    cardId: 'different-parenting-styles',
    title: 'Frågan om barn',
    instructionText: 'Dela en längtan eller en rädsla du bär på just nu angående barnfrågan. Den som lyssnar svarar enbart: "Tack för att du delade med dig."',
  },
  'parenting-exhaustion': {
    cardId: 'parenting-exhaustion',
    title: 'Drömmens pris',
    instructionText: 'Skriv ner en dröm du har, som du vill att den andra personen ska känna till och fråga dig om en gång om året. Byt papper med varandra. Bestäm ett datum om exakt ett år. Lägg in det i kalendern redan nu — det är drömmens årsdag.',
  },
};

/** Look up a Gör exercise by card ID */
export function getGorExercise(cardId: string): GorExercise | null {
  return gorExercises[cardId] ?? null;
}

export default gorExercises;
