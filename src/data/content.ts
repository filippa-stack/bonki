import { Category, Card } from '@/types';

/** Bump this whenever categories or cards change in this file */
export const CONTENT_VERSION = 2;

export const categories: Category[] = [
  {
    id: 'communication',
    title: 'Arbetsfördelning & mentala lasset',
    entryLine: 'Vem bär vad — och hur känns det egentligen?',
    description: 'Understanding how we speak, listen, and connect with each other',
    cardCount: 3,
  },
  {
    id: 'parenting-together',
    title: 'Uppfostringsstilar',
    entryLine: 'Ni gör det på olika sätt — och det är okej att prata om.',
    description: 'Navigating the shared journey of raising children',
    cardCount: 3,
  },
  {
    id: 'emotional-intimacy',
    title: 'Paridentitet vs föräldraidentitet',
    entryLine: 'Vem är ni för varandra, bortom föräldraskapet?',
    description: 'Deepening connection and understanding between partners',
    cardCount: 2,
  },
  {
    id: 'daily-life',
    title: 'Närhet & Intimitet',
    entryLine: 'De små stunderna som håller er nära.',
    description: 'The rhythms, routines, and small moments that shape us',
    cardCount: 2,
  },
  {
    id: 'individual-needs',
    title: 'Släkt & kultur',
    entryLine: 'Det ni bär med er — och hur det formar ert hem.',
    description: 'Balancing personal wellbeing within partnership',
    cardCount: 2,
  },
  {
    id: 'category-6',
    title: 'Pengar & föräldraskap',
    entryLine: 'Mod, trygghet och gemensamma ramar kring ekonomi.',
    description: 'Risk, värderingar och ekonomiska beslut som föräldrar',
    cardCount: 2,
  },
  {
    id: 'category-7',
    title: 'Motståndskraft innan det brister',
    entryLine: 'Hur ni håller ihop — även när det är svårt.',
    description: 'Sårbarhet, motgångar och att möta press tillsammans',
    cardCount: 2,
  },
  {
    id: 'category-8',
    title: 'Kommunikation & stöd',
    entryLine: 'Hur ni pratar — och hur ni lyssnar.',
    description: 'Enighet, reparation och att ge varandra utrymme',
    cardCount: 2,
  },
  {
    id: 'category-9',
    title: 'Värderingar & framtid',
    entryLine: 'Vad ni står för — och vart ni är på väg.',
    description: 'Värderingar under press och drömmar som kräver mod',
    cardCount: 2,
  },
  {
    id: 'category-10',
    title: 'Uthållighet',
    entryLine: 'Att fortsätta välja varandra — med öppna ögon.',
    description: 'När relationen ändrar riktning och valet att stanna blir aktivt',
    cardCount: 2,
  },
];

export const cards: Card[] = [
  {
    id: 'listening-presence',
    title: 'När dagen är slut',
    subtitle: 'Ansvar för hem och hushåll, återhämtning',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-1',
        type: 'opening',
        title: 'Öppnare',
        content: 'De här frågorna öppnar samtalet varsamt. Det finns inga rätta svar — bara er ärliga upplevelse.',
        prompts: [
          'När under dagen känner du att du kan släppa ansvaret?',
          'Vad behöver vara gjort eller sagt för att du ska kunna landa?',
          'Vad i vårt sätt att avsluta dagen gör att du fortfarande bär med dig tankar och ansvar när du ska somna?',
        ],
      },
      {
        id: 'reflective-1',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Ta er tid med de här. Ni kanske vill sitta med dem en stund innan ni pratar.',
        prompts: [
          'När märker du att du fortsätter med sysslor av vana snarare än av behov?',
          'Vad tror du att jag läser in när du fortsätter utan att säga något?',
        ],
      },
      {
        id: 'scenario-1',
        type: 'scenario',
        title: 'Scenario',
        content: 'Efter läggning gör ni olika saker. En fortsätter "lite till", den andra sätter sig. Ingen säger något, men båda drar egna slutsatser.',
        prompts: [
          'Vilka små tecken uppstår mellan er när dagen är slut för den ena, men inte för den andra?',
        ],
      },
      {
        id: 'exercise-1',
        type: 'exercise',
        title: 'Team Work',
        content: 'Välj en konkret handling eller mening som markerar att dagen är avslutad för er båda.',
        prompts: [
          'Prova i tre kvällar — och prata sedan om vad det förändrade.',
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
        title: 'Öppnare',
        content: 'Börja där det känns naturligt.',
        prompts: [
          'När känner du dig mest ifrågasatt i ditt sätt att vara förälder?',
          'När känner du dig tryggast i att göra saker på ditt eget sätt?',
          'I vilka stunder upplever du att våra olikheter blir tydliga för barnet?',
        ],
      },
      {
        id: 'reflective-2',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'De här frågorna bjuder in till att titta inåt.',
        prompts: [
          'När märker du att du försvarar ditt sätt att hantera situationer i förhållandet snarare än att beskriva det?',
          'I vilka lägen påverkar mitt sätt att hantera situationer hur trygg du känner dig i ditt eget?',
        ],
      },
      {
        id: 'scenario-2',
        type: 'scenario',
        title: 'Scenario',
        content: 'Ni gör samma saker, men på olika sätt. Barnet börjar navigera mellan er.',
        prompts: [
          'Hur påverkas ert samspel när olikheterna blir synliga i vardagen?',
        ],
      },
      {
        id: 'exercise-2',
        type: 'exercise',
        title: 'Team Work',
        content: 'Välj ett område där ni medvetet låter två sätt samexistera.',
        prompts: [
          'Prata om vad ni vill att barnet ska förstå — inte om vem som gör rätt.',
        ],
      },
    ],
  },
  {
    id: 'conflict-repair',
    title: 'Rollerna vi tar (och får)',
    subtitle: 'Roller som uppstår utan att ni valt dem',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-3',
        type: 'opening',
        title: 'Öppnare',
        content: 'Roller formas ofta utan att vi väljer dem.',
        prompts: [
          'Finns det en roll i familjen som känns mer självklar för dig än en roll du själv valt?',
          'När kliver du in i en roll utan att tänka efter?',
          'Vilken roll skulle du vilja ta mer plats i?',
        ],
      },
      {
        id: 'reflective-3',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'De här frågorna utforskar mönster och historia.',
        prompts: [
          'När märker du att en roll ger dig inflytande — och när begränsar den dig?',
          'Vad händer mellan oss när en av oss blir den som "kan mest"?',
        ],
      },
      {
        id: 'scenario-3',
        type: 'scenario',
        title: 'Scenario',
        content: 'En uppgift har blivit "din". Den andra kliver undan. Med tiden blir skillnaden självklar.',
        prompts: [
          'Hur påverkas relationen när roller inte längre ifrågasätts?',
        ],
      },
      {
        id: 'exercise-3',
        type: 'exercise',
        title: 'Team Work',
        content: 'Välj en etablerad roll att dela eller byta under en period.',
        prompts: [
          'Prata om vad som känns ovant — utan att rätta varandra.',
        ],
      },
    ],
  },
  {
    id: 'different-parenting-styles',
    title: 'Uppfostran vi ärvt',
    subtitle: 'Reaktioner formade av uppväxt',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-4',
        type: 'opening',
        title: 'Öppnare',
        content: 'Varje förälder bär med sig sin egen historia.',
        prompts: [
          'I vilka situationer märker du att din uppväxt talar genom dig?',
          'Vad från din bakgrund vill du föra vidare, även när det skaver mellan oss?',
          'När märks skillnaderna i hur vi uppfattar och reagerar på situationer som tydligast?',
        ],
      },
      {
        id: 'reflective-4',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Fundera på rötterna till era reaktioner.',
        prompts: [
          'När märker du att du reagerar utifrån din historia snarare än på situationen som är nu?',
          'Vad i vårt samspel gör sådana situationer extra laddade för dig?',
        ],
      },
      {
        id: 'scenario-4',
        type: 'scenario',
        title: 'Scenario',
        content: 'En vardagssituation väcker starka reaktioner. Den ena reagerar på händelsen, den andra på känslan som väcks.',
        prompts: [
          'Hur pratar ni om det som hände utan att avgöra vems reaktion som var rimligast?',
        ],
      },
      {
        id: 'exercise-4',
        type: 'exercise',
        title: 'Team Work',
        content: 'Bestäm en gemensam formulering ni kan använda i stunden.',
        prompts: [
          'Prata efteråt om vad den skyddade — och vad den inte gjorde.',
        ],
      },
    ],
  },
  {
    id: 'parenting-exhaustion',
    title: 'Mina, dina, våra värderingar',
    subtitle: 'Värderingar i vardagliga val',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-5',
        type: 'opening',
        title: 'Öppnare',
        content: 'Värderingar syns tydligast i vardagen.',
        prompts: [
          'Vilken värdering vill du att barnet ska känna i vårt sätt att vara, mot varandra och i familjen?',
          'När upplever du tydligast att vi vill visa olika saker i samma situation?',
          'Vilken värdering tycker du är svårast att leva efter i vardagen?',
        ],
      },
      {
        id: 'reflective-5',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'De här frågorna bjuder in till ärlighet om era val.',
        prompts: [
          'När märker du att du själv gör något som går emot en värdering du egentligen vill stå för?',
          'På vilka sätt gör vårt samspel det lättare — eller svårare — för dig att agera i linje med det som är viktigt för dig?',
        ],
      },
      {
        id: 'scenario-5',
        type: 'scenario',
        title: 'Scenario',
        content: 'Barnet beter sig respektlöst. En markerar direkt mot barnet. Den andra reagerar mer på hur gränsen sätts: ton, ordval eller situation.',
        prompts: [
          'När ni reagerar olika i stunden, vad är det som var och en av er försöker skydda just då?',
        ],
      },
      {
        id: 'exercise-5',
        type: 'exercise',
        title: 'Team Work',
        content: 'Nästa gång ni reagerar olika i en liknande situation: hur kan ni visa respekt för det som den andra försöker skydda, utan att ge upp det som är viktigt för dig själv?',
        prompts: [
          'Prata om hur detta skulle kunna märkas i ton, timing eller ordval — inte som en lösning, utan som ett sätt att förstå varandra bättre.',
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
        title: 'Öppnare',
        content: 'Gränssättning berör ofta mer än det som syns.',
        prompts: [
          'Vad betyder det för dig att säga ifrån på ett sätt som du kan stå för?',
          'När känner du dig mest osäker på hur vi markerar tillsammans?',
          'Vad väcker starkast reaktion i dig när barnet går över en gräns?',
        ],
      },
      {
        id: 'reflective-6a',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska vad som driver era reaktioner.',
        prompts: [
          'När märker du att din reaktion drivs av oro snarare än av situationen?',
          'Vad händer mellan oss när vi vill markera på olika sätt?',
        ],
      },
      {
        id: 'scenario-6a',
        type: 'scenario',
        title: 'Scenario',
        content: 'Ett beteende väcker olika impulser. Den ena vill agera direkt, den andra vill avvakta.',
        prompts: [
          'Hur påverkas samspelet när ni inte delar åsikt om timing?',
        ],
      },
      {
        id: 'exercise-6a',
        type: 'exercise',
        title: 'Team Work',
        content: 'Bestäm gemensamt två förhållningssätt: vad ni vill undvika att agera på i affekt — och vad som är viktigt att komma ihåg även när ni tycker olika.',
      },
    ],
  },
  {
    id: 'smallest-we',
    title: 'Vårt minsta \u201Cvi\u201D',
    subtitle: 'Det minsta ni kan göra för att hålla ihop i vardagen',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-7a',
        type: 'opening',
        title: 'Öppnare',
        content: 'Små saker som håller er nära.',
        prompts: [
          'Vad mellan oss skulle du lägga märke till först om det försvann?',
          'När känner du, även korta stunder, att vi är mer än ett team?',
          'Vad gör vi idag som vi inte gjorde för ett år sedan?',
        ],
      },
      {
        id: 'reflective-7a',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Stanna upp och känn efter.',
        prompts: [
          'När lägger du märke till att vårt \u201Cvi\u201D får mindre plats i vardagen, trots att ingen av er har valt bort det?',
          'Vad händer i dig när utrymmet för oss minskar — blir du tystare, mer effektiv, mer irriterad, mer ensam?',
        ],
      },
      {
        id: 'scenario-7a',
        type: 'scenario',
        title: 'Scenario',
        content: 'Allt fungerar. Men något som tidigare var självklart har blivit tyst.',
        prompts: [
          'Vilka tidiga tecken lägger ni märke till som kan tyda på att ert \u201Cvi\u201D håller på att krympa?',
        ],
      },
      {
        id: 'exercise-7a',
        type: 'exercise',
        title: 'Team Work',
        content: 'Välj en mycket liten handling eller aktivitet ni gör tillsammans tre gånger kommande vecka.',
        prompts: [
          'Se det som ett test, inte en lösning.',
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
        title: 'Öppnare',
        content: 'Vem har du blivit — och vem saknar du?',
        prompts: [
          'Vilken del av dig tar mindre plats idag än tidigare?',
          'Finns det något du håller tillbaka för att det känns opraktiskt?',
          'Finns det något du anpassat som faktiskt fungerar för dig?',
        ],
      },
      {
        id: 'reflective-8a',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska vad anpassningen kostar.',
        prompts: [
          'När märker du att anpassningen börjar kosta mer än den ger?',
          'Är det något i mitt sätt som gör det lättare — eller svårare — för dig att ta plats just nu?',
        ],
      },
      {
        id: 'scenario-8a',
        type: 'scenario',
        title: 'Scenario',
        content: 'En av er håller tillbaka behov för att vardagen ska fungera.',
        prompts: [
          'Hur skiljer ni mellan anpassning som val och anpassning som förlust?',
        ],
      },
      {
        id: 'exercise-8a',
        type: 'exercise',
        title: 'Team Work',
        content: 'Identifiera en sak vardera som ni idag håller tillbaka.',
        prompts: [
          'Prata om vad som skulle krävas för att den skulle få lite mer plats.',
        ],
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
        title: 'Öppnare',
        content: 'Närhet börjar med att förstå varandras språk.',
        prompts: [
          'Vilka små gester får dig att känna dig älskad?',
          'Vad får dig att känna närhet just nu oavsett om det leder till sex eller inte?',
          'När har vi senast tolkat varandras signaler om närhet på olika sätt?',
        ],
      },
      {
        id: 'reflective-9',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska hur ni läser varandra.',
        prompts: [
          'Vilka tecken hos mig tolkar du som en inbjudan — och vilka missar du lätt?',
          'När känns ett \u201Cnej\u201D som avvisande för dig — och när känns det som omsorg om er?',
        ],
      },
      {
        id: 'scenario-9',
        type: 'scenario',
        title: 'Scenario',
        content: 'Trötthet och längtan krockar. Den ena vill vara nära, den andra orkar inte. Trots goda intentioner smyger sig både press och tolkningar in.',
        prompts: [
          'Hur skiljer ni mellan att säga nej till fysisk närhet och ja till relationen?',
        ],
      },
      {
        id: 'exercise-9',
        type: 'exercise',
        title: 'Team Work',
        content: 'Skapa två tydliga signaler: \u201CJag längtar efter närhet\u201D och \u201CJag kan inte just nu, men jag vill dig\u201D.',
        prompts: [
          'Hur kan de se ut så att ingen behöver gissa?',
        ],
      },
    ],
  },
  {
    id: 'family-ab',
    title: 'När vårt \u201Cvi\u201D blir \u201CFamiljen AB\u201D',
    subtitle: 'Logistik som ersätter kontakt',
    categoryId: 'daily-life',
    sections: [
      {
        id: 'opening-10',
        type: 'opening',
        title: 'Öppnare',
        content: 'När samarbete tar över känslan.',
        prompts: [
          'När märker du att jag börjar låta mer som en kollega än en partner?',
          'Vad hos mig saknar du mest när vi fastnar i logistik?',
          'När känner du dig effektiv men inte sedd i det du gör?',
        ],
      },
      {
        id: 'reflective-10',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska gränsen mellan effektivitet och avstånd.',
        prompts: [
          'På vilka sätt kan ett starkt samarbete göra att känslor kommer i andra hand?',
          'När blir effektivitet ett sätt att vara nära — och när blir det ett sätt att slippa känna efter?',
        ],
      },
      {
        id: 'scenario-10',
        type: 'scenario',
        title: 'Scenario',
        content: 'Ni löser vardagen smidigt. Allt fungerar. Men samtalen handlar nästan bara om tider, ansvar och barn. Ingen längtar — men ingen klagar heller.',
        prompts: [
          'Hur länge kan en relation leva på funktion innan något viktigt tystnar i oss?',
        ],
      },
      {
        id: 'exercise-10',
        type: 'exercise',
        title: 'Team Work',
        content: 'Avsätt tio minuter en gång den här veckan där ni inte pratar om barn eller logistik.',
        prompts: [
          'Om ni inte har något att säga — sitt kvar ändå.',
        ],
      },
    ],
  },
  {
    id: 'family-voices',
    title: 'Röster från släkten',
    subtitle: 'Släktens påverkan och er samhörighet',
    categoryId: 'individual-needs',
    sections: [
      {
        id: 'opening-11',
        type: 'opening',
        title: 'Öppnare',
        content: 'Släktens röster bär både värme och vikt.',
        prompts: [
          'När känns släktens åsikter stöttande — och när känns de som ett intrång?',
          'När önskar du att jag stod tydligare på vår sida?',
          'Vad är viktigast för dig i mötet med släkten: harmoni eller tydlighet?',
        ],
      },
      {
        id: 'reflective-11',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska gränsen mellan stöd och påverkan.',
        prompts: [
          'När berikar olika perspektiv barnet, och när skapar de förvirring?',
          'När har anpassningen till släkten stärkt er som familj, och när har den kostat något viktigt?',
        ],
      },
      {
        id: 'scenario-11',
        type: 'scenario',
        title: 'Scenario',
        content: 'En släkting ifrågasätter er inför barnet. Det som sårar mest är inte orden, utan att ni inte är helt synkade i stunden.',
        prompts: [
          'Hur kan ni återta både er auktoritet och er samhörighet?',
        ],
      },
      {
        id: 'exercise-11',
        type: 'exercise',
        title: 'Team Work',
        content: 'Enas om en neutral mening ni alltid kan säga inför barnet — och ett sätt att ta upp oenighet mellan er i efterhand utan att skuldbelägga.',
      },
    ],
  },
  {
    id: 'our-traditions',
    title: 'Mina, dina, våra traditioner',
    subtitle: 'Tillhörighet och vad ni väljer att föra vidare',
    categoryId: 'individual-needs',
    sections: [
      {
        id: 'opening-12',
        type: 'opening',
        title: 'Öppnare',
        content: 'Traditioner berättar vilka ni är.',
        prompts: [
          'Vilken tradition eller återkommande firande bär mest betydelse för dig, bortom själva utförandet?',
          'När känner du att kompromisser gör att något som är viktigt för dig kan förloras?',
          'Vad hoppas du att våra traditioner eller återkommande firande säger om oss som familj?',
        ],
      },
      {
        id: 'reflective-12',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Vad behåller ni — och vad släpper ni?',
        prompts: [
          'Vilka traditioner vill vi bevara och vilka vill vi omforma? När suddar kompromisser ut mer än de förenar?',
        ],
      },
      {
        id: 'scenario-12',
        type: 'scenario',
        title: 'Scenario',
        content: 'När ni skapar något nytt blir det tydligt vad ni väljer bort. Barnet frågar varför vissa saker finns kvar och andra inte.',
        prompts: [
          'Hur berättar ni historien om er familj utan att någon känner sig raderad?',
        ],
      },
      {
        id: 'exercise-12',
        type: 'exercise',
        title: 'Team Work',
        content: 'Formulera en gemensam berättelse om varför ni valt just era traditioner.',
        prompts: [
          'Vad vill ni att barnet ska förstå om er genom dem?',
        ],
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
        title: 'Öppnare',
        content: 'Ekonomiska beslut berör mer än pengar.',
        prompts: [
          'När känns risk som utveckling för dig och när känns den som ett hot?',
          'Vad behöver du för att känna trygghet när vi tar ekonomiska beslut?',
          'Vilken sorts mod vill du att barnet ska se hos oss?',
        ],
      },
      {
        id: 'reflective-13',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska gränsen mellan mod och ansvar.',
        prompts: [
          'Vad behöver vara på plats för att en risk ska kännas ansvarsfull för er — inte bara modig?',
          'När upplever du att trygghet byggs mest: när risk undviks eller när den hanteras?',
        ],
      },
      {
        id: 'scenario-13',
        type: 'scenario',
        title: 'Scenario',
        content: 'En av er vill starta eget eller studera vidare, vilket innebär lägre inkomster under en period.',
        prompts: [
          'Hur sätter ni gemensamma ramar för risk och trygghet, och vilka tecken visar att balansen håller på att rubbas?',
        ],
      },
      {
        id: 'exercise-13',
        type: 'exercise',
        title: 'Team Work',
        content: 'Välj en möjlig framtida satsning (något ni kan tänka er att någon av er vill satsa på någon gång). Prata igenom:\n• Vad skulle vara bästa utfallet?\n• Vad skulle vara det värsta rimliga utfallet?\n• Vilken gräns skulle ni inte vilja passera (tid/pengar/ork)?\n• Vilka två tecken skulle betyda: \u201Cnu behöver vi bromsa\u201D?',
      },
    ],
  },
  {
    id: 'worth-spending-on',
    title: 'Värt att spendera på',
    subtitle: 'Vad som känns värdefullt att investera i; tid, energi, pengar',
    categoryId: 'category-6',
    sections: [
      {
        id: 'opening-14',
        type: 'opening',
        title: 'Öppnare',
        content: 'Vad är värt vad — och för vem?',
        prompts: [
          'Vad är enligt dig en formande erfarenhet för ett barn?',
          'Vilken upplevelse tycker du är värd att spara stort till — och varför?',
          'Vad hade du själv velat få vara med om som barn?',
        ],
      },
      {
        id: 'reflective-14',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska vad som driver era val.',
        prompts: [
          'Lär sig barn mest av upplevelser — eller av att se oss anstränga oss för något?',
          'Vad riskerar vi att signalera som värdefullt utan att vi tycker det?',
        ],
      },
      {
        id: 'scenario-14',
        type: 'scenario',
        title: 'Scenario',
        content: 'Ni står inför en kostsam satsning och märker att frågan väcker olika bilder av vad som är \u201Cvärt det\u201D. Barnet märker att något stort är på gång.',
        prompts: [
          'Hur avgör ni när det är värt det bortom prislappen?',
        ],
      },
      {
        id: 'exercise-14',
        type: 'exercise',
        title: 'Team Work',
        content: 'Enas om vad som gör satsningen värd pengarna, vad ni är beredda att avstå eller vänta med, och hur barnet får vara delaktigt i vägen dit.',
      },
    ],
  },
  {
    id: 'self-esteem-wavering',
    title: 'När självkänslan svajar',
    subtitle: 'Sårbarhet och förändrade roller',
    categoryId: 'category-7',
    sections: [
      {
        id: 'opening-15',
        type: 'opening',
        title: 'Öppnare',
        content: 'Självkänsla påverkar allt — även er.',
        prompts: [
          'När lägger du märke till att din självkänsla påverkar hur du tar plats i familjen?',
          'Vad är svårast för mig att se hos dig när du tvivlar på dig själv?',
          'Hur förändras samspelet mellan oss när en av oss känner sig mindre viktig?',
        ],
      },
      {
        id: 'reflective-15',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska vad som döljs bakom fasaden.',
        prompts: [
          'När märker du att du försöker framstå som stark eller fungerande, i stället för att visa hur du faktiskt har det i relationen?',
          'Vad hos dig blir svårare att stå upp för när du inte känner dig säker i din roll?',
        ],
      },
      {
        id: 'scenario-15',
        type: 'scenario',
        title: 'Scenario',
        content: 'En motgång gör att en av er börjar ta mindre plats (förlorat jobbet, misslyckats med ett projekt, gått upp i vikt). Det sägs inte rakt ut, men märks i din ton och ditt initiativ. Barnet anpassar sig.',
        prompts: [
          'Hur pratar ni om det som hänt utan att skapa hierarkier eller förstärka tvivel?',
        ],
      },
      {
        id: 'exercise-15',
        type: 'exercise',
        title: 'Team Work',
        content: 'Enas om vilka ord ni använder — och undviker — inför barnet när någon tvivlar på sig själv. Bestäm också vilka ansvar som tillfälligt kan skifta utan att någon tappar sin roll.',
        prompts: [
          'Syftet är att ingen ska tappa värde i familjen för att den tappar fotfästet.',
        ],
      },
    ],
  },
  {
    id: 'facing-adversity',
    title: 'Att möta motgångar',
    subtitle: 'Olika sätt att hantera press',
    categoryId: 'category-7',
    sections: [
      {
        id: 'opening-16',
        type: 'opening',
        title: 'Öppnare',
        content: 'Motgångar visar hur ni fungerar ihop.',
        prompts: [
          'Hur brukar du hantera motgång — genom att prata, agera eller dra dig undan?',
          'Vad känns mest stöttande för dig i svåra perioder?',
          'Vad gör det svårt för oss att möta motgång på olika sätt?',
        ],
      },
      {
        id: 'reflective-16',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska era olika strategier.',
        prompts: [
          'Hur visar sig era olika sätt att hantera motgång innan ni hinner prata om det?',
          'När hjälper det er att vara nära — och när hjälper det er mer att ta paus var för sig och komma tillbaka till varandra?',
        ],
      },
      {
        id: 'scenario-16',
        type: 'scenario',
        title: 'Scenario',
        content: 'Ni möter en svår period. En vill planera och agera, den andra behöver pausa och reflektera.',
        prompts: [
          'Hur skapar ni utrymme för båda sätten utan att lämna varandra?',
        ],
      },
      {
        id: 'exercise-16',
        type: 'exercise',
        title: 'Team Work',
        content: 'Tänk ut hur en vecka kan se ut där båda era sätt får plats — utan att det ena blir norm och det andra undantag.',
      },
    ],
  },
  {
    id: 'behind-the-scenes',
    title: 'Framför och bakom kulisserna',
    subtitle: 'Enighet, reparation och ansvar',
    categoryId: 'category-8',
    sections: [
      {
        id: 'opening-17',
        type: 'opening',
        title: 'Öppnare',
        content: 'Att vara på samma sida — vad innebär det egentligen?',
        prompts: [
          'När känner du dig mest skyddad av mig som förälder?',
          'När känns det som att vi inte riktigt är på samma sida?',
          'Vad behöver du efter en situation där vi agerat olika inför barnet?',
        ],
      },
      {
        id: 'reflective-17',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska skillnaden mellan fasad och äkta enighet.',
        prompts: [
          'Hur märks skillnaden mellan att visa enad front — och att känna sig enad bakom kulisserna?',
          'Vad händer mellan er när oenighet hanteras öppet i efterhand — jämfört med när den aldrig riktigt får utrymme?',
        ],
      },
      {
        id: 'scenario-17',
        type: 'scenario',
        title: 'Scenario',
        content: 'Efter en jobbig kväll tappar en av er tålamodet inför barnet. Den andra reagerar på det, men ni tar inte diskussionen där och då.',
        prompts: [
          'Hur tar ni ansvar för det som hände — både inför varandra och inför barnet?',
        ],
      },
      {
        id: 'exercise-17',
        type: 'exercise',
        title: 'Team Work',
        content: 'Bestäm hur ni signalerar \u201Cvi tar det sen\u201D, hur ni pratar om det utan att bli motparter, och hur ni visar barnet att vuxna också reparerar konflikter.',
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
        title: 'Öppnare',
        content: 'Utrymme kan vara kärlek — eller avstånd.',
        prompts: [
          'Hur märker du själv att du behöver utrymme innan det blir för mycket?',
          'Hur vill du att jag tolkar din tystnad?',
          'När känner du dig trygg i att jag stannar kvar, även utan att lösa något, när vi är i konflikt?',
        ],
      },
      {
        id: 'reflective-18',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska gränsen mellan omsorg och övergivande.',
        prompts: [
          'När känns det kärleksfullt att lämna den andre ifred — och när känns det som övergivande?',
          'När är det omtänksamt att stå kvar — och när blir det påträngande?',
        ],
      },
      {
        id: 'scenario-18',
        type: 'scenario',
        title: 'Scenario',
        content: 'En drar sig undan för att orka, den andra känner sig övergiven. Båda försöker skydda relationen.',
        prompts: [
          'Hur vet ni när utrymme hjälper — och när det börjar skapa avstånd?',
        ],
      },
      {
        id: 'exercise-18',
        type: 'exercise',
        title: 'Team Work',
        content: 'Kom överens om tydliga tecken för:\n• när jag behöver vara ifred\n• när jag behöver att du stannar\n• när jag inte vet vad jag behöver',
      },
    ],
  },
  {
    id: 'our-philosophy',
    title: 'Vår filosofi',
    subtitle: 'Värderingar under press',
    categoryId: 'category-9',
    sections: [
      {
        id: 'opening-19',
        type: 'opening',
        title: 'Öppnare',
        content: 'Värderingar testas i vardagen.',
        prompts: [
          'När är det svårast för dig att leva som du lär?',
          'Vilken värdering kompromissar du oftast bort i vardagen?',
          'När känner du stolthet över hur ni agerat som föräldrar?',
        ],
      },
      {
        id: 'reflective-19',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska vad ni verkligen prioriterar.',
        prompts: [
          'Vilken värdering försvarar ni snabbast — och vilken släpper ni först när det blir jobbigt?',
          'När blir ert behov av ordning en styrka för barnet — och när riskerar det att bli något barnet bara lyder utan att förstå?',
        ],
      },
      {
        id: 'scenario-19',
        type: 'scenario',
        title: 'Scenario',
        content: 'Barnet gör upprepade val som går emot era värderingar. Frustrationen växer.',
        prompts: [
          'Hur markerar ni ansvar utan att barnet tappar känslan av att ni står på samma sida?',
        ],
      },
      {
        id: 'exercise-19',
        type: 'exercise',
        title: 'Team Work',
        content: 'Skapa en gemensam värderingsstege: vad ni frågar först, när ni sätter gränser — och när konsekvens blir nödvändig.',
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
        title: 'Öppnare',
        content: 'Drömmar kräver mod — av er båda.',
        prompts: [
          'Vilken dröm i ditt liv kräver mod från oss båda?',
          'Vad behöver du för att våga satsa utan att relationen känns hotad?',
          'När upplever du att uppoffring stärker er — och när väcker den oro?',
        ],
      },
      {
        id: 'reflective-20',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska gränsen mellan stöd och obalans.',
        prompts: [
          'När känns uppoffring som omtanke — och när börjar det kännas som att ni tappar balans?',
          'Vilka små tecken hos er visar att \u201Cen period\u201D håller på att bli vardag?',
        ],
      },
      {
        id: 'scenario-20',
        type: 'scenario',
        title: 'Scenario',
        content: 'En av er vill satsa helhjärtat på något som under en tid tar mycket energi. Den andra stöttar, men oroar sig för balansen.',
        prompts: [
          'Vad behöver vara uttalat mellan er innan perioden börjar?',
        ],
      },
      {
        id: 'exercise-20',
        type: 'exercise',
        title: 'Team Work',
        content: 'Bestäm vilka tecken som visar att satsningen tar för mycket plats och hur ni då justerar innan det går ut över relationen.',
      },
    ],
  },
  {
    id: 'adrift',
    title: 'På drift',
    subtitle: 'När relationen långsamt ändrar riktning',
    categoryId: 'category-10',
    sections: [
      {
        id: 'opening-21',
        type: 'opening',
        title: 'Öppnare',
        content: 'Ibland märks förändringen inte förrän efteråt.',
        prompts: [
          'Vad gör ni mindre av idag än för ett år sedan, 5 år sedan, 10 år sedan?',
          'När känner du dig ensam trots att ni är tillsammans?',
          'När kände du dig senast vald av mig, inte bara inkluderad?',
        ],
      },
      {
        id: 'reflective-21',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska vad avstånd egentligen handlar om.',
        prompts: [
          'När märker ni att avstånd växer mest: efter en konflikt — eller efter långa perioder av artigt avstånd?',
          'Hur påverkar ert sätt att hantera avstånd relationens riktning över tid?',
        ],
      },
      {
        id: 'scenario-21',
        type: 'scenario',
        title: 'Scenario',
        content: 'Ni bråkar sällan. Men ni skrattar inte heller som förr. Närhet skjuts upp till \u201Csen\u201D.',
        prompts: [
          'Vilka tecken hos er gör att det känns som en tillfällig paus — och vilka tecken gör att det börjar kännas som ett nytt normalläge?',
        ],
      },
      {
        id: 'exercise-21',
        type: 'exercise',
        title: 'Team Work',
        content: 'Gör ett litet experiment i en vecka som bryter autopiloten (ett nytt sätt att hälsa, ta i varandra, fråga varandra frågor, vara nära varandra).',
        prompts: ['Prata sedan: förde det er närmare — eller visade det på ett avstånd mellan er?'],
      },
    ],
  },
  {
    id: 'choosing-to-stay',
    title: 'Att fortsätta välja',
    subtitle: 'Att aktivt prioritera relationen',
    categoryId: 'category-10',
    sections: [
      {
        id: 'opening-22',
        type: 'opening',
        title: 'Öppnare',
        content: 'Att stanna är också ett val.',
        prompts: [
          'När har du senast känt att du aktivt tog ställning för relationen — inte som reaktion, utan som eget val?',
          'Vad gör du i relationen idag som är ett val, inte en följd av ansvar eller vana?',
          'När känns det tydligast för dig att du skulle kunna välja annorlunda men fortsätter att välja oss?',
        ],
      },
      {
        id: 'reflective-22',
        type: 'reflective',
        title: 'Tankeväckare',
        content: 'Utforska skillnaden mellan att stanna och att välja.',
        prompts: [
          'Vad behöver du själv göra, eller ta ställning till, för att välja relationen när inget yttre pressar dig att göra det eller att ingen ställer en direkt fråga till dig?',
          'Hur märks det i en relation när båda parter vet att de väljer — inte bara fortsätter?',
        ],
      },
      {
        id: 'scenario-22',
        type: 'scenario',
        title: 'Scenario',
        content: 'Relationen fungerar. Inget är trasigt. Ni samarbetar, delar ansvar och tar er igenom vardagen. Samtidigt finns en tyst insikt om att relationer också är något man kan lämna — även utan konflikt.',
        prompts: [
          'Hur påverkar den insikten hur ni möter varandra i det som redan fungerar?',
        ],
      },
      {
        id: 'exercise-22',
        type: 'exercise',
        title: 'Team Work',
        content: 'Svara var för sig, utan att förklara eller försvara: \u201CVad gör att jag väljer oss just nu?\u201D',
        prompts: ['Lyssna utan att svara tillbaka.'],
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

