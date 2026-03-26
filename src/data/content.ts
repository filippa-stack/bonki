import { Category, Card } from '@/types';

/** Bump this whenever categories or cards change in this file */
export const CONTENT_VERSION = 11;

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
    title: 'Vardagen mellan er',
    entryLine: 'Det som sker mellan raderna.',
    description: 'Vardagens mönster och hur ni möter dem',
    cardCount: 4,
  },
  {
    id: 'category-8',
    title: 'Hur ni bär varandra',
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
    title: 'Arvet ni delar',
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
    title: 'Nära varandra',
    entryLine: 'Längtan och att hitta tillbaka.',
    description: 'Närhet, drift och att välja varandra i vardagen',
    cardCount: 2,
  },
  {
    id: 'category-10',
    title: 'Att välja varandra',
    entryLine: 'Det medvetna valet.',
    description: 'Det aktiva valet att stanna och bygga vidare',
    cardCount: 1,
  },
];

export const cards: Card[] = [
  // ── Card 0 · Grunden ──────────────────────────────────
  {
    id: 'smallest-we',
    title: 'Ert minsta "vi"',
    subtitle: 'Det minsta ni kan göra för att hålla ihop i vardagen',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-smallest-we',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad är det som gör att ni känner er som ett par — bortom det praktiska ni delar?',
          'Vad har ni börjat göra tillsammans det senaste året — om än något litet — som ni inte riktigt planerade?',
          'Förändras du mot din partner när ni inte haft tid för varandra — och i så fall, hur?',
          'Om något litet mellan er tyst försvann, vad tror du att du skulle märka först?',
        ],
      },
    ],
  },
  // ── Card 1 · Grunden ──────────────────────────────────
  {
    id: 'family-ab',
    title: 'När ert "vi" blir "Familjen AB"',
    subtitle: 'Logistik som ersätter kontakt',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-family-ab',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'När ni väl sitter ner och pratar — hur snabbt hamnar ni i det praktiska?',
          'Finns det en stämning ni brukar ha — eller brukade ha — mellan er, som du saknar när vardagen tar över?',
          'Vad är skillnaden för dig mellan att vara på samma ställe och att faktiskt vara med varandra?',
          'Ni löser vardagen smidigt. Allt fungerar. Men samtalen handlar nästan bara om tider, ansvar och barn. Ingen längtar — men ingen klagar heller.\n\nVar går gränsen för när en relation som fungerar bra på det praktiska planet börjar kännas som att den går på tomgång?',
        ],
      },
    ],
  },
  // ── Card 2 · Grunden ──────────────────────────────────
  {
    id: 'identity-shift',
    title: 'Identitetsskiftet',
    subtitle: 'Anpassning som förändrar vem ni får vara',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-identity-shift',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vilken del av dig tar mindre plats sedan du blev förälder - något du brukade göra, tänka på eller vara?',
          'Finns det något du anpassat dig till som faktiskt fungerar för dig?',
          'Hur vet du när anpassningen till vardagen börjar kännas som att du ger upp något?',
          'En av er håller tillbaka behov för att vardagen ska fungera.\n\nNär du tänker på hur du förändrats sedan ni fick barn — vilka förändringar känns som dina egna val, och vilka hände bara med dig?',
        ],
      },
    ],
  },
  // ── Card 3 · Normen ───────────────────────────────────
  {
    id: 'listening-presence',
    title: 'När dagen är slut',
    subtitle: 'Ansvar för hem och hushåll, återhämtning',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-listening-presence',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad behöver hända — eller sägas — innan du faktiskt kan sluta tänka på dagen?',
          'Vad gör ni med tiden mellan barnens läggning och er egen — och hur bestäms det?',
          'Är det något du fortsätter att göra på kvällarna som egentligen inte behöver göras — men som känns fel att sluta med?',
          'Efter läggning gör ni olika saker. En fortsätter "lite till", den andra sätter sig. Ingen säger något, men båda drar egna slutsatser.\n\nHur signalerar du att kvällen är slut för dig — utan att säga det rakt ut?',
        ],
      },
    ],
  },
  // ── Card 4 · Normen ───────────────────────────────────
  {
    id: 'conflict-repair',
    title: 'Rollerna ni tar (och får)',
    subtitle: 'Roller som uppstår utan att ni valt dem',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-conflict-repair',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vilken roll hemma skulle du vilja ha mer utrymme för?',
          'Vilka roller hemma har du hamnat i — utan att egentligen ha bestämt dig för dem?',
          'Är det någon roll du har hemma som känns meningsfull — men som du också ibland känner att du sitter fast i?',
          'En uppgift har blivit "din". Den andra kliver undan. Med tiden blir ansvaret ditt.\n\nNär en uppgift hemma har varit din tillräckligt länge — vad gör det med dig? Vad skulle förändras mellan er om du släppte den?',
        ],
      },
    ],
  },
  // ── Card 5 · Normen ───────────────────────────────────
  {
    id: 'expressing-needs',
    title: 'Mitt sätt, ditt sätt',
    subtitle: 'Olika sätt att vara förälder',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-expressing-needs',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'I vilka situationer känner du dig mest trygg i ditt sätt att vara förälder?',
          'Tänk på ett tillfälle nyligen när ni hanterade något med barnen på väldigt olika sätt — hur kändes det för dig i stunden?',
          'Har du märkt att du ibland förklarar dig mer än du ville — som om du behövde rättfärdiga ditt sätt att göra saker?',
          'Ni gör samma saker, men på olika sätt. Barnet märker och kommenterar skillnaderna.\n\nNär barnet märker att ni gör saker på olika sätt — vad tror du det lär sig om er?',
        ],
      },
    ],
  },
  // ── Card 6 · Normen ───────────────────────────────────
  {
    id: 'facing-adversity',
    title: 'Att möta motgångar',
    subtitle: 'Olika sätt att hantera press',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-facing-adversity',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'När något känns svårt — vilken brukar vara din första reaktion, nästan utan att tänka?',
          'När du är i något svårt, hur stöttar din partner dig - som faktiskt gör skillnad för dig?',
          'Vad är det du behöver att din partner förstår om dig — som du inte brukar säga rakt ut — när du har det svårt?',
          'Ni möter en svår period. En vill planera och agera, den andra behöver pausa och reflektera.\n\nVad händer mellan er i glappet — innan ni hittat ett gemensamt sätt att hantera det?',
        ],
      },
    ],
  },
  // ── Card 7 · Normen ───────────────────────────────────
  {
    id: 'behind-the-scenes',
    title: 'Framför och bakom kulisserna',
    subtitle: 'Enighet, reparation och ansvar',
    categoryId: 'category-8',
    sections: [
      {
        id: 'opening-behind-the-scenes',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad brukar vara det första tecknet på att ni är okej igen — efter att något gått snett mellan er?',
          'Vad gör det svårare för dig att ta första steget tillbaka — efter en dålig stund?',
          'Vad är skillnaden för er mellan att låta något passera — och att faktiskt göra upp?',
          'Efter en jobbig kväll tappar en av er tålamodet inför barnet. Den andra reagerar på det, men ni tar inte diskussionen där och då.\n\nNär en av er tappat tålamodet inför barnet — vad händer mellan er efteråt?',
        ],
      },
    ],
  },
  // ── Card 8 · Normen ───────────────────────────────────
  {
    id: 'thoughtful-space',
    title: 'Omtänksamt utrymme',
    subtitle: 'Att ge och ta utrymme utan att skapa avstånd',
    categoryId: 'category-8',
    sections: [
      {
        id: 'opening-thoughtful-space',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad är det första du märker i dig — precis innan du är helt slut och behöver utrymme?',
          'Vad vill du egentligen ha från din partner när du drar dig undan — även om du inte säger det?',
          'Är det skillnad för dig mellan att få utrymme för att din partner respekterar att du behöver det — och att bli lämnad ensam?',
          'En drar sig undan för att orka, den andra känner sig övergiven. Båda försöker skydda relationen.\n\nNär börjar utrymmet ni ger varandra bli ett avstånd — istället för en omsorg?',
        ],
      },
    ],
  },
  // ── Card 9 · Konflikten ───────────────────────────────
  {
    id: 'self-esteem-wavering',
    title: 'När självkänslan svajar',
    subtitle: 'Sårbarhet och förändrade roller',
    categoryId: 'category-8',
    sections: [
      {
        id: 'opening-self-esteem-wavering',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur märker du själv om ditt självförtroende skulle börja svikta — vad är det första som förändras?',
          'När en av er går igenom en svårare period med självförtroendet — vad händer då mellan er?',
          'Vad slutar du be om — eller ta plats med — när du inte känner dig trygg i dig själv?',
          'En av er tar mindre plats än vanligt. Det sägs inte rakt ut, men det märks.\n\nVad behöver du från din partner i de perioderna — som du kanske inte ber om?',
        ],
      },
    ],
  },
  // ── Card 10 · Konflikten ──────────────────────────────
  {
    id: 'different-parenting-styles',
    title: 'Uppfostran ni ärvt',
    subtitle: 'Reaktioner formade av uppväxt',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-different-parenting-styles',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad från din egen uppväxt är du mest säker på att du vill föra vidare?',
          'Har du någonsin reagerat på något med barnet och direkt tänkt - just så här skulle mina föräldrar ha gjort?',
          'Kan du skilja på om du reagerar på det som faktiskt händer — eller på något det påminner dig om?',
          'En vardagssituation väcker starka reaktioner. Den ena reagerar på händelsen, den andra på känslan som väcks.\n\nHur pratar ni om en situation där ni reagerat helt olika — utan att det blir en fråga om vem som hade rätt?',
        ],
      },
    ],
  },
  // ── Card 11 · Konflikten ──────────────────────────────
  {
    id: 'parenting-boundaries',
    title: 'Att säga ifrån',
    subtitle: 'Gränser, starka reaktioner och samspel',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-parenting-boundaries',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Efter att du satt en gräns med barnen — hur vet du om det landade rätt?',
          'Vad är det barnen gör som väcker den starkaste reaktionen i dig — den som ibland till och med överraskar dig själv?',
          'Vad händer mellan er när ni inte är överens om hur hårt eller mjukt en gräns ska sättas?',
          'Ett beteende väcker olika impulser. Den ena vill agera direkt, den andra vill avvakta.\n\nVad tror du att din partner försöker skydda - i de stunderna där ni agerar olika snabbt?',
        ],
      },
    ],
  },
  // ── Card 12 · Konflikten ──────────────────────────────
  {
    id: 'parenting-exhaustion',
    title: 'Mina, dina, era värderingar',
    subtitle: 'Värderingar i vardagliga val',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-parenting-exhaustion',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad hoppas du att barnen lär sig av att se hur ni är mot varandra?',
          'Vilken värdering är viktigast för dig i teorin — men svårast att faktiskt följa hemma?',
          'Gör er relation det lättare eller svårare att leva som du egentligen vill?',
          'Barnet beter sig respektlöst. En markerar direkt mot barnet. Den andra reagerar mer på hur gränsen sätts: ton, ordval eller situation.\n\nNär ni reagerar olika i ett spänt ögonblick med barnet - vad försökte du skydda?',
        ],
      },
    ],
  },
  // ── Card 13 · Längtan ─────────────────────────────────
  {
    id: 'our-traditions',
    title: 'Mina, dina, era traditioner',
    subtitle: 'Tillhörighet och vad ni väljer att föra vidare',
    categoryId: 'individual-needs',
    sections: [
      {
        id: 'opening-our-traditions',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Finns det något ni gör nu som familj, som började i en av era uppväxter - men som nu känns som ert eget?',
          'Har ni skapat något tillsammans - en vana, ett sätt att fira, ett återkommande ögonblick — som inte fanns i någon av era familjer innan?',
          'Vilka förväntningar på hur ett hem ska fungera har ni ärvt var för sig — men aldrig riktigt pratat igenom som era gemensamma?',
          'Barnet frågar varför ni gör saker på ett visst sätt. Ni märker att svaret inte är "för att vi valt det" — utan "för att det alltid varit så".\nVad vill ni att svaret ska vara - när barnet frågar varför er familj gör som ni gör?',
        ],
      },
    ],
  },
  // ── Card 14 · Längtan ─────────────────────────────────
  {
    id: 'our-philosophy',
    title: 'Er filosofi',
    subtitle: 'Värderingar under press',
    categoryId: 'category-9',
    sections: [
      {
        id: 'opening-our-philosophy',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Finns det något ni hanterade tillsammans nyligen där du efteråt tänkte — ja, det där var vi, som vi vill vara?',
          'Vilken av dina värderingar är du mest benägen att låta glida när vardagen pressar?',
          'Är det viktigare för er att vara konsekventa eller att kunna anpassa er?',
          'Vardagen har pressat er länge. Ni märker att ni börjat ta genvägar - i tonen mot varandra, i tålamodet, i det ni tidigare aldrig hade accepterat. Ingen av er valde det. Det bara hände.\n— Hur tar ni er tillbaka till det ni egentligen vill stå för när ni märker att ni glidit?',
        ],
      },
    ],
  },
  // ── Card 15 · Längtan ─────────────────────────────────
  {
    id: 'when-life-tilts',
    title: 'När livet lutar',
    subtitle: 'Att ge varandra utrymme',
    categoryId: 'category-9',
    sections: [
      {
        id: 'opening-when-life-tilts',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Finns det något du drömmer om för egen del — som skulle förändra er vardag?',
          'Hur känns det att stötta din partners dröm — när det kostar dig något?',
          'När börjar stödet till din partner kosta mer än du klarar av?',
          'En av er vill satsa helhjärtat på något som under en tid tar mycket energi. Den andra stöttar, men oroar sig för balansen.\n\nVad behöver finnas på plats mellan er för att den perioden ska stärka relationen — istället för att tära på den?',
        ],
      },
    ],
  },
  // ── Card 16 · Längtan ─────────────────────────────────
  {
    id: 'worth-spending-on',
    title: 'Värt att spendera på',
    subtitle: 'Vad som känns värdefullt att investera i; tid, energi, pengar',
    categoryId: 'category-6',
    sections: [
      {
        id: 'opening-worth-spending-on',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad saknade du som barn som du nu vill ge dina egna barn?',
          'Vad skulle ni vilja investera i som familj — som verkligen känns värt det?',
          'Tänk på en satsning ni gjort som familj som kändes rätt — och en som i efterhand inte var värd det. Vad skilde dem åt?',
          'Ni står inför en investering som kräver tid, pengar eller energi. Ni märker att ni har olika bilder av vad som är "värt det."\n\nNär ni inte är överens om en prioritering — vad behöver var och en av er veta för att kunna mötas? Trygghet, mening, eller något annat.',
        ],
      },
    ],
  },
  // ── Card 17 · Valet ───────────────────────────────────
  {
    id: 'adrift',
    title: 'På drift',
    subtitle: 'När relationen långsamt ändrar riktning',
    categoryId: 'daily-life',
    sections: [
      {
        id: 'opening-adrift',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Har det hänt att ni varit tillsammans men du ändå känt dig ensam — och vad tror du det berodde på?',
          'Vad är det första du brukar göra när du märker att avståndet mellan er har växt — säger du något, eller väntar du?',
          'Växer distansen mellan er mer efter bråk — eller tyst, under perioder när ingenting är fel?',
          'Ni bråkar sällan. Men ni skrattar inte heller som förr. Närhet skjuts upp till "sen".\n\nHur avgör ni om ni bara går igenom en tyst period — eller om något faktiskt håller på att förändras mellan er?',
        ],
      },
    ],
  },
  // ── Card 18 · Valet ───────────────────────────────────
  {
    id: 'love-languages',
    title: 'Att nå fram',
    subtitle: 'Närhet och att nå fram till varandra',
    categoryId: 'daily-life',
    sections: [
      {
        id: 'opening-love-languages',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur visar du att du vill vara nära — och tror du att din partner läser det rätt?',
          'Vilken liten sak gör din partner — eller skulle kunna göra — som får dig att känna dig genuint omhändertagen?',
          'Vad gör din partner som du ibland misstolkar — som egentligen är deras sätt att söka närhet?',
          'Trötthet och längtan krockar. Den ena vill vara nära, den andra orkar inte. Trots goda intentioner smyger sig både press och tolkningar in.\n\nVad händer mellan er när "jag vill" möter "jag orkar inte"?',
        ],
      },
    ],
  },
  // ── Card 19 · Valet ───────────────────────────────────
  {
    id: 'choosing-to-stay',
    title: 'Att fortsätta välja',
    subtitle: 'Att aktivt prioritera relationen',
    categoryId: 'category-10',
    sections: [
      {
        id: 'opening-choosing-to-stay',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad fick dig att välja din partner från början — och vad är det som får dig att välja igen idag?',
          'Vad har förändrats i hur du ser på er relation sedan ni började med de här samtalen?',
          'Hur ser det ut att välja relationen när det inte finns någon kris — utan att något tvingar fram ett val?',
          'Relationen fungerar. Inget är trasigt. Men ibland finns en tyst insikt: att man kan lämna — även utan konflikt.\n\nVad gör den insikten med er — är det den som gör valet verkligt, eller är den skrämmande?',
        ],
      },
    ],
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
