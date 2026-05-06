/**
 * Vårt Vi v3.1 — Slider check-in prompts per card.
 * Slider sets are tied to each card by bare id; positional `cardIndex`
 * and `slug` are derived from CARD_SEQUENCE so they auto-update with
 * any sequence reorder.
 */

import { CARD_SEQUENCE, bareIdFromSlug } from '@/data/stillUsSequence';

export interface SliderPrompt {
  sliderId: string;
  text: string;
  leftLabel: string;
  rightLabel: string;
}

export interface CardSliderSet {
  cardIndex: number;
  cardId: string;
  slug: string;
  cardTitle: string;
  layerName: string;
  sliders: SliderPrompt[];
  reflectionPrompt?: string;
}

interface RawSliderSet {
  bareId: string;
  sliders: SliderPrompt[];
  reflectionPrompt?: string;
}

/** Slider content keyed by bare card id — survives sequence reordering. */
const RAW: RawSliderSet[] = [
  {
    bareId: 'smallest-we',
    sliders: [
      { sliderId: 'smallest-we-1', text: 'Hur nära känns vi just nu?', leftLabel: 'Långt bort', rightLabel: 'Väldigt nära' },
      { sliderId: 'smallest-we-2', text: 'Hur mycket tid har ni haft för varandra den här veckan?', leftLabel: 'Nästan ingen', rightLabel: 'Massor' },
    ],
  },
  {
    bareId: 'family-ab',
    sliders: [
      { sliderId: 'family-ab-1', text: 'Kontakt', leftLabel: 'Jag söker fortfarande kontakt', rightLabel: 'Jag har vant mig vid tystnaden' },
      { sliderId: 'family-ab-2', text: 'Saknad', leftLabel: 'Jag saknar oss', rightLabel: 'Det funkar som det är' },
      { sliderId: 'family-ab-3', text: 'Kommunikation', leftLabel: 'Jag har sagt det', rightLabel: 'Jag har tänkt det men inte sagt det' },
    ],
  },
  {
    bareId: 'identity-shift',
    sliders: [
      { sliderId: 'identity-shift-1', text: 'Hur tryggt känns det att vara ärlig med din partner?', leftLabel: 'Osäkert', rightLabel: 'Helt tryggt' },
      { sliderId: 'identity-shift-2', text: 'Hur väl lyssnar ni på varandra?', leftLabel: 'Sällan', rightLabel: 'Alltid' },
    ],
  },
  {
    bareId: 'listening-presence',
    sliders: [
      { sliderId: 'listening-1', text: 'Energi', leftLabel: 'Jag återhämtar mig under dagen', rightLabel: 'Jag tär på reserver som inte fylls på' },
      { sliderId: 'listening-2', text: 'Kvällen', leftLabel: 'Kvällen är vår', rightLabel: 'Kvällen är en till uppgift' },
      { sliderId: 'listening-3', text: 'Gränser', leftLabel: 'Jag säger till innan jag är slut', rightLabel: 'Jag märker det först när det redan gått för långt' },
    ],
  },
  {
    bareId: 'conflict-repair',
    sliders: [
      { sliderId: 'conflict-1', text: 'Mina roller', leftLabel: 'Jag valde mina roller', rightLabel: 'Rollerna valde mig' },
      { sliderId: 'conflict-2', text: 'Trivsel', leftLabel: 'Jag trivs i dem', rightLabel: 'Jag saknar den jag var' },
      { sliderId: 'conflict-3', text: 'Förändring', leftLabel: 'Jag vill släppa en roll', rightLabel: 'Jag vågar inte släppa den' },
    ],
  },
  {
    bareId: 'expressing-needs',
    sliders: [
      { sliderId: 'expressing-1', text: 'Tillit', leftLabel: 'Jag litar på partnerns sätt', rightLabel: 'Jag tvivlar i tysthet' },
      { sliderId: 'expressing-2', text: 'Trygghet', leftLabel: 'Jag känner mig trygg som förälder', rightLabel: 'Jag känner mig bedömd' },
      { sliderId: 'expressing-3', text: 'Olikheter', leftLabel: 'Olikheterna berikar oss', rightLabel: 'Olikheterna gnager' },
    ],
  },
  {
    bareId: 'facing-adversity',
    sliders: [
      { sliderId: 'adversity-1', text: 'Hur hanterar du press?', leftLabel: 'Jag pratar om det', rightLabel: 'Jag håller det för mig själv' },
      { sliderId: 'adversity-2', text: 'Stöd från partner', leftLabel: 'Jag känner mig stöttad', rightLabel: 'Jag bär det själv' },
    ],
  },
  {
    bareId: 'behind-the-scenes',
    sliders: [
      { sliderId: 'behind-1', text: 'Enighet', leftLabel: 'Vi är eniga på riktigt', rightLabel: 'Vi spelar eniga' },
      { sliderId: 'behind-2', text: 'Stöd', leftLabel: 'Jag känner mig stöttad', rightLabel: 'Jag bär det ensam' },
      { sliderId: 'behind-3', text: 'Synlighet', leftLabel: 'Det jag bär syns', rightLabel: 'Det jag bär är osynligt' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  {
    bareId: 'thoughtful-space',
    sliders: [
      { sliderId: 'thoughtful-1', text: 'Behov', leftLabel: 'Jag behöver mer närhet', rightLabel: 'Jag behöver mer utrymme' },
      { sliderId: 'thoughtful-2', text: 'Förståelse', leftLabel: 'Du förstår vad jag behöver', rightLabel: 'Jag har slutat förklara' },
      { sliderId: 'thoughtful-3', text: 'Signaler', leftLabel: 'Jag visar vad jag behöver', rightLabel: 'Jag hoppas att du märker det' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  {
    bareId: 'self-esteem-wavering',
    sliders: [
      { sliderId: 'self-esteem-1', text: 'Öppenhet', leftLabel: 'Jag visar hur jag mår', rightLabel: 'Jag döljer det' },
      { sliderId: 'self-esteem-2', text: 'Självvärde', leftLabel: 'Jag vet vad jag är värd för oss', rightLabel: 'Jag har tappat känslan av att räcka till' },
      { sliderId: 'self-esteem-3', text: 'Sårbarhet', leftLabel: 'Det är lätt att vara sårbar', rightLabel: 'Det kostar att visa sårbarhet' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  {
    bareId: 'different-parenting-styles',
    sliders: [
      { sliderId: 'different-parenting-1', text: 'Mönster', leftLabel: 'Jag ser mina mönster', rightLabel: 'De styr utan att jag märker' },
      { sliderId: 'different-parenting-2', text: 'Historia', leftLabel: 'Min historia hjälper mig', rightLabel: 'Min historia stör' },
      { sliderId: 'different-parenting-3', text: 'Röster', leftLabel: 'Jag hör mina föräldrars röst och väljer annorlunda', rightLabel: 'Jag hör mina föräldrars röst och följer den' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  {
    bareId: 'parenting-boundaries',
    sliders: [
      { sliderId: 'boundaries-1', text: 'Gränser', leftLabel: 'Jag är trygg i mina gränser', rightLabel: 'Jag tvivlar varje gång' },
      { sliderId: 'boundaries-2', text: 'Tillsammans', leftLabel: 'Vi sätter gränser ihop', rightLabel: 'En av oss står ensam' },
      { sliderId: 'boundaries-3', text: 'När ni sätter gränser', leftLabel: 'Det handlar om barnet', rightLabel: 'Det handlar om oss' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  {
    bareId: 'parenting-exhaustion',
    sliders: [
      { sliderId: 'exhaustion-1', text: 'Integritet', leftLabel: 'Vi lever som vi tror', rightLabel: 'Vi lever inte som vi säger' },
      { sliderId: 'exhaustion-2', text: 'Enighet', leftLabel: 'Vi tycker likadant', rightLabel: 'Vi låtsas tycka likadant' },
      { sliderId: 'exhaustion-3', text: 'Kompromisser', leftLabel: 'Mina kompromisser är fria', rightLabel: 'Mina kompromisser kostar' },
    ],
    reflectionPrompt: 'Om du vill — en tanke med egna ord',
  },
  {
    bareId: 'our-traditions',
    sliders: [
      { sliderId: 'traditions-1', text: 'Plats', leftLabel: 'Mina traditioner har plats', rightLabel: 'Jag har anpassat mig' },
      { sliderId: 'traditions-2', text: 'Förståelse', leftLabel: 'Jag förstår varför det är viktigt', rightLabel: 'Jag följer med utan att förstå' },
      { sliderId: 'traditions-3', text: 'Motivation', leftLabel: 'Jag följer med av kärlek', rightLabel: 'Jag följer med av plikt' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  {
    bareId: 'when-life-tilts',
    sliders: [
      { sliderId: 'life-tilts-1', text: 'Mål', leftLabel: 'Mina mål har plats', rightLabel: 'Mina mål får vänta' },
      { sliderId: 'life-tilts-2', text: 'Stöd', leftLabel: 'Jag stöttar utan kostnad', rightLabel: 'Mitt stöd kostar mig' },
      { sliderId: 'life-tilts-3', text: 'Riktning', leftLabel: 'Vi bygger åt samma håll', rightLabel: 'Jag vet inte vart vi är på väg' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  {
    bareId: 'worth-spending-on',
    sliders: [
      { sliderId: 'spending-1', text: 'Önskningar', leftLabel: 'Jag säger vad jag vill', rightLabel: 'Jag håller tillbaka mina önskningar' },
      { sliderId: 'spending-2', text: 'Förståelse', leftLabel: 'Det jag värderar förstås', rightLabel: 'Jag har slutat förklara varför det är viktigt' },
      { sliderId: 'spending-3', text: 'Prioritering', leftLabel: 'Min prioritering räknas', rightLabel: 'Min prioritering ifrågasätts' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  {
    bareId: 'adrift',
    sliders: [
      { sliderId: 'adrift-1', text: 'Närhet', leftLabel: 'Vi söker varandra', rightLabel: 'Vi går förbi varandra' },
      { sliderId: 'adrift-2', text: 'Begär', leftLabel: 'Begäret finns där', rightLabel: 'Begäret har dragit sig undan' },
      { sliderId: 'adrift-3', text: 'Initiativ', leftLabel: 'Jag tar initiativ', rightLabel: 'Jag väntar på att du ska göra det' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
  {
    bareId: 'love-languages',
    sliders: [
      { sliderId: 'love-1', text: 'Att be', leftLabel: 'Jag ber om det jag behöver', rightLabel: 'Jag hoppas du ska gissa' },
      { sliderId: 'love-2', text: 'Att ta emot', leftLabel: 'Jag tar emot det du ger', rightLabel: 'Jag har svårt att ta emot' },
      { sliderId: 'love-3', text: 'Längtan', leftLabel: 'Min längtan får plats', rightLabel: 'Min längtan tystas' },
    ],
    reflectionPrompt: 'Beskriv känslan med ett par ord',
  },
];

/** Build CardSliderSet[] in CARD_SEQUENCE order, looking up sliders by bare id. */
const sliderPrompts: CardSliderSet[] = CARD_SEQUENCE.map((entry) => {
  const bare = bareIdFromSlug(entry.cardId);
  const raw = RAW.find((r) => r.bareId === bare);
  if (!raw) {
    // Fallback (shouldn't happen if RAW is in sync)
    return {
      cardIndex: entry.index,
      cardId: `card_${entry.index + 1}`,
      slug: entry.cardId,
      cardTitle: entry.title,
      layerName: '',
      sliders: [
        { sliderId: `${bare}-1`, text: 'Hur är det mellan er just nu?', leftLabel: 'Avstånd', rightLabel: 'Närhet' },
        { sliderId: `${bare}-2`, text: 'Hur mycket har ni pratat den här veckan?', leftLabel: 'Knappt', rightLabel: 'Mycket' },
      ],
    };
  }
  return {
    cardIndex: entry.index,
    cardId: `card_${entry.index + 1}`,
    slug: entry.cardId,
    cardTitle: entry.title,
    layerName: '',
    sliders: raw.sliders,
    reflectionPrompt: raw.reflectionPrompt,
  };
});

export function getSliderSet(cardIndex: number): CardSliderSet | undefined {
  return sliderPrompts.find((s) => s.cardIndex === cardIndex);
}

/** Look up a CardSliderSet by its frontend slug */
export function getSliderSetBySlug(slug: string): CardSliderSet | undefined {
  return sliderPrompts.find((s) => s.slug === slug);
}

export default sliderPrompts;
