import { Category, Card } from '@/types';

/** Bump this whenever categories or cards change in this file */
export const CONTENT_VERSION = 8;

export const categories: Category[] = [
  {
    id: 'emotional-intimacy',
    title: 'Ni i er',
    entryLine: 'Vem är ni för varandra — bortom allt annat?',
    description: 'Identitet, tillhörighet och ert minsta vi',
    cardCount: 3,
  },
  {
    id: 'communication',
    title: 'Vardagen mellan er',
    entryLine: 'Roller, ansvar och det som sker mellan raderna.',
    description: 'Vardagens mönster och hur ni möter dem',
    cardCount: 4,
  },
  {
    id: 'category-8',
    title: 'Att hålla kvar varandra',
    entryLine: 'Att stanna kvar — även när det vore enklare att släppa.',
    description: 'Enighet, utrymme och sårbarhet',
    cardCount: 3,
  },
  {
    id: 'parenting-together',
    title: 'När ni tycker olika',
    entryLine: 'Olikheter som skaver — och vad de säger om er.',
    description: 'Uppfostran, gränser och värderingar',
    cardCount: 3,
  },
  {
    id: 'individual-needs',
    title: 'Det ni bär med er',
    entryLine: 'Det ni ärvt — och hur det formar ert hem.',
    description: 'Släkt, traditioner och förväntningar',
    cardCount: 2,
  },
  {
    id: 'category-9',
    title: 'Dit ni är på väg',
    entryLine: 'Vad ni står för — och vart ni är på väg.',
    description: 'Värderingar under press och drömmar som kräver mod',
    cardCount: 2,
  },
  {
    id: 'category-6',
    title: 'Trygghet & mod',
    entryLine: 'Mod, trygghet och gemensamma ramar.',
    description: 'Risk, ekonomi och vad som är värt att satsa på',
    cardCount: 2,
  },
  {
    id: 'daily-life',
    title: 'Nära varandra',
    entryLine: 'Avstånd, längtan och att hitta tillbaka.',
    description: 'Närhet, drift och att välja varandra i vardagen',
    cardCount: 2,
  },
  {
    id: 'category-10',
    title: 'Att välja varandra',
    entryLine: 'Att fortsätta välja varandra — med öppna ögon.',
    description: 'Det aktiva valet att stanna och bygga vidare',
    cardCount: 1,
  },
];

export const cards: Card[] = [
  // ── Layer 1: Vi i oss ──────────────────────────────────
  {
    id: 'smallest-we',
    title: 'Ert minsta "vi"',
    subtitle: 'Det minsta ni kan göra för att hålla ihop i vardagen',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-7a',
        type: 'opening',
        title: 'Början',
        content: 'Små saker som håller er nära.',
        prompts: [
          'Om något litet mellan er tyst försvann, vad tror du att du skulle märka först?',
          'Vad är det som gör att ni känner er som ett par — bortom det praktiska ni delar?',
          'Vad har ni börjat göra tillsammans det senaste året — om än något litet — som ni inte riktigt planerade?',
        ],
      },
      {
        id: 'reflective-7a',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Stanna upp och känn efter.',
        prompts: [
          'Vad händer inuti dig när du märker att ni sakta glider isär — inte för att något hänt, utan för att livet bara rör sig i var sin riktning?',
          'Vad märker du händer i dig när utrymmet för er som par krymper?',
        ],
      },
      {
        id: 'scenario-7a',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Allt fungerar. Men något som tidigare var självklart har blivit tyst.',
        prompts: [
          'Vilka är de tidiga tecknen, för dig, på att ni börjar glida isär — innan det är uppenbart?',
        ],
      },
      {
        id: 'exercise-7a',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Välj en mycket liten handling eller aktivitet ni gör tillsammans tre gånger kommande vecka.',
        prompts: [
          'Se det som ett test, inte en lösning.',
        ],
      },
    ],
  },
  {
    id: 'family-ab',
    title: 'När ert "vi" blir "Familjen AB"',
    subtitle: 'Logistik som ersätter kontakt',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-10',
        type: 'opening',
        title: 'Början',
        content: 'När samarbete tar över känslan.',
        prompts: [
          'Hur ofta hamnar era samtal i det praktiska — och vad händer med allt det andra?',
          'Finns det ett läge ni brukar ha tillsammans — eller brukade ha — som du saknar när vardagen tar över?',
          'Vad gör det med dig att göra allt rätt — och ändå inte bli sedd för det?',
        ],
      },
      {
        id: 'reflective-10',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan effektivitet och avstånd.',
        prompts: [
          'Kan ett parförhållande fungera så bra på det praktiska planet att känslor tyst slutar få utrymme?',
          'Vad är skillnaden för dig mellan att vara på samma ställe och att faktiskt vara med varandra?',
        ],
      },
      {
        id: 'scenario-10',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni löser vardagen smidigt. Allt fungerar. Men samtalen handlar nästan bara om tider, ansvar och barn. Ingen längtar — men ingen klagar heller.',
        prompts: [
          'Var går gränsen för när en relation som "fungerar bra" börjar kännas som att den går på tomgång?',
        ],
      },
      {
        id: 'exercise-10',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Avsätt tio minuter en gång den här veckan där ni inte pratar om barn eller logistik.',
        prompts: [
          'Om ni inte har något att säga — sitt kvar ändå.',
        ],
      },
    ],
  },
  {
    id: 'identity-shift',
    title: 'Identitetsskiftet',
    subtitle: 'Anpassning som förändrar vem ni får vara',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-8a',
        type: 'opening',
        title: 'Början',
        content: 'Vem har du blivit — och vem saknar du?',
        prompts: [
          'Vad har hamnat i bakgrunden sedan du blev förälder — något du brukade göra, tänka på, eller vara?',
          'Vad har du slutat göra eller säga för att det inte längre verkar passa in i livet du har nu?',
          'Vad har du anpassat dig till sedan ni fick barn — något som till en början inte var ditt val, men som du nu faktiskt gjort till ditt eget?',
        ],
      },
      {
        id: 'reflective-8a',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad anpassningen kostar.',
        prompts: [
          'Hur vet du när anpassningen till vardagen börjar kännas som att du ger upp något?',
          'Är det lättare eller svårare att hålla kvar vem du är utanför föräldraskapet — beroende på hur det är mellan er?',
        ],
      },
      {
        id: 'scenario-8a',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En av er håller tillbaka behov för att vardagen ska fungera.',
        prompts: [
          'När du tänker på hur du förändrats sedan ni fick barn — vilka förändringar känns som dina egna val, och vilka hände bara med dig?',
        ],
      },
      {
        id: 'exercise-8a',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Identifiera en sak vardera som ni idag håller tillbaka.',
        prompts: [
          'Prata om vad som skulle krävas för att ni skulle kunna ge den lite mer plats.',
        ],
      },
    ],
  },
  // ── Layer 2: Vardagen mellan oss ───────────────────────
  {
    id: 'listening-presence',
    title: 'När dagen är slut',
    subtitle: 'Ansvar för hem och hushåll, återhämtning',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-1',
        type: 'opening',
        title: 'Början',
        content: 'De här frågorna öppnar samtalet varsamt. Det finns inga rätta svar — bara er ärliga upplevelse.',
        prompts: [
          'Vad behöver hända — eller sägas — innan du faktiskt kan sluta tänka på dagen?',
          'Finns det ett ögonblick på kvällen när du faktiskt känner att dagen är klar — eller är det mer att den bara ebbar ut?',
          'Vad brukar hålla igång tankarna på natten, även när du vill släppa taget?',
        ],
      },
      {
        id: 'reflective-1',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Ta er tid med de här. Ni kanske vill sitta med dem en stund innan ni pratar.',
        prompts: [
          'Är det något du fortsätter att göra på kvällarna som egentligen inte behöver göras — men som känns fel att sluta med?',
          'Tänk dig att du fortsätter med kvällssysslor och din partner redan har satt sig — hur tror du det ser ut från deras håll?',
        ],
      },
      {
        id: 'scenario-1',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Efter läggning gör ni olika saker. En fortsätter "lite till", den andra sätter sig. Ingen säger något, men båda drar egna slutsatser.',
        prompts: [
          'Vad gör ni vardera — utan att säga det rakt ut — när ni känner att kvällen är slut för er, men din partner inte verkar märka det?',
        ],
      },
      {
        id: 'exercise-1',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Välj en konkret handling eller mening som markerar att dagen är avslutad för er båda.',
        prompts: [
          'Prova i tre kvällar — och prata sedan om vad det förändrade.',
        ],
      },
    ],
  },
  {
    id: 'conflict-repair',
    title: 'Rollerna ni tar (och får)',
    subtitle: 'Roller som uppstår utan att ni valt dem',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-3',
        type: 'opening',
        title: 'Början',
        content: 'Roller formas ofta utan att ni väljer dem.',
        prompts: [
          'Vilka roller hemma har du hamnat i utan att egentligen ha bestämt dig för dem — de uppstod liksom av sig självt?',
          'Hur märker du att en uppgift hemma har blivit din — utan att du egentligen valde den?',
          'Vilken roll i familjen skulle du vilja ha mer utrymme för — något du skulle vilja göra mer av, eller ta mer plats i?',
        ],
      },
      {
        id: 'reflective-3',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'De här frågorna utforskar mönster och historia.',
        prompts: [
          'Är det någon roll du har hemma som känns meningsfull — men som du också ibland känner att du sitter fast i?',
          'När en av er blir den självklara experten på något hemma — vad gör det med den andras roll?',
        ],
      },
      {
        id: 'scenario-3',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En uppgift har blivit "din". Den andra kliver undan. Med tiden blir skillnaden självklar.',
        prompts: [
          'När en uppgift hemma har "tillhört" dig tillräckligt länge — börjar det kännas som att ingen annan kan ta den? Vad gör det med dig?',
        ],
      },
      {
        id: 'exercise-3',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Välj en etablerad roll att dela eller byta under en period.',
        prompts: [
          'Prata om vad som känns ovant — utan att rätta varandra.',
        ],
      },
    ],
  },
  {
    id: 'expressing-needs',
    title: 'Mitt sätt, ditt sätt',
    subtitle: 'Olika sätt att vara förälder',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-2',
        type: 'opening',
        title: 'Början',
        content: 'Börja där det känns naturligt.',
        prompts: [
          'I vilka situationer känner du dig mest trygg med ditt sätt att göra saker med barnen — och när känns det som att det ifrågasätts?',
          'Hur vet du i stunden att du gör rätt sak med barnen — utan att behöva stämma av med någon?',
          'Tänk på ett tillfälle nyligen när ni hanterade något med barnen på väldigt olika sätt — hur kändes det för dig i stunden?',
        ],
      },
      {
        id: 'reflective-2',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'De här frågorna bjuder in till att titta inåt.',
        prompts: [
          'Tänk på ett tillfälle nyligen när du märkte att du förklarade dig mer än du ville — som om du behövde rättfärdiga ditt sätt att göra saker. Känner du igen det?',
          'Händer det att din partners sätt att hantera saker får dig att tvivla på dina egna instinkter?',
        ],
      },
      {
        id: 'scenario-2',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni gör samma saker, men på olika sätt. Barnet börjar navigera mellan er.',
        prompts: [
          'När barnen märker att ni gör saker på olika sätt — vad tror du händer mellan er, och vad tror du det lär dem?',
        ],
      },
      {
        id: 'exercise-2',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Välj ett område där ni medvetet låter två sätt samexistera.',
        prompts: [
          'Prata om vad ni vill att barnet ska förstå — inte om vem som gör rätt.',
        ],
      },
    ],
  },
  {
    id: 'facing-adversity',
    title: 'Att möta motgångar',
    subtitle: 'Olika sätt att hantera press',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-16',
        type: 'opening',
        title: 'Början',
        content: 'Motgångar visar hur ni fungerar ihop.',
        prompts: [
          'När det är svårt — vad brukar du göra? Vill du prata om det, ta tag i det praktiska, eller behöver du utrymme först?',
          'Vad gör faktiskt skillnad — från din partners sida — när du är mitt i något svårt?',
          'Hur syns det mellan er att ni hanterar stress på helt olika sätt?',
        ],
      },
      {
        id: 'reflective-16',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska era olika strategier.',
        prompts: [
          'Innan ni ens hunnit prata om det som är svårt — hur börjar era olika sätt att hantera stress visa sig?',
          'Behöver du din partner nära dig när du kämpar — eller fungerar ni bättre med lite avstånd innan ni kan mötas igen?',
        ],
      },
      {
        id: 'scenario-16',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni möter en svår period. En vill planera och agera, den andra behöver pausa och reflektera.',
        prompts: [
          'Hur hanterar ni det när era sätt att ta er igenom svårigheter är väldigt olika?',
        ],
      },
      {
        id: 'exercise-16',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Tänk ut hur en vecka kan se ut där båda era sätt får plats — utan att det ena blir norm och det andra undantag.',
      },
    ],
  },
  // ── Layer 3: Att hålla kvar varandra ───────────────────
  {
    id: 'behind-the-scenes',
    title: 'Framför och bakom kulisserna',
    subtitle: 'Enighet, reparation och ansvar',
    categoryId: 'category-8',
    sections: [
      {
        id: 'opening-17',
        type: 'opening',
        title: 'Början',
        content: 'Att vara på samma sida — vad innebär det egentligen?',
        prompts: [
          'Vad gör din partner — konkret — som får dig att känna att du inte behöver bära föräldraskapet ensam?',
          'Vilken typ av situation brukar visa tydligast att ni uppfattar saker på olika sätt?',
          'Efter ett ögonblick där ni hanterade något på olika sätt inför barnen — vad behöver du efteråt?',
        ],
      },
      {
        id: 'reflective-17',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska skillnaden mellan fasad och äkta enighet.',
        prompts: [
          'Är det skillnad för dig mellan att visa en enad front mot barnen och att faktiskt känna att ni är på samma lag?',
          'Vad händer mellan er när ni faktiskt arbetar igenom en oenighet i efterhand — jämfört med när ni bara låter det passera?',
        ],
      },
      {
        id: 'scenario-17',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Efter en jobbig kväll tappar en av er tålamodet inför barnet. Den andra reagerar på det, men ni tar inte diskussionen där och då.',
        prompts: [
          'När en av er tappat tålamodet inför barnen — vad händer efteråt? Hur brukar ni hantera det, och hur känns det?',
        ],
      },
      {
        id: 'exercise-17',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Bestäm hur ni signalerar "vi tar det sen". Prata om hur ni sedan tar upp det — utan att ställa er mot varandra. Bestäm också hur ni visar barnet att vuxna också reparerar konflikter.',
      },
    ],
  },
  {
    id: 'thoughtful-space',
    title: 'Omtänksamt utrymme',
    subtitle: 'Att ge och ta utrymme utan att skapa avstånd',
    categoryId: 'category-8',
    sections: [
      {
        id: 'opening-18',
        type: 'opening',
        title: 'Början',
        content: 'Utrymme kan vara kärlek — eller avstånd.',
        prompts: [
          'Hur ser det ut, inifrån, precis innan du är helt slut och behöver utrymme — vad är det första du märker?',
          'Vad vill du egentligen ha från din partner när du drar dig undan — även om du inte säger det?',
          'Hur ser det ut för din partner att stanna nära dig — utan att försöka lösa något?',
        ],
      },
      {
        id: 'reflective-18',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan omsorg och övergivande.',
        prompts: [
          'Är det skillnad för dig mellan att få utrymme för att din partner respekterar att du behöver det — och att bli lämnad ensam?',
          'Hur vet du när din partner behöver att du är nära — och när du faktiskt hjälper mer genom att ge dem utrymme?',
        ],
      },
      {
        id: 'scenario-18',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En drar sig undan för att orka, den andra känner sig övergiven. Båda försöker skydda relationen.',
        prompts: [
          'När slutar det att ge varandra utrymme att vara hjälpsamt — och börjar bli en vana som drar er isär?',
        ],
      },
      {
        id: 'exercise-18',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Kom överens om tydliga tecken för:\n• när jag behöver vara ifred\n• när jag behöver att du stannar\n• när jag inte vet vad jag behöver',
      },
    ],
  },
  {
    id: 'self-esteem-wavering',
    title: 'När självkänslan svajar',
    subtitle: 'Sårbarhet och förändrade roller',
    categoryId: 'category-8',
    sections: [
      {
        id: 'opening-15',
        type: 'opening',
        title: 'Början',
        content: 'Självkänsla påverkar allt — även er.',
        prompts: [
          'Märker din partner förändringen i dig när ditt självförtroende sviktar — och tar de upp det, eller låter de det passera?',
          'Hur brukar din partner reagera när du kämpar — och är det alltid det du behöver?',
          'När en av er går igenom en svårare period med självförtroendet — vad händer då mellan er?',
        ],
      },
      {
        id: 'reflective-15',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad som döljs bakom fasaden.',
        prompts: [
          'När väljer du att inte säga hur det faktiskt är i relationen — och vad gör det lättare att hålla tyst?',
          'Vad slutar du be om — eller säga rakt ut — när du inte känner dig trygg i dig själv?',
        ],
      },
      {
        id: 'scenario-15',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En motgång gör att en av er börjar ta mindre plats (förlorat jobbet, misslyckats med ett projekt, gått upp i vikt). Det sägs inte rakt ut, men märks i din ton och ditt initiativ. Barnet anpassar sig.',
        prompts: [
          'Hur stöttar ni varandra när en av er går igenom något svårt — vad fungerar, och vad fungerar inte?',
        ],
      },
      {
        id: 'exercise-15',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Enas om vilka ord ni använder — och undviker — inför barnet när någon av er tvivlar på sig själv. Bestäm vilka ansvar som tillfälligt kan skifta utan att den som kämpar tappar sin plats i familjen.',
      },
    ],
  },
  // ── Layer 4: När vi tycker olika ───────────────────────
  {
    id: 'different-parenting-styles',
    title: 'Uppfostran ni ärvt',
    subtitle: 'Reaktioner formade av uppväxt',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-4',
        type: 'opening',
        title: 'Början',
        content: 'Varje förälder bär med sig sin egen historia.',
        prompts: [
          'Har du någonsin reagerat på något med barnen och direkt tänkt — just så här skulle mina föräldrar ha gjort?',
          'Vad från din egen uppväxt är du mest säker på att du vill föra vidare — även om ni ser det på olika sätt?',
          'Vilken typ av situation med barnen brukar visa tydligast att ni vuxit upp med olika sätt att se på saker?',
        ],
      },
      {
        id: 'reflective-4',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Fundera på rötterna till era reaktioner.',
        prompts: [
          'Kan du skilja på om du reagerar på det som faktiskt händer — eller på något det påminner dig om?',
          'Är det något i hur ni hanterar det ihop som gör sådana stunder ännu svårare — de stunder när du märker att din historia talar?',
        ],
      },
      {
        id: 'scenario-4',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En vardagssituation väcker starka reaktioner. Den ena reagerar på händelsen, den andra på känslan som väcks.',
        prompts: [
          'Hur pratar ni om en situation där ni reagerat olika — utan att det förvandlas till en jämförelse av vems reaktion var mest rimlig?',
        ],
      },
      {
        id: 'exercise-4',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Bestäm en gemensam formulering ni kan använda när historien talar för högt.',
        prompts: [
          'Prata efteråt om vad den skyddade — och vad den inte gjorde.',
        ],
      },
    ],
  },
  {
    id: 'parenting-boundaries',
    title: 'Att säga ifrån',
    subtitle: 'Gränser, starka reaktioner och samspel',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-6a',
        type: 'opening',
        title: 'Början',
        content: 'Gränssättning berör ofta mer än det som syns.',
        prompts: [
          'Efter att du satt en gräns med barnen — vad gör att du känner att du hanterade det bra, och vad gör att det inte gick som du ville?',
          'Vilken typ av situation med barnen är du mest osäker på att ni hanterar gränssättningen bra i — och varför?',
          'Vad är det barnen gör som väcker den starkaste reaktionen i dig — den som ibland till och med överraskar dig själv?',
        ],
      },
      {
        id: 'reflective-6a',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad som driver era reaktioner.',
        prompts: [
          'Kan du avgöra när du reagerar på rädslan för vad som kan hända, snarare än på det som faktiskt sker just nu?',
          'Vad brukar hända mellan er när ni inte är på samma sida om hur ni ska hantera något med barnen?',
        ],
      },
      {
        id: 'scenario-6a',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ett beteende väcker olika impulser. Den ena vill agera direkt, den andra vill avvakta.',
        prompts: [
          'När en av er vill agera direkt och den andra vill avvakta — hur känns det i stunden?',
        ],
      },
      {
        id: 'exercise-6a',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Enas om två saker: vad ni vill undvika att göra i affekt — och vad som är viktigt att hålla fast vid även när ni tycker olika.',
      },
    ],
  },
  {
    id: 'parenting-exhaustion',
    title: 'Mina, dina, era värderingar',
    subtitle: 'Värderingar i vardagliga val',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-5',
        type: 'opening',
        title: 'Början',
        content: 'Värderingar syns tydligast i vardagen.',
        prompts: [
          'Vad hoppas du att barnen lär sig av att se hur ni är mot varandra?',
          'Tänk på ett ögonblick när det var tydligt att ni vardera försökte lära barnen något lite olika — vad hände?',
          'Vilken värdering är viktigast för dig i teorin — men svårast att faktiskt följa hemma?',
        ],
      },
      {
        id: 'reflective-5',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'De här frågorna bjuder in till ärlighet om era val.',
        prompts: [
          'Tänk på ett ögonblick nyligen när du agerade på ett sätt som inte riktigt stämde med vad du faktiskt tror på — vad var det?',
          'Gör relationen det lättare eller svårare att leva som du egentligen vill?',
        ],
      },
      {
        id: 'scenario-5',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Barnet beter sig respektlöst. En markerar direkt mot barnet. Den andra reagerar mer på hur gränsen sätts: ton, ordval eller situation.',
        prompts: [
          'När ni reagerar olika i ett spänt ögonblick med barnen — vad försöker var och en av er egentligen skydda?',
        ],
      },
      {
        id: 'exercise-5',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Prata om vad var och en försöker skydda när ni reagerar olika.',
        prompts: [
          'Hur kan det märkas i ton, timing eller ordval nästa gång — inte som en lösning, utan som ett sätt att förstå varandra bättre?',
        ],
      },
    ],
  },
  // ── Layer 5: Det vi bär med oss ────────────────────────
  {
    id: 'family-voices',
    title: 'Röster från släkten',
    subtitle: 'Släktens påverkan och er samhörighet',
    categoryId: 'individual-needs',
    sections: [
      {
        id: 'opening-11',
        type: 'opening',
        title: 'Början',
        content: 'Släktens röster bär både värme och vikt.',
        prompts: [
          'Är det skillnad för dig mellan att familjen är engagerad och att familjen är i vägen?',
          'När har ni skilt er åt i hur ni hanterar familjen — och vad fick det för konsekvenser för er?',
          'Inför en familjeträff — vad tenderar du att prioritera: att hålla freden eller att säga vad du tänker?',
        ],
      },
      {
        id: 'reflective-11',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan stöd och påverkan.',
        prompts: [
          'När hjälper det barnen att se olika sätt att göra saker — och när lämnar det dem bara osäkra på vad som gäller?',
          'Vad har det kostat er som par att anpassa er till familjens förväntningar — och har det någonsin fungerat till er fördel?',
        ],
      },
      {
        id: 'scenario-11',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En släkting ifrågasätter er inför barnet. Det som sårar mest är inte orden, utan att ni inte är helt synkade i stunden.',
        prompts: [
          'När en släkting ifrågasätter er inför barnen och ni inte hunnit prata ihop er — hur hittar ni tillbaka till att stå enade?',
        ],
      },
      {
        id: 'exercise-11',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Enas om en neutral mening ni kan säga inför barnet när ni inte är synkade. Bestäm också hur ni tar upp oenigheten efteråt — på ett sätt som inte söker skyldiga.',
      },
    ],
  },
  {
    id: 'our-traditions',
    title: 'Mina, dina, era traditioner',
    subtitle: 'Tillhörighet och vad ni väljer att föra vidare',
    categoryId: 'individual-needs',
    sections: [
      {
        id: 'opening-12',
        type: 'opening',
        title: 'Början',
        content: 'Traditioner berättar vilka ni är.',
        prompts: [
          'Vilken tradition är viktigast för dig — och vad representerar den egentligen för dig?',
          'Vilken kompromiss kring traditioner har lämnat dig med känslan av att något viktigt gick förlorat?',
          'Vad vill du att de traditioner ni håller fast vid ska säga om vilka ni är som familj?',
        ],
      },
      {
        id: 'reflective-12',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Vad behåller ni — och vad släpper ni?',
        prompts: [
          'Vilka traditioner känns värda att skydda precis som de är — och vilka skulle du vara öppen för att göra mer till era egna?',
        ],
      },
      {
        id: 'scenario-12',
        type: 'scenario',
        title: 'I vardagen',
        content: 'När ni skapar något nytt blir det tydligt vad ni väljer bort. Barnet frågar varför vissa saker finns kvar och andra inte.',
        prompts: [
          'Hur berättar ni historien om er familj — på ett sätt som inkluderar båda era bakgrunder?',
        ],
      },
      {
        id: 'exercise-12',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Formulera en gemensam berättelse om varför ni valt just era traditioner.',
        prompts: [
          'Vad vill ni att barnet ska förstå om er genom dem?',
        ],
      },
    ],
  },
  // ── Layer 6: Dit vi är på väg ──────────────────────────
  {
    id: 'our-philosophy',
    title: 'Er filosofi',
    subtitle: 'Värderingar under press',
    categoryId: 'category-9',
    sections: [
      {
        id: 'opening-19',
        type: 'opening',
        title: 'Början',
        content: 'Värderingar testas i vardagen.',
        prompts: [
          'I vilka sammanhang är det svårast att faktiskt leva som du tror på — särskilt inför barnen?',
          'Vilken av dina värderingar är du mest benägen att låta glida när det är stressigt eller hektiskt?',
          'Tänk på ett ögonblick nyligen när du kände dig genuint nöjd med hur ni hanterade något som föräldrar — vad hände?',
        ],
      },
      {
        id: 'reflective-19',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad ni verkligen prioriterar.',
        prompts: [
          'När trycket ökar — vilken värdering håller ni fast vid längst, och vilken brukar glida undan?',
          'När hjälper konsekvens och struktur barnen att känna sig trygga — och när hindrar de dem från att utveckla sitt eget omdöme?',
        ],
      },
      {
        id: 'scenario-19',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Barnet gör upprepade val som går emot era värderingar. Frustrationen växer.',
        prompts: [
          'Hur sätter ni konsekvenser på ett sätt som barnen förstår — utan att de känner att ni är emot dem?',
        ],
      },
      {
        id: 'exercise-19',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Gör en gemensam plan: vad ni börjar med när barnet bryter mot en gräns, när ni sätter en tydlig konsekvens — och när konsekvensen faktiskt behöver genomföras.',
      },
    ],
  },
  {
    id: 'when-life-tilts',
    title: 'När livet lutar',
    subtitle: 'Att ge varandra utrymme',
    categoryId: 'category-9',
    sections: [
      {
        id: 'opening-20',
        type: 'opening',
        title: 'Början',
        content: 'Drömmar kräver mod — av er båda.',
        prompts: [
          'Vad vill du för dig själv — något som inte bara är ditt att lösa, utan som också skulle påverka er som par?',
          'Vad skulle hjälpa dig att satsa på något du vill utan att oroa dig för vad det innebär för er?',
          'Hur skiljer du på att ge upp något för relationen som ett verkligt val — och att ge upp för att du inte hade något annat val?',
        ],
      },
      {
        id: 'reflective-20',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan stöd och obalans.',
        prompts: [
          'Var går gränsen för dig — när börjar det att stötta din partners mål kosta mer än du är beredd att ge?',
          'Hur märker du att det som var tänkt som en tillfällig tystnad håller på att bli ert normaltillstånd?',
        ],
      },
      {
        id: 'scenario-20',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En av er vill satsa helhjärtat på något som under en tid tar mycket energi. Den andra stöttar, men oroar sig för balansen.',
        prompts: [
          'Innan något stort och krävande börjar — hur brukar ni förbereda er som par, och vad glömmer ni oftast att prata om?',
        ],
      },
      {
        id: 'exercise-20',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Bestäm vilka tecken som visar att satsningen tar för mycket plats. Enas också om hur ni justerar om de tecknen dyker upp — innan det går ut över relationen.',
      },
    ],
  },
  // ── Layer 7: Trygghet & mod ────────────────────────────
  {
    id: 'worth-spending-on',
    title: 'Värt att spendera på',
    subtitle: 'Vad som känns värdefullt att investera i; tid, energi, pengar',
    categoryId: 'category-6',
    sections: [
      {
        id: 'opening-14',
        type: 'opening',
        title: 'Början',
        content: 'Vad är värt vad — och för vem?',
        prompts: [
          'Vilken typ av erfarenhet tror du faktiskt formar ett barn — den sortens upplevelse de bär med sig?',
          'Vad skulle ni vilja spara till som familj — något som verkligen känns värt ansträngningen?',
          'Vad saknade du som barn som du nu vill ge dina egna barn?',
        ],
      },
      {
        id: 'reflective-14',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad som driver era val.',
        prompts: [
          'Vad tror du lär barn mest — upplevelserna i sig, eller att se hur deras föräldrar kämpar för något?',
          'Finns det saker ni spenderar pengar eller tid på som kanske skickar ett oönskat budskap till barnen?',
        ],
      },
      {
        id: 'scenario-14',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni står inför en kostsam satsning och märker att frågan väcker olika bilder av vad som är "värt det". Barnet märker att något stort är på gång.',
        prompts: [
          'Vad gör att något är värt att spendera på — bortom att ni faktiskt har råd?',
        ],
      },
      {
        id: 'exercise-14',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Enas om vad som gör satsningen värd det — i tid, pengar och energi. Prata om vad ni är beredda att vänta med, och om hur barnet kan få vara delaktigt på vägen.',
      },
    ],
  },
  {
    id: 'risk-under-responsibility',
    title: 'Risk under ansvar',
    subtitle: 'Mod, trygghet och gemensamma ramar',
    categoryId: 'category-6',
    sections: [
      {
        id: 'opening-13',
        type: 'opening',
        title: 'Början',
        content: 'Ekonomiska beslut berör mer än pengar.',
        prompts: [
          'Vad skiljer en ekonomisk risk som känns meningsfull från en som mest känns skrämmande?',
          'Vad behöver finnas på plats för att du ska känna dig trygg med ett ekonomiskt beslut ni fattar tillsammans?',
          'Vad tror du att barnen faktiskt lär sig av att se hur ni hanterar osäkerhet — vare sig ni vill det eller inte?',
        ],
      },
      {
        id: 'reflective-13',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan mod och ansvar.',
        prompts: [
          'Vad skiljer ett modigt ekonomiskt beslut från ett ansvarsfullt sådant — är det ens en skillnad för dig?',
          'Tenderar du att känna dig tryggare när du undviker osäkerhet — eller när du vet att du kan hantera konsekvenserna om det går snett?',
        ],
      },
      {
        id: 'scenario-13',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En av er vill starta eget eller studera vidare, vilket innebär lägre inkomster under en period.',
        prompts: [
          'Vilka är de tidiga tecknen för dig på att en risk håller på att tippa över — att bli för kostsam?',
        ],
      },
      {
        id: 'exercise-13',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Välj en satsning som känns möjlig — något som en av er kanske vill ta tag i en dag.\nPrata igenom:\n• Vad skulle vara det bästa tänkbara utfallet?\n• Vad skulle vara det svåraste realistiska utfallet?\n• Vilken gräns vill ni inte passera — i tid, pengar eller energi?\n• Vilka två tecken skulle betyda: "nu behöver vi bromsa"?',
      },
    ],
  },
  // ── Layer 8: Vi nära ───────────────────────────────────
  {
    id: 'adrift',
    title: 'På drift',
    subtitle: 'När relationen långsamt ändrar riktning',
    categoryId: 'daily-life',
    sections: [
      {
        id: 'opening-21',
        type: 'opening',
        title: 'Början',
        content: 'Ibland märks förändringen inte förrän efteråt.',
        prompts: [
          'Vad har ni slutat göra tillsammans under de senaste åren — något som bara tyst försvann?',
          'Har det hänt nyligen att ni var tillsammans men du ändå kände dig ensam?',
          'När kände du senast att din partner valde dig — inte bara att du var där?',
        ],
      },
      {
        id: 'reflective-21',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad avstånd egentligen handlar om.',
        prompts: [
          'Växer distansen mellan er mer efter bråk — eller tyst, under perioder när ingenting är fel?',
          'Vad brukar hända om det aldrig tas upp — de gånger ni drar er undan från varandra?',
        ],
      },
      {
        id: 'scenario-21',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni bråkar sällan. Men ni skrattar inte heller som förr. Närhet skjuts upp till "sen".',
        prompts: [
          'Hur avgör ni om ni bara går igenom en tyst period — eller om något faktiskt håller på att förändras mellan er?',
        ],
      },
      {
        id: 'exercise-21',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Gör ett litet experiment under en vecka som bryter autopiloten — ett nytt sätt att hälsa, ta i varandra, eller ställa frågor ni inte brukar ställa.',
        prompts: ['Prata sedan om det: förde det er närmare — eller visade det på ett avstånd?'],
      },
    ],
  },
  {
    id: 'love-languages',
    title: 'Kärleksspråk',
    subtitle: 'Närhet och hur signaler uppfattas',
    categoryId: 'daily-life',
    sections: [
      {
        id: 'opening-9',
        type: 'opening',
        title: 'Början',
        content: 'Närhet börjar med att förstå varandras språk.',
        prompts: [
          'Vilken liten sak gör din partner — eller skulle kunna göra — som får dig att känna dig genuint omhändertagen?',
          'Vad känns som närhet för dig just nu — den sortens närhet som inte behöver leda någonstans?',
          'Märker du att din önskan om närhet vanligtvis når fram — eller missas den ibland?',
        ],
      },
      {
        id: 'reflective-9',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska hur ni läser varandra.',
        prompts: [
          'Finns det något din partner gör som du lärt dig att känna igen som "jag vill vara nära" — och något de gör som du ibland fortfarande mistolkar?',
          'När någon säger "inte ikväll" — när känns det som ett avvisande, och när känns det som ärlighet?',
        ],
      },
      {
        id: 'scenario-9',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Trötthet och längtan krockar. Den ena vill vara nära, den andra orkar inte. Trots goda intentioner smyger sig både press och tolkningar in.',
        prompts: [
          'Är det lätt eller svårt hos er att skilja på ett "nej" till sex och ett "nej" till varandra — hur hanterar ni det?',
        ],
      },
      {
        id: 'exercise-9',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Skapa två tydliga signaler: "Jag längtar efter närhet" och "Jag kan inte just nu, men jag vill dig".',
        prompts: [
          'Hur kan de se ut så att ingen behöver gissa?',
        ],
      },
    ],
  },
  // ── Layer 9: Att välja oss ─────────────────────────────
  {
    id: 'choosing-to-stay',
    title: 'Att fortsätta välja',
    subtitle: 'Att aktivt prioritera relationen',
    categoryId: 'category-10',
    sections: [
      {
        id: 'opening-22',
        type: 'opening',
        title: 'Början',
        content: 'Att stanna är också ett val.',
        prompts: [
          'Tänk på ett ögonblick nyligen när du gjorde något för relationen — inte för att du var tvungen, utan för att du ville. Vad var det?',
          'Vad gör du i relationen som genuint är ditt eget val — inte bara det du gör för att det förväntas?',
          'När känner du tydligast att du väljer att stanna — inte för att du måste, utan för att du vill?',
        ],
      },
      {
        id: 'reflective-22',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska skillnaden mellan att stanna och att välja.',
        prompts: [
          'Hur ser det ut att välja relationen när det inte finns någon kris — utan att något tvingar fram ett val?',
          'Hur ser det ut när två personer väljer varandra — snarare än bara stannar kvar?',
        ],
      },
      {
        id: 'scenario-22',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Relationen fungerar. Inget är trasigt. Ni samarbetar, delar ansvar och tar er igenom vardagen. Samtidigt finns en tyst insikt om att relationer också är något man kan lämna — även utan konflikt.',
        prompts: [
          'Vad händer i dig när du påminner dig om att du inte stannar för att du måste — utan för att du vill?',
        ],
      },
      {
        id: 'exercise-22',
        type: 'exercise',
        title: 'Tillsammans',
        content: 'Svara var för sig, utan att förklara eller försvara: "Det här hos dig gör att jag vill vara kvar."\nStanna upp. Låt din partner ta emot det — utan att svara direkt.\nAvsluta med: "Det här vill jag inte ta för givet."\nTacka varandra.',
        prompts: ['Lyssna utan att kommentera eller lugna. Låt det få vara sant mellan er.'],
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
