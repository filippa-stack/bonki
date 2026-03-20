import { Category, Card } from '@/types';

/** Bump this whenever categories or cards change in this file */
export const CONTENT_VERSION = 10;

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
    cardCount: 2,
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
    cardCount: 2,
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
  // ── Card 0 · Grunden ─────────────────────────────────────
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
          'Vad är det lilla mellan er som du skulle sakna mest — om det inte längre fanns?',
          'Vad är det som gör att ni känner er som ett par — bortom det praktiska ni delar?',
        ],
      },
      {
        id: 'reflective-7a',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Stanna upp och känn efter.',
        prompts: [
          'Tänk på den senaste gången du kände att ni hade glidit isär lite — vad var det som fick dig att märka det?',
          'Förändras du mot din partner när ni inte haft tid för varandra — och i så fall, hur?',
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
    ],
  },
  // ── Card 1 · Grunden ─────────────────────────────────────
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
          'Finns det ett läge ni brukar ha tillsammans — eller brukade ha — som du saknar när vardagen tar över?',
          'Vad behöver ni från varandra för att ett samtal ska bli mer än praktiskt?',
        ],
      },
      {
        id: 'reflective-10',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan effektivitet och avstånd.',
        prompts: [
          'Finns det något mellan er som försvunnit så tyst att ni först nu tänker på det?',
          'Vad är skillnaden för dig mellan att vara på samma ställe och att faktiskt vara med varandra?',
        ],
      },
      {
        id: 'scenario-10',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni löser vardagen smidigt. Samtalen handlar om tider, ansvar och barn.',
        prompts: [
          'Finns det något mellan er som har slutat leva — även om allt fortfarande fungerar?',
        ],
      },
    ],
  },
  // ── Card 2 · Grunden ─────────────────────────────────────
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
          'Vad har du anpassat dig till sedan ni fick barn — något som till en början inte var ditt val?',
        ],
      },
      {
        id: 'reflective-8a',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad anpassningen kostar.',
        prompts: [
          'Tänk på något du anpassat dig till sedan ni fick barn. Känns det som att du valde det — eller som att det bara blev så?',
          'När det är bra mellan er — är det lättare då att vara den du är utanför föräldraskapet?',
        ],
      },
      {
        id: 'scenario-8a',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Behov som hålls tillbaka för att vardagen ska fungera.',
        prompts: [
          'Välj en förändring sedan ni fick barn som du vet inte var ditt val. Hur känns det idag — har du gjort fred med den, eller skaver den fortfarande?',
        ],
      },
    ],
  },
  // ── Card 3 · Grunden ─────────────────────────────────────
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
        content: 'De här frågorna öppnar samtalet varsamt.',
        prompts: [
          'Vad behöver hända — eller sägas — innan du faktiskt kan sluta tänka på dagen?',
          'Finns det ett ögonblick på kvällen när du faktiskt känner att dagen är klar — eller är det mer att den bara ebbar ut?',
        ],
      },
      {
        id: 'reflective-1',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Ta er tid med de här.',
        prompts: [
          'Är det något du fortsätter att göra på kvällarna som egentligen inte behöver göras — men som känns fel att sluta med?',
          'Tänk dig att du fortsätter med kvällssysslor och din partner redan har satt sig — vad tror du hen tänker om det?',
        ],
      },
      {
        id: 'scenario-1',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Efter läggning gör ni olika saker. Ingen säger något, men båda drar egna slutsatser.',
        prompts: [
          'Vad gör du — utan att säga det rakt ut — när du känner att kvällen är slut, men din partner inte verkar märka det?',
        ],
      },
    ],
  },
  // ── Card 4 · Normen ──────────────────────────────────────
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
          'Finns det något hemma du vet att du gör bättre — men som du ibland önskar att du inte behövde vara bäst på?',
          'Vilken roll i familjen skulle du vilja ha mer utrymme för — något du skulle vilja göra mer av, eller ta mer plats i?',
        ],
      },
      {
        id: 'reflective-3',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'De här frågorna utforskar mönster och historia.',
        prompts: [
          'Vilken roll hemma har du som du inte skulle vilja ge bort — men som du ibland önskar att du kunde dela?',
          'Om du är den som oftast vet hur något ska göras hemma — vad händer med din partners vilja att ta initiativ?',
        ],
      },
      {
        id: 'scenario-3',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En uppgift har blivit "din". Den andra kliver undan. Med tiden blir skillnaden självklar.',
        prompts: [
          'En uppgift har tillhört dig så länge att den blivit en del av vem du är hemma. Vad skulle förändras mellan er om du släppte den?',
        ],
      },
    ],
  },
  // ── Card 5 · Normen ──────────────────────────────────────
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
          'När känns det som att ditt sätt att göra saker med barnen ifrågasätts?',
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
          'När barnen märker att ni gör saker på olika sätt — vad händer mellan er i det ögonblicket?',
        ],
      },
    ],
  },
  // ── Card 6 · Normen ──────────────────────────────────────
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
        ],
      },
      {
        id: 'reflective-16',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska era olika strategier.',
        prompts: [
          'Tänk på senaste gången din partner var stressad. Vad antog du — innan hen berättade vad som faktiskt pågick?',
          'Behöver du din partner nära dig när du kämpar — eller fungerar ni bättre med lite avstånd innan ni kan mötas igen?',
        ],
      },
      {
        id: 'scenario-16',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni möter en svår period. Två impulser krockar: agera nu, eller vänta.',
        prompts: [
          'Ni har just fått svåra besked. En av er vill agera, den andra behöver stillhet. Vad säger ni till varandra — eller vad låter ni bli att säga?',
        ],
      },
    ],
  },
  // ── Card 7 · Normen ──────────────────────────────────────
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
          'När en av er tappat tålamodet inför barnen — vad är det första som händer mellan er efteråt?',
        ],
      },
    ],
  },
  // ── Card 8 · Normen ──────────────────────────────────────
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
          'Vad brukar du göra — eller sluta göra — strax innan du når gränsen och behöver vara ifred?',
          'Vad vill du egentligen ha från din partner när du drar dig undan — även om du inte säger det?',
        ],
      },
      {
        id: 'reflective-18',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan omsorg och övergivande.',
        prompts: [
          'Är det skillnad för dig mellan att få utrymme för att din partner respekterar att du behöver det — och att bli lämnad ensam?',
          'Tänk på senaste gången din partner drog sig undan. Visade det sig att hen ville ha närhet — eller att hen verkligen behövde vara ifred?',
        ],
      },
      {
        id: 'scenario-18',
        type: 'scenario',
        title: 'I vardagen',
        content: '',
        prompts: [
          'Beskriv hur det känns i kroppen — i ögonblicket efter att en av er har dragit sig undan och dörren stängs.',
        ],
      },
    ],
  },
  // ── Card 9 · Konflikten ──────────────────────────────────
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
          'När ditt självförtroende sviktar — tar din partner upp det, eller låter hen det passera?',
          'När en av er går igenom en svårare period med självförtroendet — förändras sättet ni pratar med varandra på?',
        ],
      },
      {
        id: 'reflective-15',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad som döljs bakom fasaden.',
        prompts: [
          'Vad gör det lättare att hålla tyst om hur du mår i relationen?',
          'Finns det något du bad om eller sa rakt ut förut — som du har slutat med?',
        ],
      },
      {
        id: 'scenario-15',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En motgång som gör att någon börjar ta mindre plats. Det märks inte i ord — men i ton, initiativ, och tystnad.',
        prompts: [
          'Din partner har börjat ta mindre plats — i samtalen, i besluten, i initiativet. Vad gör du med det du märker?',
        ],
      },
    ],
  },
  // ── Card 10 · Konflikten ─────────────────────────────────
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
        ],
      },
      {
        id: 'reflective-4',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Fundera på rötterna till era reaktioner.',
        prompts: [
          'Tänk på en gång du reagerade starkare än situationen verkade kräva. När du tänker tillbaka — handlade det om det som hände, eller om något äldre?',
          'Gör det lättare eller svårare mellan er — när en av er reagerar utifrån sin historia?',
        ],
      },
      {
        id: 'scenario-4',
        type: 'scenario',
        title: 'I vardagen',
        content: 'En vardagssituation väcker starka reaktioner. Den ena reagerar på händelsen, den andra på känslan som väcks.',
        prompts: [
          'När ni reagerat olika på något med barnen — brukar ni kunna prata om det utan att det blir en tävling om vem som hade rätt?',
        ],
      },
    ],
  },
  // ── Card 11 · Konflikten ─────────────────────────────────
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
          'Senaste gången du reagerade starkt på något barnen gjorde — handlade det mer om det du såg framför dig, eller om det du var rädd skulle hända sen?',
          'Vad händer mellan er i stunden — medan barnet tittar på — när ni är oense om en gräns?',
        ],
      },
      {
        id: 'scenario-6a',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ett beteende väcker olika impulser. Agera direkt — eller avvakta.',
        prompts: [
          'När en av er vill agera direkt och den andra vill avvakta — hur känns det i stunden?',
        ],
      },
    ],
  },
  // ── Card 12 · Konflikten ─────────────────────────────────
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
          'Var i er vardag ser du det tydligaste glappet mellan vad ni säger att ni tror på — och hur ni faktiskt gör?',
          'Tänk på ett ögonblick när det var tydligt att ni vardera försökte lära barnen något lite olika — vad hände?',
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
        content: 'Barnet beter sig respektlöst. Gränsen sätts — men det som följer handlar mer om tonen och ordvalet än om barnet.',
        prompts: [
          'Tänk på senaste gången ni reagerade olika i ett spänt ögonblick med barnen. Vad försökte du skydda?',
        ],
      },
    ],
  },
  // ── Card 13 · Konflikten ─────────────────────────────────
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
        ],
      },
      {
        id: 'reflective-11',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan stöd och påverkan.',
        prompts: [
          'När ni väljer olika sida i en fråga som rör släkten — hanterar ni det som ett lag eller som två individer?',
          'Hur har det påverkat er som par att anpassa er till familjens förväntningar — och har det någonsin fungerat till er fördel?',
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
    ],
  },
  // ── Card 14 · Längtan ────────────────────────────────────
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
          'Finns det en tradition från din partners bakgrund som du följer med i — utan att riktigt förstå varför den är viktig för hen?',
          'Har ni skapat en tradition som är bara er — som inte kommer från någon av era familjer?',
        ],
      },
      {
        id: 'reflective-12',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Vad behåller ni — och vad släpper ni?',
        prompts: [
          'Finns det en tradition ni följer som du känner att det är dags att göra till er egen — istället för att bara ärva den?',
          'Har du någonsin behållit en tradition mer för din partners skull än för din egen — och vet hen om det?',
        ],
      },
      {
        id: 'scenario-12',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Traditioner är inte neutrala. De bär på vems värld som fick mest plats.',
        prompts: [
          'Vad har det kostat dig att låta en tradition som inte är din ta plats — och har du någonsin sagt det högt?',
        ],
      },
    ],
  },
  // ── Card 15 · Längtan ────────────────────────────────────
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
          'Vilken värdering är den första som glider — när det blir stressigt?',
        ],
      },
      {
        id: 'reflective-19',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad ni verkligen prioriterar.',
        prompts: [
          'När du agerat på ett sätt som inte stämmer med vad du tror på — brukar du ta upp det med din partner, eller håller du det för dig själv?',
          'Tänk på en gång din partner kompromissade med något du vet är viktigt för hen. Påverkade det hur du såg på hen — eller kände du likadant?',
        ],
      },
      {
        id: 'scenario-19',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Barnet gör upprepade val som går emot era värderingar. Frustrationen växer.',
        prompts: [
          'Vad händer mellan er när frustrationen gör att en av er agerar på ett sätt som den andra inte kan stå bakom?',
        ],
      },
    ],
  },
  // ── Card 16 · Längtan ────────────────────────────────────
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
          'Tänk på något du lagt åt sidan för relationens skull. Kändes det som ditt beslut — eller som att du inte hade något val?',
        ],
      },
      {
        id: 'reflective-20',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan stöd och obalans.',
        prompts: [
          'Har det hänt att du stöttat din partners mål och i efterhand känt att det kostade för mycket? Vad var det som kostade mest?',
          'Finns det något ni slutat prata om som ni brukade ta upp — utan att ni bestämde att sluta?',
        ],
      },
      {
        id: 'scenario-20',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Någon vill satsa på något som tar mycket energi. Balansen skiftar.',
        prompts: [
          'Vad har ni i efterhand önskat att ni pratat om — innan något stort tog fart?',
        ],
      },
    ],
  },
  // ── Card 17 · Längtan ────────────────────────────────────
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
          'Vad prioriterar du i familjen som din partner ibland tycker kostar för mycket — i tid, pengar eller energi?',
          'Finns det något du vill spendera tid eller pengar på som du inte berättar för din partner — för att du vet att hen inte skulle förstå?',
        ],
      },
      {
        id: 'reflective-14',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska vad som driver era val.',
        prompts: [
          'Tänk på senaste gången du ville satsa på något och kände att din partner inte förstod varför det var viktigt. Vad gjorde det med dig?',
          'Tänk på en prioritering du gick med på utan att riktigt förstå. Hur känns den idag?',
        ],
      },
      {
        id: 'scenario-14',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni står inför en satsning. Frågan om vad som är "värt det" väcker olika svar.',
        prompts: [
          'Tänk på den senaste satsningen ni var oense om. Vad gjorde den värd det för dig — eller vad fick dig att tveka?',
        ],
      },
    ],
  },
  // ── Card 18 · Valet ──────────────────────────────────────
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
          'Vad behöver finnas på plats för att du ska känna dig trygg med ett ekonomiskt beslut ni fattar tillsammans?',
          'Vad tror du din partner faktiskt lär sig om dig av att se hur du hanterar osäkerhet?',
        ],
      },
      {
        id: 'reflective-13',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska gränsen mellan mod och ansvar.',
        prompts: [
          'Tänk på ett ekonomiskt beslut ni fattat. Skulle du kalla det modigt, ansvarsfullt — eller både och?',
          'Tänk på senaste gången ni stod inför ett osäkert beslut. Kändes det tryggare att undvika risken — eller att veta att ni kunde hantera konsekvenserna?',
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
    ],
  },
  // ── Card 19 · Valet ──────────────────────────────────────
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
          'Tänk på en period nyligen när det var avstånd mellan er. Tänkte du mer kritiskt om din partner då än du brukar?',
        ],
      },
      {
        id: 'scenario-21',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Ni bråkar sällan. Men ni skrattar inte heller som förr. Närhet skjuts upp till "sen".',
        prompts: [
          'Vad är det som gör att du börjar undra om det här är mer än en tyst period?',
        ],
      },
    ],
  },
  // ── Card 20 · Valet ──────────────────────────────────────
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
          'Märker du att din önskan om närhet vanligtvis når fram — eller missas den ibland?',
        ],
      },
      {
        id: 'reflective-9',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska hur ni läser varandra.',
        prompts: [
          'Vad gör din partner när hen vill vara nära dig — och vet hen att du förstår det?',
          'När din partner säger "inte ikväll" — när känns det som ett avvisande, och när känns det som ärlighet?',
        ],
      },
      {
        id: 'scenario-9',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Trötthet och längtan krockar. Press och tolkningar smyger sig in — trots goda intentioner.',
        prompts: [
          'Hur skiljer ni hos er på ett "nej" till sex och ett "nej" till varandra?',
        ],
      },
    ],
  },
  // ── Card 21 · Valet ──────────────────────────────────────
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
          'Det finns ögonblick när du vet att du kunde gå — och ändå stannar. Vad är det som håller dig kvar som du inte kan förklara?',
          'Vad gör din partner som påminner dig om varför du är kvar?',
        ],
      },
      {
        id: 'reflective-22',
        type: 'reflective',
        title: 'Fördjupning',
        content: 'Utforska skillnaden mellan att stanna och att välja.',
        prompts: [
          'Tänk på ett ögonblick nyligen när du kände att du aktivt valde att vara kvar. Vad var det som utlöste den känslan?',
          'Hur märks det i er vardag att din partner har valt att stanna — inte i ord, utan i det hen gör?',
        ],
      },
      {
        id: 'scenario-22',
        type: 'scenario',
        title: 'I vardagen',
        content: 'Relationen fungerar. Inget är trasigt. Men ni vet båda att man också kan gå.',
        prompts: [
          'Vad händer i dig när du påminner dig om att du inte stannar för att du måste — utan för att du vill?',
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
