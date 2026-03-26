/**
 * Still Us v3.0 — Gör Exercises (Tab 9 from content spreadsheet).
 * 22 entries, keyed by card ID for resilience against reordering.
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
    instructionText: 'Välj en mycket liten sak ni gör tillsammans tre gånger den här veckan.\n→ Var det ett test — eller blev det en lösning?',
  },
  'family-ab': {
    cardId: 'family-ab',
    title: 'När ert "vi" blir "Familjen AB"',
    instructionText: 'Tio minuter den här veckan. Inga barn, ingen logistik.\n→ Om ni inte hade något att säga — vad sa det?',
  },
  'identity-shift': {
    cardId: 'identity-shift',
    title: 'Identitetsskiftet',
    instructionText: 'Nämn en sak vardera som ni håller tillbaka.\n→ Vad skulle behövas för att ge den lite mer plats?',
  },
  'listening-presence': {
    cardId: 'listening-presence',
    title: 'När dagen är slut',
    instructionText: 'Välj ett tecken som betyder: dagen är slut.\n→ Förändrade det kvällen — eller synliggjorde det bara vad som saknades?',
  },
  'conflict-repair': {
    cardId: 'conflict-repair',
    title: 'Rollerna ni tar (och får)',
    instructionText: 'Byt en roll i en vecka.\n→ Vad kändes ovant — utan att rätta varandra?',
  },
  'expressing-needs': {
    cardId: 'expressing-needs',
    title: 'Mitt sätt, ditt sätt',
    instructionText: 'Välj ett område där båda sätt får vara.\n→ Vad vill ni att barnet ska förstå — inte om vem som gör rätt, utan om att det finns mer än ett sätt?',
  },
  'facing-adversity': {
    cardId: 'facing-adversity',
    title: 'Att möta motgångar',
    instructionText: 'Planera en vecka där båda era sätt får plats.\n→ Fick båda plats — eller tog det ena över?',
  },
  'behind-the-scenes': {
    cardId: 'behind-the-scenes',
    title: 'Framför och bakom kulisserna',
    instructionText: 'Bestäm en signal för "vi tar det sen".\n→ Vad var svårast — att signalera, eller att följa upp?',
  },
  'thoughtful-space': {
    cardId: 'thoughtful-space',
    title: 'Omtänksamt utrymme',
    instructionText: 'Tre tecken: "jag behöver vara ifred", "jag behöver att du stannar", "jag vet inte vad jag behöver".\n→ Kände din partner igen det du beskrev?',
  },
  'self-esteem-wavering': {
    cardId: 'self-esteem-wavering',
    title: 'När självkänslan svajar',
    instructionText: 'Enas om vilka ord ni använder — och undviker — inför barnet när en av er tvivlar på sig själv.\n→ Sa det något om vem av er som bär mest just nu?',
  },
  'different-parenting-styles': {
    cardId: 'different-parenting-styles',
    title: 'Uppfostran ni ärvt',
    instructionText: 'Välj en mening som betyder: "det här handlar inte om nu".\n→ Skyddade den det ni ville skydda?',
  },
  'parenting-boundaries': {
    cardId: 'parenting-boundaries',
    title: 'Att säga ifrån',
    instructionText: 'Två överenskommelser: en sak ni undviker i affekt, en sak ni håller fast vid.\n→ Var det lättast att enas om vad ni undviker — eller vad ni håller fast vid?',
  },
  'parenting-exhaustion': {
    cardId: 'parenting-exhaustion',
    title: 'Mina, dina, era värderingar',
    instructionText: 'Välj en värdering ni tappar i vardagen. Enas om ett tecken.\n→ Första gången ni använde tecknet — skyddade det det ni ville?',
  },
  'family-voices': {
    cardId: 'family-voices',
    title: 'Röster från släkten',
    instructionText: 'Enas om en neutral mening ni kan säga inför barnet.\n→ Vad gjorde meningen med stämningen?',
  },
  'our-traditions': {
    cardId: 'our-traditions',
    title: 'Mina, dina, era traditioner',
    instructionText: 'Välj en tradition som är viktigare för en av er. Prata om vad den betyder.\n→ Blev ni överraskade av något?',
  },
  'our-philosophy': {
    cardId: 'our-philosophy',
    title: 'Er filosofi',
    instructionText: 'Välj en situation under press där ni reagerade olika.\n→ Försökte ni skydda samma sak — eller olika?',
  },
  'when-life-tilts': {
    cardId: 'when-life-tilts',
    title: 'När livet lutar',
    instructionText: 'Bestäm två tecken som betyder: "nu behöver vi bromsa".\n→ Stämde tecknen efter två veckor?',
  },
  'worth-spending-on': {
    cardId: 'worth-spending-on',
    title: 'Värt att spendera på',
    instructionText: 'Enas om: vad gör det värt det — och vad händer om en av er ångrar sig?\n→ Var det lättare att prata om kostnaden eller om ångern?',
  },
  'risk-under-responsibility': {
    cardId: 'risk-under-responsibility',
    title: 'Risk under ansvar',
    instructionText: 'Välj en möjlig satsning. Bästa utfall, svåraste utfall, och en gräns ni inte passerar.\n→ Återkom efter en månad — var gränsen rätt?',
  },
  'adrift': {
    cardId: 'adrift',
    title: 'På drift',
    instructionText: 'Bryt autopiloten i en vecka. Nytt sätt att hälsa, ta i varandra, eller ställa frågor.\n→ Förde det er närmare — eller visade det på ett avstånd?',
  },
  'love-languages': {
    cardId: 'love-languages',
    title: 'Kärleksspråk',
    instructionText: 'Två signaler: "jag längtar efter dig" och "inte nu, men jag vill dig".\n→ Hur kan de se ut så att ingen behöver gissa?',
  },
  'choosing-to-stay': {
    cardId: 'choosing-to-stay',
    title: 'Att fortsätta välja',
    instructionText: 'Berätta — var för sig — en sak hos den andra som gör att du vill vara kvar.\n→ Inget mer. Ingen förklaring. Låt det vara sant.',
  },
};

/** Look up a Gör exercise by card ID */
export function getGorExercise(cardId: string): GorExercise | null {
  return gorExercises[cardId] ?? null;
}

/** @deprecated Use getGorExercise(cardId) instead */
export function getGorExerciseByIndex(cardIndex: number): GorExercise | null {
  const ids = Object.keys(gorExercises);
  return ids[cardIndex] ? gorExercises[ids[cardIndex]] : null;
}

export default gorExercises;
