/**
 * Still Us v3.0 — Gör Exercises (Teamwork)
 * 20 entries, keyed by card ID for resilience against reordering.
 */

export interface GorExercise {
  cardId: string;
  title: string;
  instructionText: string;
}

const gorExercises: Record<string, GorExercise> = {
  'smallest-we': {
    cardId: 'smallest-we',
    title: 'Ert minsta "vi"',
    instructionText: 'Välj en mycket liten handling eller aktivitet ni gör tillsammans tre gånger kommande vecka.\n\n→ Blev det ett test - eller en lösning?',
  },
  'family-ab': {
    cardId: 'family-ab',
    title: 'När ert "vi" blir "Familjen AB"',
    instructionText: 'Avsätt tio minuter en gång den här veckan. Inga barn, ingen logistik. Om ni inte har något att säga – sitt kvar ändå. Vad lade ni märke till?',
  },
  'identity-shift': {
    cardId: 'identity-shift',
    title: 'Identitetsskiftet',
    instructionText: 'Berätta för varandra om en sak ni idag håller tillbaka.\n\n→ Vad skulle ett litet första steg kunna vara — för att ge den mer plats?',
  },
  'listening-presence': {
    cardId: 'listening-presence',
    title: 'När dagen är slut',
    instructionText: 'Välj en konkret handling eller mening som markerar att dagen är avslutad för er båda.\n\n→ Prova i tre kvällar — och prata sedan om vad det förändrade.',
  },
  'conflict-repair': {
    cardId: 'conflict-repair',
    title: 'Rollerna ni tar (och får)',
    instructionText: 'Välj en etablerad roll som ni byter under en vecka. Prata om hur det kändes - utan att rätta varandra. Var det något som överraskade er - positivt eller negativt?',
  },
  'expressing-needs': {
    cardId: 'expressing-needs',
    title: 'Mitt sätt, ditt sätt',
    instructionText: 'Välj ett område där ni medvetet låter två sätt samexistera.\n\n→ Prata om vad ni vill att barnet ska förstå — inte om vem som gör rätt.',
  },
  'facing-adversity': {
    cardId: 'facing-adversity',
    title: 'Att möta motgångar',
    instructionText: 'Välj en situation ni vet kommer att uppstå den här veckan.\n\n→ Bestäm i förväg att ni provar den enas sätt — utan att den andra rättar eller tar över.',
  },
  'behind-the-scenes': {
    cardId: 'behind-the-scenes',
    title: 'Framför och bakom kulisserna',
    instructionText: 'Bestäm ett sätt att signalera "vi tar det här sen" — som båda litar på.\n\n→ Prova det nästa gång det behövs.',
  },
  'thoughtful-space': {
    cardId: 'thoughtful-space',
    title: 'Omtänksamt utrymme',
    instructionText: 'Kom överens om hur ni visar varandra:\n\n→ när jag behöver vara ifred\n→ när jag behöver att du stannar\n→ när jag inte vet vad jag behöver',
  },
  'self-esteem-wavering': {
    cardId: 'self-esteem-wavering',
    title: 'När självkänslan svajar',
    instructionText: 'Berätta för varandra: "När jag tvivlar på mig själv, hjälper det mig om du..."\n\n→ Lyssna utan att rätta eller tona ner.',
  },
  'different-parenting-styles': {
    cardId: 'different-parenting-styles',
    title: 'Uppfostran ni ärvt',
    instructionText: 'Berätta för varandra om en situation med barnen där du reagerade mer på din historia än på det som faktiskt hände. Vad var det som tog över?',
  },
  'parenting-boundaries': {
    cardId: 'parenting-boundaries',
    title: 'Att säga ifrån',
    instructionText: 'Prata om en sak ni vill undvika att göra i affekt - och en sak ni vill hålla fast vid, även när ni tycker olika.',
  },
  'parenting-exhaustion': {
    cardId: 'parenting-exhaustion',
    title: 'Mina, dina, era värderingar',
    instructionText: 'Välj en värdering ni delar men uttrycker olika.\n\n→ Prata om hur den syns i var och ens sätt att vara förälder.',
  },
  'our-traditions': {
    cardId: 'our-traditions',
    title: 'Mina, dina, era traditioner',
    instructionText: 'Välj något från vardera familj som ni vill föra vidare — och en ny tradition som bara är er. \n→ Blev ni överraskade av varandras val?',
  },
  'our-philosophy': {
    cardId: 'our-philosophy',
    title: 'Er filosofi',
    instructionText: 'Finns det mågot ni kompromissat med den senaste tiden — som ni egentligen inte ville ge upp.',
  },
  'when-life-tilts': {
    cardId: 'when-life-tilts',
    title: 'När livet lutar',
    instructionText: 'Berätta för varandra om något ni vill satsa på — stort eller litet.\n\n→ Prata om vad som gör det värt det.',
  },
  'worth-spending-on': {
    cardId: 'worth-spending-on',
    title: 'Värt att spendera på',
    instructionText: 'Välj ett beslut ni skjutit framför er — och fatta det tillsammans den här veckan.\n\n→ Inte det perfekta beslutet. Bara ett gemensamt.',
  },
  'adrift': {
    cardId: 'adrift',
    title: 'På drift',
    instructionText: 'Välj en sak den här veckan som bryter mönstret — något litet som ni inte gjort på länge.\n\n→ Gör det. Prata sedan om vad det väckte.',
  },
  'love-languages': {
    cardId: 'love-languages',
    title: 'Att nå fram',
    instructionText: 'Kom överens om hur ni säger två saker: "Jag längtar efter närhet" och "Jag kan inte just nu, men jag vill dig."\n\n→ Hur kan de se ut — så att ingen behöver gissa?',
  },
  'choosing-to-stay': {
    cardId: 'choosing-to-stay',
    title: 'Att fortsätta välja',
    instructionText: 'Säg till varandra, utan att förklara eller försvara:\n\n"Det här hos dig gör att jag vill vara kvar."\n→ Stanna upp. Låt din partner ta emot det utan att svara direkt.\n"Det här vill jag inte ta för givet."\n→ Tacka varandra.',
  },
};

/** Look up a Gör exercise by card ID */
export function getGorExercise(cardId: string): GorExercise | null {
  return gorExercises[cardId] ?? null;
}

export default gorExercises;
