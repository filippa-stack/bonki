import { Category, Card } from '@/types';

/** Bump this whenever categories or cards change in this file */
export const CONTENT_VERSION = 14;

export const categories: Category[] = [
  {
    id: 'emotional-intimacy',
    title: 'Ert minsta vi',
    entryLine: 'Bortom allt annat.',
    description: 'Identitet, tillhörighet och ert minsta vi',
    cardCount: 3,
  },
  {
    id: 'communication',
    title: 'Vardagen',
    entryLine: 'Det som sker mellan raderna.',
    description: 'Vardagens mönster och hur ni möter dem',
    cardCount: 4,
  },
  {
    id: 'category-8',
    title: 'Hur ni bär',
    entryLine: 'Även när det vore enklare att släppa.',
    description: 'Enighet, utrymme och sårbarhet',
    cardCount: 3,
  },
  {
    id: 'parenting-together',
    title: 'Det som skaver',
    entryLine: 'Vad olikheterna säger om er.',
    description: 'Uppfostran, gränser och värderingar',
    cardCount: 3,
  },
  {
    id: 'individual-needs',
    title: 'Arvet',
    entryLine: 'Arvet som formar ert hem.',
    description: 'Släkt, traditioner och förväntningar',
    cardCount: 1,
  },
  {
    id: 'category-9',
    title: 'Vad ni står för',
    entryLine: 'Riktning, värderingar, mod.',
    description: 'Värderingar under press och drömmar som kräver mod',
    cardCount: 2,
  },
  {
    id: 'category-6',
    title: 'Vad ni satsar på',
    entryLine: 'Gemensamma ramar och risker.',
    description: 'Risk, ekonomi och vad som är värt att satsa på',
    cardCount: 1,
  },
  {
    id: 'daily-life',
    title: 'Närhet',
    entryLine: 'Längtan och att hitta tillbaka.',
    description: 'Närhet, drift och att välja varandra i vardagen',
    cardCount: 2,
  },
  {
    id: 'category-10',
    title: 'Valet',
    entryLine: 'Det medvetna valet.',
    description: 'Det aktiva valet att stanna och bygga vidare',
    cardCount: 1,
  },
];

/**
 * Vårt Vi v3.1 cards. Card order in this array matches CARD_SEQUENCE
 * so `cards[seqEntry.index]` returns the right card for still-us-mock.ts.
 */
export const cards: Card[] = [
  // 0 — our-traditions (Grunden)
  {
    id: 'our-traditions',
    title: 'Vår uppväxt',
    subtitle: 'Mönstren vi ärvde – och de vi skapar idag',
    categoryId: 'individual-needs',
    sections: [{
      id: 'opening-our-traditions', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Hur tog sig kärleken uttryck i hemmet där du växte upp? Tänk inte på vad du fick höra, utan på vad du faktiskt såg.',
        'Vad lärde din uppväxtmiljö dig om hur man hanterar konflikter och försoning?',
        'Vilka beteenden från din barndom har du tagit med dig, och vilka har du valt att lämna bakom dig, när det gäller att visa kärlek som vuxen?',
        'Reflektera: Vilket invant mönster faller du in i när du är trött, sårad eller mitt i ett gräl? Har du funderat på varifrån det mönstret kommer?',
      ],
    }],
  },
  // 1 — identity-shift (Grunden)
  {
    id: 'identity-shift',
    title: 'Utvecklingen',
    subtitle: 'Hur vi formats sedan vi blev ett par',
    categoryId: 'emotional-intimacy',
    sections: [{
      id: 'opening-identity-shift', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vad har förändrats hos dig sedan vi möttes — på riktigt, inte bara på ytan?',
        'Vilka av mina förändringar tror du att jag inte själv har sett ännu?',
        'Hur har du själv hanterat att jag har förändrats — vad har du anpassat dig till, och vad har du burit tyst?',
        'Föreställ er: Om en av er fortsätter förändras i en riktning den andra inte kan följa — hur skulle ni märka det innan det var för sent?',
      ],
    }],
  },
  // 2 — listening-presence (Tillsammans)
  {
    id: 'listening-presence',
    title: 'Att bli sedd på riktigt',
    subtitle: 'Det jag längtar efter att du ser – och det du kanske missar',
    categoryId: 'communication',
    sections: [{
      id: 'opening-listening-presence', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'När kände du dig senast genuint sedd av mig?',
        'Vilken sida av dig upplever du att jag missar mest?',
        'Vad har du gjort för att verkligen bli sedd av mig, och finns det något du har gett upp om längs vägen?',
        'Föreställ er: Om en del av dig förblir osedd hos mig — hur tror du att det kommer att påverka er om fem år?',
      ],
    }],
  },
  // 3 — expressing-needs (Tillsammans)
  {
    id: 'expressing-needs',
    title: 'Det som förblir osagt',
    subtitle: 'Tystnadens innehåll – och priset vi betalar',
    categoryId: 'communication',
    sections: [{
      id: 'opening-expressing-needs', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Finns det någon sanning om dig själv som du aldrig har vågat dela med mig?',
        'Har det funnits stunder när du valt att vara tyst för att skydda mig — och vem skyddade egentligen den tystnaden?',
        'Hur mår du med det som du inte berättar — känns det lätt eller tynger det dig?',
        'Tänk om en av er bär på en tystnad under de kommande tio åren — hur skulle det påverka er relation?',
      ],
    }],
  },
  // 4 — behind-the-scenes (Grunden)
  {
    id: 'behind-the-scenes',
    title: 'Vänskapens betydelse',
    subtitle: 'Det som vänner ger – det relationen inte rymmer',
    categoryId: 'category-8',
    sections: [{
      id: 'opening-behind-the-scenes', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vad ger dina närmaste vänner dig som jag inte kan ge?',
        'När valde du senast en vän framför mig — och hur kändes det efteråt?',
        'Hur har du själv balanserat dina vänskaper mot vårt förhållande — och har den balansen förändrats med tiden?',
        'Föreställ dig: Om en av dina närmaste vänner och jag hamnade i konflikt — vems sida tror du att du skulle ta, och varför?',
      ],
    }],
  },
  // 5 — thoughtful-space (Grunden)
  {
    id: 'thoughtful-space',
    title: 'Rösterna utifrån',
    subtitle: 'Omvärldens blickar – hur påverkas vi av andras åsikter?',
    categoryId: 'category-8',
    sections: [{
      id: 'opening-thoughtful-space', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vems syn på vårt förhållande betyder mest för dig?',
        'Finns det någon i din närhet vars åsikt om oss du fortfarande bär med dig — på gott eller ont?',
        'Hur hanterar du det när någon ifrågasätter eller bekräftar oss — tar du till dig det eller stänger du ute det?',
        'Föreställ er: Om människor ni litar på började tvivla på er som par — skulle ni lyssna eller göra motstånd? Och vad skulle det kosta att välja det andra alternativet?',
      ],
    }],
  },
  // 6 — self-esteem-wavering (Grunden)
  {
    id: 'self-esteem-wavering',
    title: 'Det egna utrymmet',
    subtitle: 'Livet utanför oss – nödvändigheten av att få andas fritt',
    categoryId: 'category-8',
    sections: [{
      id: 'opening-self-esteem-wavering', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vilket rum utanför "oss" känns mest betydelsefullt för dig just nu?',
        'På vilket sätt berikar ditt eget utrymme vår relation — och när får det dig snarare att distansera dig?',
        'Vad har du gjort för att värna om ditt eget utrymme — och vad har du valt att avstå från för vår skull?',
        'Föreställ er: Om en av er helt förlorade sitt eget utrymme — vad skulle hända med "oss"?',
      ],
    }],
  },
  // 7 — smallest-we (Vardagen)
  {
    id: 'smallest-we',
    title: 'Det osynliga ansvaret',
    subtitle: 'Tankekraften och den mentala bördan',
    categoryId: 'emotional-intimacy',
    sections: [{
      id: 'opening-smallest-we', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vem av oss bär det osynliga ansvaret för vårt liv — och hur märker den andra av det?',
        'När du tar ansvar för oss, hur känns det i kroppen — som omtanke eller som en tyngd?',
        'Vad har du gjort med rollen du har hamnat i — har du accepterat den, kämpat emot den eller försökt prata om den?',
        'Föreställ er: Om den som planerar slutade planera under en månad — vad skulle hända med er då?',
      ],
    }],
  },
  // 8 — worth-spending-on (Vardagen)
  {
    id: 'worth-spending-on',
    title: 'Pengarnas symbolik',
    subtitle: 'Vad ekonomi betyder för oss – bortom kronor och ören',
    categoryId: 'category-6',
    sections: [{
      id: 'opening-worth-spending-on', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vad betyder pengar för dig — trygghet, frihet, kontroll, oberoende eller något helt annat?',
        'Hur tror du att du skulle förändras om du tjänade betydligt mer eller mindre än vad du gör i dag?',
        'Vad har din uppväxt lärt dig om pengar — och vad väljer du att göra annorlunda i dag?',
        'Föreställ er följande: Om en av er förlorade sin inkomst under ett års tid — hur skulle det påverka era roller och er ömsesidiga respekt?',
      ],
    }],
  },
  // 9 — facing-adversity (Tillsammans)
  {
    id: 'facing-adversity',
    title: 'Att bära och bli buren',
    subtitle: 'Omsorgens förutsättningar – balansen mellan närhet och tyngd',
    categoryId: 'communication',
    sections: [{
      id: 'opening-facing-adversity', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'När känner du dig genuint omhändertagen av mig?',
        'Finns det stunder då du upplever att du bär mig — eller att jag bär dig — på ett sätt som känns för tungt?',
        'När du själv har behövt mest stöd, hur har du hanterat det — har du vänt dig till mig, dragit dig undan eller hittat något annat sätt?',
        'Föreställ er: Om en av er drabbades av långvarig sjukdom eller psykisk ohälsa — hur skulle ni hantera det utan att den ena försvinner i omsorgstagandet och den andra bryts ner?',
      ],
    }],
  },
  // 10 — conflict-repair (Tillsammans)
  {
    id: 'conflict-repair',
    title: 'Den tysta muren',
    subtitle: 'Konflikternas reaktionsmönster – vad döljer sig bakom tystnaden?',
    categoryId: 'communication',
    sections: [{
      id: 'opening-conflict-repair', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vad händer i din kropp när en konflikt blir övermäktig?',
        'Vad behöver du av mig i sådana stunder — och vet jag det redan, eller har vi aldrig pratat om det på riktigt?',
        'Hur har du hanterat det när jag har dragit mig undan eller tystnat — vad har du gjort, och hur har det känts för dig?',
        'Föreställ er: Om en av er stängde av helt i flera dagar — hur skulle den andre kunna skilja på att ge utrymme och att bli övergiven?',
      ],
    }],
  },
  // 11 — adrift (Vardagen)
  {
    id: 'adrift',
    title: 'Begäret och avståndet',
    subtitle: 'När begäret möter vardagen – och allt som sker däremellan',
    categoryId: 'daily-life',
    sections: [{
      id: 'opening-adrift', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'När känner du dig genuint nära mig — utöver sex?',
        'Hur visar du begär — och hur skulle du vilja att jag besvarade det?',
        'Hur har du förhållit dig till ditt begär i vår relation — har du närat det, lagt det åt sidan eller väntat på att det ska uppstå av sig själv?',
        'Föreställ er: Om en av er hade betydligt mindre sexlust än den andra — hur skulle ni kunna vårda närheten utan att skapa press eller skuldkänslor?',
      ],
    }],
  },
  // 12 — love-languages (Vardagen)
  {
    id: 'love-languages',
    title: 'Den outtalade längtan',
    subtitle: 'Det vi suktar efter – men sällan vågar be om',
    categoryId: 'daily-life',
    sections: [{
      id: 'opening-love-languages', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vilken typ av närhet längtar du mest efter från mig just nu?',
        'Vad är svårast för dig att be mig om — och vad är du rädd ska hända om du uttryckte det rakt ut?',
        'Hur har du hanterat önskningar som du burit på men inte sagt högt — har du väntat, antytt eller gett upp hoppet om dem?',
        'Föreställ er: Om ni fortsatte att undvika vissa behov i tio år till — hur skulle de outtalade önskningarna forma er närhet då?',
      ],
    }],
  },
  // 13 — when-life-tilts (Tillsammans)
  {
    id: 'when-life-tilts',
    title: 'Vägen tillbaka',
    subtitle: 'Hur vi finner varandra igen – efter att ha orsakat varandra smärta',
    categoryId: 'category-9',
    sections: [{
      id: 'opening-when-life-tilts', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Tänk på varsitt tillfälle då ni sårade varandra. Inte nödvändigtvis det värsta, men en händelse du minns tydligt. Vad hände, och varför upplevde du det som sårande?',
        'Hur hanterades situationen — pratade ni ut om det, eller gick ni bara vidare?',
        'Vad krävs för att en spricka ska kännas läkt för din del?',
        'Föreställ er: Nästa gång ni sårar eller blir sårade av varandra — vad är det allra första du önskar att den andre gör?',
      ],
    }],
  },
  // 14 — family-ab (Riktningen)
  {
    id: 'family-ab',
    title: 'Uppmärksamhet åt annat håll',
    subtitle: 'Dragningen utåt – och var gränserna går',
    categoryId: 'emotional-intimacy',
    sections: [{
      id: 'opening-family-ab', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vad eller vem fångar din uppmärksamhet utanför vår relation — även när du inte vill att det ska ske?',
        'Var går din gräns mellan att bara lägga märke till någon och att faktiskt agera — och har vi någonsin diskuterat var den gränsen går?',
        'Hur har du själv hanterat dragning till andra under tiden vi varit tillsammans — har du låtit känslan passera, ältat den eller burit den i tysthet?',
        'Föreställ er: Om någon av er kände en dragning till en annan person — skulle det att prata öppet om det föra er närmare, eller skulle det kännas som ett hot?',
      ],
    }],
  },
  // 15 — parenting-boundaries (Riktningen)
  {
    id: 'parenting-boundaries',
    title: 'De röda linjerna',
    subtitle: 'Det icke-förhandlingsbara – och det som aldrig sagts',
    categoryId: 'parenting-together',
    sections: [{
      id: 'opening-parenting-boundaries', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vilka beteenden är absolut oacceptabla för dig i en relation?',
        'Vilka av mina gränser anser du dig ha lärt dig tolka, trots att jag aldrig uttryckt dem explicit?',
        'Vad har du förlåtit tidigare som du trodde var omöjligt — och finns det något du idag vet med säkerhet att du aldrig skulle kunna förlåta?',
        'Föreställ er: Om en av er överskred en absolut gräns hos den andre — finns det en väg tillbaka, och vad skulle krävas för att den vägen skulle vara möjlig?',
      ],
    }],
  },
  // 16 — different-parenting-styles (Riktningen)
  {
    id: 'different-parenting-styles',
    title: 'Frågan om barn',
    subtitle: 'Förväntningar på föräldraskap – och det vi inte vågat uttala',
    categoryId: 'parenting-together',
    sections: [{
      id: 'opening-different-parenting-styles', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Hur har din barndom påverkat din bild av att vara förälder — eller att välja att inte vara det?',
        'Vilken roll spelar barn i din vision av vår framtid, och hur har den bilden förändrats sedan vi träffades?',
        'Finns det något gällande frågan om barn som du har burit på, men inte vågat säga rakt ut till mig?',
        'Föreställ er: Om en av er ville ha barn (eller fler barn) och den andre inte ville — hur skulle ni navigera mellan ett ja och ett nej i en och samma kärlek?',
      ],
    }],
  },
  // 17 — parenting-exhaustion (Riktningen)
  {
    id: 'parenting-exhaustion',
    title: 'Drömmens pris',
    subtitle: 'Det vi bär på – och vad det kostar att förverkliga våra mål',
    categoryId: 'parenting-together',
    sections: [{
      id: 'opening-parenting-exhaustion', type: 'opening', title: 'Frågor', content: '',
      prompts: [
        'Vilken av dina drömmar är icke-förhandlingsbar — det där som måste få finnas i ditt liv för att det ska kännas som ditt eget?',
        'Vilken av mina drömmar är du rädd att jag ska förlora — för min skull, snarare än din?',
        'Vad har du redan offrat av dina egna drömmar för vår skull, och har det varit värt det?',
        'Tänk er följande: Om en av er var tvungen att ge upp en dröm för att skapa stabilitet — hur skulle ni avgöra vems dröm som fick prioriteras, och hur skulle ni hantera konsekvenserna av det beslutet?',
      ],
    }],
  },
];

export function getCardsByCategory(categoryId: string): Card[] {
  return cards.filter((card) => card.categoryId === categoryId);
}

export function getCardById(cardId: string): Card | undefined {
  return cards.find((card) => card.id === cardId);
}

export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find((cat) => cat.id === categoryId);
}
