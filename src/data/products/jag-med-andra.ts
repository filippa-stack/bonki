import type { ProductManifest } from '@/types/product';
import type { Category, Card } from '@/types';

const categories: Category[] = [
  {
    id: 'jma-att-hora-till',
    title: 'Att höra till',
    subtitle: 'Hur det känns att vara med -- och ibland utanför.',
    description: 'Vänskap, kontakt och tillhörighet',
    cardCount: 4,
  },
  {
    id: 'jma-nar-vi-jamfor-oss',
    title: 'När vi jämför oss',
    subtitle: 'Press, prestation och att mäta sig mot andra.',
    description: 'Prestation, utseende och avund',
    cardCount: 4,
  },
  {
    id: 'jma-nar-det-skaver',
    title: 'När det skaver',
    subtitle: 'Bråk, misstag och det som gör ont mellan oss.',
    description: 'Konflikter, misslyckanden och skuld',
    cardCount: 5,
  },
  {
    id: 'jma-att-sta-stadig',
    title: 'Att stå stadig',
    subtitle: 'Att våga säga stopp och vara sann mot sig själv.',
    description: 'Gränser, integritet och mod',
    cardCount: 3,
  },
  {
    id: 'jma-vi-i-varlden',
    title: 'Vi i världen',
    subtitle: 'Hur vi påverkar varandra och samhället runt oss.',
    description: 'Respekt, sanning och acceptans',
    cardCount: 5,
  },
];

const cards: Card[] = [
  // ── K1: Att höra till ──
  {
    id: 'jma-vanskap',
    title: 'Vänskap',
    subtitle: 'Vad som gör en vänskap äkta -- och hur den kan förändras',
    categoryId: 'jma-att-hora-till',
    sections: [
      {
        id: 'jma-vanskap-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Varför tror du att din vän valde dig som vän?',
          'Varför valde du din vän?',
          'Har du blivit kompis med någon du inte tyckte om från början? Vad fick dig att ändra mening?',
          'Behöver man ha många vänner eller räcker det med en?',
        ],
      },
      {
        id: 'jma-vanskap-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'En kompis slutar höra av sig och verkar inte vilja ses mer. Kan hen bestämma att ni inte är vänner längre? Hur kan man tänka om en vänskap som inte blev som man hoppats?',
        ],
      },
    ],
  },
  {
    id: 'jma-kontakt',
    title: 'Kontakt',
    subtitle: 'Att läsa av hur någon mår -- och vad man gör med det man ser',
    categoryId: 'jma-att-hora-till',
    sections: [
      {
        id: 'jma-kontakt-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Kan man se på någon hur de mår, utan att de säger något? Vad brukar du titta på?',
          'Om någon säger att hen är glad men ser ledsen ut, vilket tror du stämmer?',
          'Om någons ord inte stämmer med det du ser, vad gör du då?',
        ],
      },
      {
        id: 'jma-kontakt-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du har en god vän som säger att allt är bra hemma, men en annan person har berättat att vännen kanske inte mår riktigt bra. Vad tänker du? Vad skulle du göra?',
        ],
      },
    ],
  },
  {
    id: 'jma-annorlunda',
    title: 'Annorlunda',
    subtitle: 'Att vara sig själv när omgivningen vill att man ska passa in',
    categoryId: 'jma-att-hora-till',
    sections: [
      {
        id: 'jma-annorlunda-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad tror du det innebär att "vara sig själv"? Är det samma sak som att vara annorlunda?',
          'Vad är det att vara annorlunda?',
          'Hur skulle du känna om någon tyckte att du skulle ändra dig?',
        ],
      },
      {
        id: 'jma-annorlunda-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du har börjat prova en egen klädstil som du trivs med. Dina närmsta två vänner vill att ni ska vara mer lika så att ni ser ut som ett gäng. Vad gör du?',
        ],
      },
    ],
  },
  {
    id: 'jma-utanfor',
    title: 'Utanför',
    subtitle: 'Känslan av att inte höra till -- och vad man kan göra för varandra',
    categoryId: 'jma-att-hora-till',
    sections: [
      {
        id: 'jma-utanfor-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Har du någon gång känt dig utanför? Hur kändes det?',
          'Vad skulle du ge för tips till någon som ska börja i en ny grupp där hen inte känner någon?',
        ],
      },
      {
        id: 'jma-utanfor-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Alla i klassen är bjudna till en fest utom en person. Hur tror du att den personen känner sig? Vad önskar du att du eller någon annan hade gjort eller sagt i den situationen?',
        ],
      },
    ],
  },
  // ── K2: När vi jämför oss ──
  {
    id: 'jma-duktig',
    title: 'Duktig',
    subtitle: 'Vem presterar man egentligen för -- sig själv eller andra?',
    categoryId: 'jma-nar-vi-jamfor-oss',
    sections: [
      {
        id: 'jma-duktig-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Har du någon gång gjort något bra eller presterat väl mest för att göra någon annan glad? Hur kändes det jämfört med när du gör det för din egen skull?',
          'Berätta om ett tillfälle när du var stolt över dig själv -- inte för att någon annan sa det, utan för att du själv kände det. Hur kändes det?',
          'Har du berättat för någon annan att du är stolt över dem eller att de gjort något bra? Vad hände och hur reagerade den personen?',
        ],
      },
      {
        id: 'jma-duktig-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du spelar fotboll tre dagar i veckan eftersom dina vuxna också gjorde det när de var små. De är alltid med på matcherna och hejar, och du vet att fotbollen är viktig för dem. Ibland är det jättekul att spela, men ibland önskar du att du fick vara hemma. Är du duktig för dig själv eller för de vuxnas skull?',
        ],
      },
    ],
  },
  {
    id: 'jma-tavla',
    title: 'Tävla',
    subtitle: 'Viljan att vinna -- och vad som händer när det inte går',
    categoryId: 'jma-nar-vi-jamfor-oss',
    sections: [
      {
        id: 'jma-tavla-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Varför tror du att det för många känns viktigt att vinna eller vara bäst?',
          'Berätta när du vann något -- hur kändes det?',
          'Vad kan man lära sig av att inte vinna?',
          'Om du kom tvåa eller sist, vad önskar du att någon skulle säga till dig då?',
        ],
      },
      {
        id: 'jma-tavla-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du håller på att vinna ett lopp på en kilometer. Precis bakom dig finns en elev som är ny i klassen och inte verkar trivas så bra. Vore det sjysst om du lät den personen vinna? Förklara.',
        ],
      },
    ],
  },
  {
    id: 'jma-utseende',
    title: 'Utseende',
    subtitle: 'Hur vi ser på oss själva och varandra -- och vad yttre egentligen säger',
    categoryId: 'jma-nar-vi-jamfor-oss',
    sections: [
      {
        id: 'jma-utseende-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad tycker du om med ditt utseende?',
          'Har du någon gång trott något om någon utifrån utseendet som inte har stämt?',
          'Vad kan göra ett utseende vackert eller fint, utöver att det passar in i ett ideal?',
        ],
      },
      {
        id: 'jma-utseende-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'En vän pratar ofta negativt om sitt eget utseende. Hur påverkar det dig att höra det? Vad kan du säga eller göra för att visa att du bryr dig?',
        ],
      },
    ],
  },
  {
    id: 'jma-avund',
    title: 'Avund',
    subtitle: 'Att längta efter det någon annan har -- och vad som ligger bakom det',
    categoryId: 'jma-nar-vi-jamfor-oss',
    sections: [
      {
        id: 'jma-avund-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Har du känt avundsjuka någon gång? På vad eller vem?',
          'Varför tror du att vissa människor verkar viktigare för andra om de har mycket pengar eller saker? Stämmer det egentligen?',
          'Tror du att man kan vara lycklig utan att ha mycket saker eller pengar? Vad är det i så fall som gör en lycklig?',
        ],
      },
      {
        id: 'jma-avund-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Din kusins familj har gott om pengar. De har regelbundna solsemestrar och till och med ett sommarhus vid kusten. Du hade gjort vad som helst för att ha det din kusin har, men din kusin verkar inte nöjd. Varför tror du att ni känner så olika?',
        ],
      },
    ],
  },
  // ── K3: När det skaver ──
  {
    id: 'jma-konflikt',
    title: 'Konflikt',
    subtitle: 'Bråk som en del av relationer -- och hur man tar sig igenom dem',
    categoryId: 'jma-nar-det-skaver',
    sections: [
      {
        id: 'jma-konflikt-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad kan vara början på en konflikt?',
          'Kan det vara bra att bråka med någon man tycker om?',
          'Kan du komma ihåg en gång när en vuxen blev arg eller besviken på dig? Vad hände och hur upplevde du det?',
          'Tror du att den vuxne förstod varför du gjorde det du gjorde?',
          'Vad tror du att vuxna bråkar om?',
        ],
      },
      {
        id: 'jma-konflikt-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du och din bästa kompis i skolan har bråkat om en sak och ni har inte pratat på flera dagar. Du står fast vid att hen hade fel. Skolan är slut för terminen. Hur löser ni detta?',
        ],
      },
    ],
  },
  {
    id: 'jma-misslyckas',
    title: 'Misslyckas',
    subtitle: 'Känslan av att ha gjort bort sig -- och vad man egentligen lär sig av det',
    categoryId: 'jma-nar-det-skaver',
    sections: [
      {
        id: 'jma-misslyckas-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'När gjorde du något som du trodde skulle bli bra men som inte blev som du tänkte dig?',
          'Vad hade du velat göra annorlunda?',
          'När kan det vara bra att misslyckas?',
          'Varför kan man känna sig misslyckad utan att ha misslyckats?',
          'Vad tror du kan hjälpa dig att må bättre när du känner att du har misslyckats?',
        ],
      },
      {
        id: 'jma-misslyckas-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Din vän känner sig misslyckad över ett prov i skolan. Hen vet att du klarade provet bra. Vad skulle du säga till din vän?',
        ],
      },
    ],
  },
  {
    id: 'jma-kritik',
    title: 'Kritik',
    subtitle: 'Att ge och ta emot återkoppling -- utan att det blir ett personangrepp',
    categoryId: 'jma-nar-det-skaver',
    sections: [
      {
        id: 'jma-kritik-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Har du blivit kritiserad för något? Hur kändes det?',
          'När kan det vara bra att få kritik?',
          'Finns det ett sätt att ge kritik som hjälper, och ett sätt som skadar? Vad är skillnaden?',
          'Hur tar man emot kritik för något man har gjort utan att känna sig kritiserad för den man är?',
        ],
      },
      {
        id: 'jma-kritik-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du lämnar in en skrivuppgift som du är stolt över. Den har tagit lång tid att skriva och du har även ritat en bild som passar till texten. Trots detta har läraren valt att bara kommentera dina stavfel. Hur känns det och tycker du att läraren gjorde rätt?',
        ],
      },
    ],
  },
  {
    id: 'jma-skam',
    title: 'Skam',
    subtitle: 'Känslan av att ha gjort fel inför andra -- och vad som egentligen triggar den',
    categoryId: 'jma-nar-det-skaver',
    sections: [
      {
        id: 'jma-skam-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Varför skäms vi ibland?',
          'Har någon annan tyckt att du borde skämmas för något som du själv inte känner är fel?',
          'Har du någon gång skämts för någon annan? Varför då?',
        ],
      },
      {
        id: 'jma-skam-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Det är övernattningsparty hos en kompis. Du har med dig din gosekanin som du har haft sedan du var liten. Du behöver den inte, men av vana följer den med. Någon tycker att det är fånigt och retar dig inför de andra. Vad gör du?',
        ],
      },
    ],
  },
  {
    id: 'jma-skuld',
    title: 'Skuld',
    subtitle: 'Att ha orsakat något som gick snett -- och vad ett äkta förlåt innebär',
    categoryId: 'jma-nar-det-skaver',
    sections: [
      {
        id: 'jma-skuld-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'När är det för sent att säga förlåt?',
          'Kan man visa sitt förlåt istället för att säga det?',
          'Har du någon gång sagt förlåt utan att mena det? Varför?',
          'När har du känt att du har fått skulden för något du inte har gjort?',
        ],
      },
      {
        id: 'jma-skuld-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du är på läger och säger något dumt till en du delar rum med. Det är sista kvällen på lägret och du kommer inte träffa personen igen vad du vet. Spelar det någon roll för dig eller för den andra om du inte säger förlåt?',
        ],
      },
    ],
  },
  // ── K4: Att stå stadig ──
  {
    id: 'jma-stopp',
    title: 'Stopp',
    subtitle: 'Att sätta och respektera gränser -- för sig själv och för andra',
    categoryId: 'jma-att-sta-stadig',
    sections: [
      {
        id: 'jma-stopp-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'När vet du att det är dags att säga stopp?',
          'När är det svårt att säga stopp?',
          'Hur hjälper man någon annan att säga stopp?',
          'Hur märker man att någon vill säga stopp utan att de har sagt stopp?',
        ],
      },
      {
        id: 'jma-stopp-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'En klasskompis beter sig på ett sätt som känns obehagligt för dig -- till exempel att stå för nära eller röra vid dig. Hur kan du berätta för den personen att du inte gillar det? Vad gör du om hen inte slutar?',
        ],
      },
    ],
  },
  {
    id: 'jma-integritet',
    title: 'Integritet',
    subtitle: 'Att stå för det man tror på -- även när det är svårt',
    categoryId: 'jma-att-sta-stadig',
    sections: [
      {
        id: 'jma-integritet-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad betyder det att ha integritet?',
          'När kan det vara svårt att säga nej eller vad man tycker?',
          'När kan det vara viktigt att stå upp för någon annan?',
        ],
      },
      {
        id: 'jma-integritet-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Du märker att några i klassen behandlar en klasskompis dåligt, och alla vet om det men ingen gör något. Vad stoppar folk från att ingripa? Vad tror du att du själv skulle kunna göra?',
        ],
      },
    ],
  },
  {
    id: 'jma-modig',
    title: 'Modig',
    subtitle: 'Att göra något svårt -- och att ibland vara modig nog att låta bli',
    categoryId: 'jma-att-sta-stadig',
    sections: [
      {
        id: 'jma-modig-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'När har du varit modig?',
          'Hur kändes det?',
          'Kan man vara modig för någon annans skull?',
          'Kan mod ibland leda till något negativt? Ge ett exempel.',
        ],
      },
      {
        id: 'jma-modig-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'I området finns en badanläggning som har öppet på sommaren. På kvällen är det stängt och ingen får vara där. Ditt kompisgäng ska dit och klättra över staketet för att bada sent på kvällen. Det finns risk att någon skadar sig eller att ni blir upptäckta. Vågar du? Varför är det modigt att våga göra det? Varför är det modigt att inte göra det?',
        ],
      },
    ],
  },
  // ── K5: Vi i världen ──
  {
    id: 'jma-respekt',
    title: 'Respekt',
    subtitle: 'Att behandla andra väl -- även när man tänker och tror olika',
    categoryId: 'jma-vi-i-varlden',
    sections: [
      {
        id: 'jma-respekt-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad betyder det att respektera någon?',
          'Varför är det viktigt att få respekt och visa respekt?',
        ],
      },
      {
        id: 'jma-respekt-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Två av dina kompisar tror på olika saker när det gäller religion. Kan man vara nära vänner trots det? Vad tror du kan göra det svårt, och vad kan hjälpa?',
        ],
      },
    ],
  },
  {
    id: 'jma-lika-varde',
    title: 'Lika värde',
    subtitle: 'Att alla människors åsikter och röster räknas lika mycket',
    categoryId: 'jma-vi-i-varlden',
    sections: [
      {
        id: 'jma-lika-varde-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur skulle det vara om alla vore lika?',
          'Vad gör dig olik andra?',
          'Är någon människa mer värd än någon annan?',
          'Finns det situationer där du tror att barn och vuxna borde ha lika mycket att säga till om? Ge ett exempel.',
        ],
      },
      {
        id: 'jma-lika-varde-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'I klassen pratar ni om hur ett kungarike ska styras. Många i klassen tycker att det ska finnas en kung, men det tycker inte du. När du uttrycker din åsikt skrattar några och tycker att du låter dum. Är din åsikt mindre värd för att inte lika många tycker som du? Varför?',
        ],
      },
    ],
  },
  {
    id: 'jma-sanning',
    title: 'Sanning',
    subtitle: 'Ärlighet och dess gränser -- när är det rätt att inte säga allt?',
    categoryId: 'jma-vi-i-varlden',
    sections: [
      {
        id: 'jma-sanning-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Kan sanningen vara olika för olika personer?',
          'Är det fel att inte säga sanningen?',
          'Om du gör någon glad genom att inte säga sanningen, är det okej?',
          'Hur känns det när någon är oärlig?',
        ],
      },
      {
        id: 'jma-sanning-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'En god vän har handlat nya kläder med pengar som hen fick i present. Du tycker inte att kläderna passar vännen, men hen verkar trivas i dem. Vad säger du när hen frågar vad du tycker?',
        ],
      },
    ],
  },
  {
    id: 'jma-acceptans',
    title: 'Acceptans',
    subtitle: 'Att lära sig leva med saker man inte kan förändra',
    categoryId: 'jma-vi-i-varlden',
    sections: [
      {
        id: 'jma-acceptans-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad betyder det att acceptera något?',
          'Hur vet man skillnaden mellan saker man bör acceptera och saker man bör försöka förändra?',
          'Hur känns det att behöva acceptera att någon inte tycker som du?',
        ],
      },
      {
        id: 'jma-acceptans-scenario',
        type: 'scenario',
        title: 'I verkligheten',
        content: '',
        prompts: [
          'Bills pappa var med i en olycka när Bill var liten. Han skadade sina ben och sitter i rullstol. Bill undrar om pappa är ledsen att han inte kan vara med och spela fotboll och leka som de andra vuxna. Då svarar pappa: "Jo det är jag. Men jag har accepterat det och det finns ju massa andra saker jag kan göra som de andra papporna inte kan!" Så drar han upp Bill i knäet och snurrar rullstolen åt sidan så att Bill kiknar av skratt. Hur menade pappa?',
        ],
      },
    ],
  },
  {
    id: 'jma-kluringen',
    title: 'Kluringen',
    subtitle: 'Ett tankeexperiment om vem man egentligen är -- när man möter sig själv',
    categoryId: 'jma-vi-i-varlden',
    sections: [
      {
        id: 'jma-kluringen-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Föreställ dig att du delar boende med en exakt kopia av dig själv. Hur tror du att det skulle gå? Vad tror du att ni skulle bråka om? Och vad tror du att du inte tål hos dig själv?',
        ],
      },
    ],
  },
];

export const jagMedAndraProduct: ProductManifest = {
  id: 'jag_med_andra',
  name: 'Jag med Andra',
  slug: 'jag-med-andra',
  tagline: 'Om vänskap, gränser och att vara en del av något större.',
  description: 'Utforska relationer och sociala sammanhang',
  headerTitle: 'Tillsammans',
  accentColor: 'hsl(32, 50%, 36%)',
  accentColorMuted: 'hsl(32, 28%, 90%)',
  categories,
  cards,
};