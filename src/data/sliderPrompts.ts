/**
 * Still Us v3.0 — Slider check-in prompts per card.
 * Each card has 2-3 sliders. Phase A = sliders only, Phase B/C add reflection.
 */

import { CARD_SEQUENCE } from '@/data/stillUsSequence';

export interface SliderPrompt {
  sliderId: string;
  /** The question shown above the slider */
  text: string;
  leftLabel: string;
  rightLabel: string;
}

export interface CardSliderSet {
  cardIndex: number;
  /** Backend card ID: 'card_1' through 'card_22' */
  cardId: string;
  /** URL-safe slug used in frontend routes */
  slug: string;
  cardTitle: string;
  layerName: string;
  sliders: SliderPrompt[];
  /** Phase B/C reflection prompt (shown after sliders) */
  reflectionPrompt?: string;
}

/** Derive slug from CARD_SEQUENCE by index (positional) */
function slugFor(idx: number): string {
  return CARD_SEQUENCE[idx]?.cardId ?? `su-${String(idx + 1).padStart(2, '0')}-unknown`;
}

const sliderPrompts: CardSliderSet[] = [
  // Card 0 — Ert minsta "vi" (redan författade)
  {
    cardIndex: 0,
    cardId: 'card_1',
    slug: slugFor(0),
    cardTitle: 'Ert minsta "vi"',
    layerName: 'Grunden',
    sliders: [
      { sliderId: 's0-1', text: 'Hur nära känns vi just nu?', leftLabel: 'Långt bort', rightLabel: 'Väldigt nära' },
      { sliderId: 's0-2', text: 'Hur mycket tid har ni haft för varandra den här veckan?', leftLabel: 'Nästan ingen', rightLabel: 'Massor' },
    ],
  },
  // Card 1 — När ert "vi" blir "Familjen AB"
  {
    cardIndex: 1,
    cardId: 'card_2',
    slug: slugFor(1),
    cardTitle: 'När ert "vi" blir "Familjen AB"',
    layerName: 'Grunden',
    sliders: [
      { sliderId: 's1-1', text: 'Kontakt', leftLabel: 'Jag söker fortfarande kontakt', rightLabel: 'Jag har vant mig vid tystnaden' },
      { sliderId: 's1-2', text: 'Saknad', leftLabel: 'Jag saknar oss', rightLabel: 'Det funkar som det är' },
      { sliderId: 's1-3', text: 'Kommunikation', leftLabel: 'Jag har sagt det', rightLabel: 'Jag har tänkt det men inte sagt det' },
    ],
  },
  // Card 2 — Identitetsskiftet (redan författade)
  {
    cardIndex: 2,
    cardId: 'card_3',
    slug: slugFor(2),
    cardTitle: 'Identitetsskiftet',
    layerName: 'Grunden',
    sliders: [
      { sliderId: 's2-1', text: 'Hur tryggt känns det att vara ärlig med din partner?', leftLabel: 'Osäkert', rightLabel: 'Helt tryggt' },
      { sliderId: 's2-2', text: 'Hur väl lyssnar ni på varandra?', leftLabel: 'Sällan', rightLabel: 'Alltid' },
    ],
  },
  // Card 3 — När dagen är slut
  {
    cardIndex: 3,
    cardId: 'card_4',
    slug: slugFor(3),
    cardTitle: 'När dagen är slut',
    layerName: 'Grunden',
    sliders: [
      { sliderId: 's3-1', text: 'Energi', leftLabel: 'Jag återhämtar mig under dagen', rightLabel: 'Jag tär på reserver som inte fylls på' },
      { sliderId: 's3-2', text: 'Kvällen', leftLabel: 'Kvällen är vår', rightLabel: 'Kvällen är en till uppgift' },
      { sliderId: 's3-3', text: 'Gränser', leftLabel: 'Jag säger till innan jag är slut', rightLabel: 'Jag märker det först när det redan gått för långt' },
    ],
  },
  // Card 4 — Rollerna ni tar (och får)
  {
    cardIndex: 4,
    cardId: 'card_5',
    slug: slugFor(4),
    cardTitle: 'Rollerna ni tar (och får)',
    layerName: 'Normen',
    sliders: [
      { sliderId: 's4-1', text: 'Mina roller', leftLabel: 'Jag valde mina roller', rightLabel: 'Rollerna valde mig' },
      { sliderId: 's4-2', text: 'Trivsel', leftLabel: 'Jag trivs i dem', rightLabel: 'Jag saknar den jag var' },
      { sliderId: 's4-3', text: 'Förändring', leftLabel: 'Jag vill släppa en roll', rightLabel: 'Jag vågar inte släppa den' },
    ],
  },
  // Card 5 — Mitt sätt, ditt sätt
  {
    cardIndex: 5,
    cardId: 'card_6',
    slug: slugFor(5),
    cardTitle: 'Mitt sätt, ditt sätt',
    layerName: 'Normen',
    sliders: [
      { sliderId: 's5-1', text: 'Tillit', leftLabel: 'Jag litar på partnerns sätt', rightLabel: 'Jag tvivlar i tysthet' },
      { sliderId: 's5-2', text: 'Trygghet', leftLabel: 'Jag känner mig trygg som förälder', rightLabel: 'Jag känner mig bedömd' },
      { sliderId: 's5-3', text: 'Olikheter', leftLabel: 'Olikheterna berikar oss', rightLabel: 'Olikheterna gnager' },
    ],
  },
  // Card 6 — Att möta motgångar (redan författade)
  {
    cardIndex: 6,
    cardId: 'card_7',
    slug: slugFor(6),
    cardTitle: 'Att möta motgångar',
    layerName: 'Normen',
    sliders: [
      { sliderId: 's6-1', text: 'Hur hanterar du press?', leftLabel: 'Jag pratar om det', rightLabel: 'Jag håller det för mig själv' },
      { sliderId: 's6-2', text: 'Stöd från partner', leftLabel: 'Jag känner mig stöttad', rightLabel: 'Jag bär det själv' },
    ],
  },
  // Card 7 — Framför och bakom kulisserna
  {
    cardIndex: 7,
    cardId: 'card_8',
    slug: slugFor(7),
    cardTitle: 'Framför och bakom kulisserna',
    layerName: 'Normen',
    sliders: [
      { sliderId: 's7-1', text: 'Enighet', leftLabel: 'Vi är eniga på riktigt', rightLabel: 'Vi spelar eniga' },
      { sliderId: 's7-2', text: 'Stöd', leftLabel: 'Jag känner mig stöttad', rightLabel: 'Jag bär det ensam' },
      { sliderId: 's7-3', text: 'Synlighet', leftLabel: 'Det jag bär syns', rightLabel: 'Det jag bär är osynligt' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  // Card 8 — Omtänksamt utrymme
  {
    cardIndex: 8,
    cardId: 'card_9',
    slug: slugFor(8),
    cardTitle: 'Omtänksamt utrymme',
    layerName: 'Normen',
    sliders: [
      { sliderId: 's8-1', text: 'Behov', leftLabel: 'Jag behöver mer närhet', rightLabel: 'Jag behöver mer utrymme' },
      { sliderId: 's8-2', text: 'Förståelse', leftLabel: 'Du förstår vad jag behöver', rightLabel: 'Jag har slutat förklara' },
      { sliderId: 's8-3', text: 'Signaler', leftLabel: 'Jag visar vad jag behöver', rightLabel: 'Jag hoppas att du märker det' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  // Card 9 — När självkänslan svajar
  {
    cardIndex: 9,
    cardId: 'card_10',
    slug: slugFor(9),
    cardTitle: 'När självkänslan svajar',
    layerName: 'Konflikten',
    sliders: [
      { sliderId: 's9-1', text: 'Öppenhet', leftLabel: 'Jag visar hur jag mår', rightLabel: 'Jag döljer det' },
      { sliderId: 's9-2', text: 'Självvärde', leftLabel: 'Jag vet vad jag är värd för oss', rightLabel: 'Jag har tappat känslan av att räcka till' },
      { sliderId: 's9-3', text: 'Sårbarhet', leftLabel: 'Det är lätt att vara sårbar', rightLabel: 'Det kostar att visa sårbarhet' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  // Card 10 — Uppfostran ni ärvt
  {
    cardIndex: 10,
    cardId: 'card_11',
    slug: slugFor(10),
    cardTitle: 'Uppfostran ni ärvt',
    layerName: 'Konflikten',
    sliders: [
      { sliderId: 's10-1', text: 'Mönster', leftLabel: 'Jag ser mina mönster', rightLabel: 'De styr utan att jag märker' },
      { sliderId: 's10-2', text: 'Historia', leftLabel: 'Min historia hjälper mig', rightLabel: 'Min historia stör' },
      { sliderId: 's10-3', text: 'Röster', leftLabel: 'Jag hör mina föräldrars röst och väljer annorlunda', rightLabel: 'Jag hör mina föräldrars röst och följer den' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  // Card 11 — Att säga ifrån
  {
    cardIndex: 11,
    cardId: 'card_12',
    slug: slugFor(11),
    cardTitle: 'Att säga ifrån',
    layerName: 'Konflikten',
    sliders: [
      { sliderId: 's11-1', text: 'Gränser', leftLabel: 'Jag är trygg i mina gränser', rightLabel: 'Jag tvivlar varje gång' },
      { sliderId: 's11-2', text: 'Tillsammans', leftLabel: 'Vi sätter gränser ihop', rightLabel: 'En av oss står ensam' },
      { sliderId: 's11-3', text: 'När ni sätter gränser', leftLabel: 'Det handlar om barnet', rightLabel: 'Det handlar om oss' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  // Card 12 — Mina, dina, era värderingar
  {
    cardIndex: 12,
    cardId: 'card_13',
    slug: slugFor(12),
    cardTitle: 'Mina, dina, era värderingar',
    layerName: 'Konflikten',
    sliders: [
      { sliderId: 's12-1', text: 'Integritet', leftLabel: 'Vi lever som vi tror', rightLabel: 'Vi lever inte som vi säger' },
      { sliderId: 's12-2', text: 'Enighet', leftLabel: 'Vi tycker likadant', rightLabel: 'Vi låtsas tycka likadant' },
      { sliderId: 's12-3', text: 'Kompromisser', leftLabel: 'Mina kompromisser är fria', rightLabel: 'Mina kompromisser kostar' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  // Card 13 — Röster från släkten (redan författade)
  {
    cardIndex: 13,
    cardId: 'card_14',
    slug: slugFor(13),
    cardTitle: 'Röster från släkten',
    layerName: 'Konflikten',
    sliders: [
      { sliderId: 's13-1', text: 'Familjen', leftLabel: 'Familjen stöttar', rightLabel: 'Familjen komplicerar' },
      { sliderId: 's13-2', text: 'Anpassning', leftLabel: 'Vi sätter gränserna', rightLabel: 'Familjen sätter gränserna' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  // Card 14 — Mina, dina, era traditioner
  {
    cardIndex: 14,
    cardId: 'card_15',
    slug: slugFor(14),
    cardTitle: 'Mina, dina, era traditioner',
    layerName: 'Längtan',
    sliders: [
      { sliderId: 's14-1', text: 'Plats', leftLabel: 'Mina traditioner har plats', rightLabel: 'Jag har anpassat mig' },
      { sliderId: 's14-2', text: 'Förståelse', leftLabel: 'Jag förstår varför det är viktigt', rightLabel: 'Jag följer med utan att förstå' },
      { sliderId: 's14-3', text: 'Motivation', leftLabel: 'Jag följer med av kärlek', rightLabel: 'Jag följer med av plikt' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  // Card 15 — Er filosofi
  {
    cardIndex: 15,
    cardId: 'card_16',
    slug: slugFor(15),
    cardTitle: 'Er filosofi',
    layerName: 'Längtan',
    sliders: [
      { sliderId: 's15-1', text: 'Integritet', leftLabel: 'Jag lever som jag tror', rightLabel: 'Jag sviker mig själv ibland' },
      { sliderId: 's15-2', text: 'När du inte lever som du tror', leftLabel: 'Jag pratar om det', rightLabel: 'Jag bär det själv' },
      { sliderId: 's15-3', text: 'När det går fel', leftLabel: 'Skulden fördelas', rightLabel: 'Skulden landar på mig' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  // Card 16 — När livet lutar
  {
    cardIndex: 16,
    cardId: 'card_17',
    slug: slugFor(16),
    cardTitle: 'När livet lutar',
    layerName: 'Längtan',
    sliders: [
      { sliderId: 's16-1', text: 'Mål', leftLabel: 'Mina mål har plats', rightLabel: 'Mina mål får vänta' },
      { sliderId: 's16-2', text: 'Stöd', leftLabel: 'Jag stöttar utan kostnad', rightLabel: 'Mitt stöd kostar mig' },
      { sliderId: 's16-3', text: 'Riktning', leftLabel: 'Vi bygger åt samma håll', rightLabel: 'Jag vet inte vart vi är på väg' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  // Card 17 — Värt att spendera på
  {
    cardIndex: 17,
    cardId: 'card_18',
    slug: slugFor(17),
    cardTitle: 'Värt att spendera på',
    layerName: 'Längtan',
    sliders: [
      { sliderId: 's17-1', text: 'Önskningar', leftLabel: 'Jag säger vad jag vill', rightLabel: 'Jag håller tillbaka mina önskningar' },
      { sliderId: 's17-2', text: 'Förståelse', leftLabel: 'Det jag värderar förstås', rightLabel: 'Jag har slutat förklara varför det är viktigt' },
      { sliderId: 's17-3', text: 'Prioritering', leftLabel: 'Min prioritering räknas', rightLabel: 'Min prioritering ifrågasätts' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  // Card 18 — Risk under ansvar
  {
    cardIndex: 18,
    cardId: 'card_19',
    slug: slugFor(18),
    cardTitle: 'Risk under ansvar',
    layerName: 'Valet',
    sliders: [
      { sliderId: 's18-1', text: 'Kontroll', leftLabel: 'Jag känner kontroll', rightLabel: 'Jag känner beroende' },
      { sliderId: 's18-2', text: 'Osäkerhet', leftLabel: 'Osäkerhet ger mig energi', rightLabel: 'Osäkerhet tär på mig' },
      { sliderId: 's18-3', text: 'Ekonomisk risk', leftLabel: 'Jag säger ifrån i tid', rightLabel: 'Jag anpassar mig tills det brister' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  // Card 19 — På drift
  {
    cardIndex: 19,
    cardId: 'card_20',
    slug: slugFor(19),
    cardTitle: 'På drift',
    layerName: 'Valet',
    sliders: [
      { sliderId: 's19-1', text: 'Närhet', leftLabel: 'Jag är nära just nu', rightLabel: 'Jag har dragit mig undan' },
      { sliderId: 's19-2', text: 'Vald', leftLabel: 'Jag känner mig vald', rightLabel: 'Jag känner mig kvar' },
      { sliderId: 's19-3', text: 'Fas', leftLabel: 'Det är en fas', rightLabel: 'Jag vet inte vad det är' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  // Card 20 — Kärleksspråk
  {
    cardIndex: 20,
    cardId: 'card_21',
    slug: slugFor(20),
    cardTitle: 'Kärleksspråk',
    layerName: 'Valet',
    sliders: [
      { sliderId: 's20-1', text: 'Förstådd', leftLabel: 'Jag känner mig förstådd', rightLabel: 'Min längtan missas' },
      { sliderId: 's20-2', text: 'Signaler', leftLabel: 'Jag visar vad jag vill', rightLabel: 'Jag väntar och hoppas' },
      { sliderId: 's20-3', text: 'Språk', leftLabel: 'Vi talar samma språk', rightLabel: 'Vi menar olika saker' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  // Card 21 — Att fortsätta välja (redan författade)
  {
    cardIndex: 21,
    cardId: 'card_22',
    slug: slugFor(21),
    cardTitle: 'Att fortsätta välja',
    layerName: 'Valet',
    sliders: [
      { sliderId: 's21-1', text: 'Valet', leftLabel: 'Jag väljer aktivt', rightLabel: 'Jag stannar av vana' },
      { sliderId: 's21-2', text: 'Varför', leftLabel: 'Jag vet varför jag är här', rightLabel: 'Jag stannar utan att veta varför' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
];

export function getSliderSet(cardIndex: number): CardSliderSet | undefined {
  return sliderPrompts.find((s) => s.cardIndex === cardIndex);
}

/** Look up a CardSliderSet by its frontend slug */
export function getSliderSetBySlug(slug: string): CardSliderSet | undefined {
  return sliderPrompts.find((s) => s.slug === slug);
}

export default sliderPrompts;
