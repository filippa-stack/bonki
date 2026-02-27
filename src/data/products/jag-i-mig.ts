import type { ProductManifest } from '@/types/product';
import type { Category, Card } from '@/types';

const categories: Category[] = [
  {
    id: 'jim-tryggheten-inuti',
    title: 'Tryggheten inuti',
    description: 'Trygghet, ensamhet och stress',
    cardCount: 3,
  },
  {
    id: 'jim-kanslorna-jag-bar',
    title: 'Känslorna jag bär',
    description: 'Grundläggande känslor och hur de känns',
    cardCount: 5,
  },
  {
    id: 'jim-nar-det-gor-ont',
    title: 'När det gör ont',
    description: 'Svårare känslor att förstå och hantera',
    cardCount: 7,
  },
  {
    id: 'jim-jag-som-helhet',
    title: 'Jag som helhet',
    description: 'Att förstå sig själv som en hel person',
    cardCount: 6,
  },
];

const cards: Card[] = [
  // ── K1: Tryggheten inuti ──
  {
    id: 'jim-trygg',
    title: 'Trygg',
    categoryId: 'jim-tryggheten-inuti',
    sections: [
      {
        id: 'jim-trygg-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det att vara trygg?',
          'Varför är det viktigt att känna sig trygg?',
          'Hur får du någon annan att känna sig trygg?',
          'Berätta om när du känner dig trygg. Vad eller vem hjälper dig att känna dig trygg?',
        ],
      },
    ],
  },
  {
    id: 'jim-ensam',
    title: 'Ensam',
    categoryId: 'jim-tryggheten-inuti',
    sections: [
      {
        id: 'jim-ensam-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det att vara ensam?',
          'Varför tror du att du ibland kan känna dig ensam?',
          'Vad kan du göra när du inte vill vara ensam?',
          'Varför är det ibland skönt att vara ensam?',
          'Vad tror du är skillnaden mellan att vilja vara ensam och att känna sig ensam? Hur vet du skillnaden?',
          'När har du känt dig ensam och vad gjorde du då?',
        ],
      },
    ],
  },
  {
    id: 'jim-stress',
    title: 'Stress',
    categoryId: 'jim-tryggheten-inuti',
    sections: [
      {
        id: 'jim-stress-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Varför tror du att människor blir stressade?',
          'Har du någon gång känt dig stressad?',
          'Hur känns stress i kroppen?',
          'Vad brukar hjälpa dig när du känner dig stressad? Och hur kan man hjälpa en kompis som verkar stressad?',
          'Hur kan det bli problem av att känna för mycket stress?',
          'Vad kan barn känna sig stressade över? Är det annorlunda för vuxna, tror du?',
          'Känner du någon som ibland pratar om att de är stressade? Vad tror du gör dem stressade?',
        ],
      },
    ],
  },
  // ── K2: Känslorna jag bär ──
  {
    id: 'jim-glad',
    title: 'Glad',
    categoryId: 'jim-kanslorna-jag-bar',
    sections: [
      {
        id: 'jim-glad-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det i kroppen att vara glad?',
          'Vad vill du göra när du är glad?',
          'När kan du bli glad för någon annans skull?',
          'Har du någon gång låtsats vara glad fast du egentligen inte var det? Varför tror du att man gör så?',
          'Kan du bli glad av andras skratt?',
          'Hur kan du göra någon annan glad?',
          'När blev du senast riktigt glad för något?',
        ],
      },
    ],
  },
  {
    id: 'jim-ledsen',
    title: 'Ledsen',
    categoryId: 'jim-kanslorna-jag-bar',
    sections: [
      {
        id: 'jim-ledsen-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det i kroppen att vara ledsen?',
          'Vad vill du göra när du är ledsen?',
          'Kan du vara glad och ledsen på samma gång?',
          'Kan du bli ledsen för någon annans skull? Hur känns det?',
          'Hur kan du trösta någon som är ledsen?',
          'Vad vill du att andra ska göra eller säga när du är ledsen?',
          'Vad tror du kan göra en vuxen ledsen?',
          'Berätta vad som gör dig ledsen.',
        ],
      },
    ],
  },
  {
    id: 'jim-arg',
    title: 'Arg',
    categoryId: 'jim-kanslorna-jag-bar',
    sections: [
      {
        id: 'jim-arg-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det i kroppen att vara arg?',
          'Vad gör dig arg?',
          'Vad vill du göra när du är riktigt arg?',
          'Vad vill du att andra ska göra eller säga när du är arg?',
          'Tror du att barn och vuxna kan bli lika arga? Vad är lika och vad är annorlunda?',
          'Hur känns det när någon annan är arg på dig?',
          'Om du fick vara så arg du bara kan, vad skulle du göra då? Hur ser du ut?',
        ],
      },
    ],
  },
  {
    id: 'jim-radd',
    title: 'Rädd',
    categoryId: 'jim-kanslorna-jag-bar',
    sections: [
      {
        id: 'jim-radd-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det i kroppen att vara rädd?',
          'Vad kan du göra när något eller någon skrämmer dig?',
          'Vad vill du att andra ska göra när du är rädd?',
          'Kan man vara rädd för något man inte kan se? Hur kan det vara så?',
          'Vet du något som skrämmer någon annan men som du inte är rädd för?',
          'Vad är du rädd för?',
        ],
      },
    ],
  },
  {
    id: 'jim-vild',
    title: 'Vild',
    categoryId: 'jim-kanslorna-jag-bar',
    sections: [
      {
        id: 'jim-vild-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det i kroppen att vara vild?',
          'När känner du dig vild?',
          'Kan du känna dig vild på olika sätt?',
          'Tror du att vuxna kan känna sig vilda på samma sätt som barn?',
          'Varför tror du att vuxna ibland ber barn att vara mindre vilda?',
          'Hur känns det för dig när någon annan är riktigt vild?',
          'Om du fick vara riktigt vild en dag, vad skulle du göra då?',
        ],
      },
    ],
  },
  // ── K3: När det gör ont ──
  {
    id: 'jim-besviken',
    title: 'Besviken',
    categoryId: 'jim-nar-det-gor-ont',
    sections: [
      {
        id: 'jim-besviken-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad betyder det att vara besviken? Är det annorlunda från att vara arg?',
          'Hur ser du ut när du är besviken? Hur ser dina vuxna ut?',
          'Har en vuxen eller kompis någon gång berättat att de var besvikna på dig? Hur kändes det?',
          'Vad kan du göra när någon är besviken på dig?',
          'Har du någon gång blivit besviken på någon eller något? Vad hände?',
        ],
      },
    ],
  },
  {
    id: 'jim-acklad',
    title: 'Äcklad',
    categoryId: 'jim-nar-det-gor-ont',
    sections: [
      {
        id: 'jim-acklad-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur ser du ut när du känner äckel?',
          'Varför tror du att vi känner äckel eller avsmak för saker?',
          'Vad är det äckligaste du vet?',
          'Vad vill du göra när du känner äckel?',
          'Varför kan olika personer tycka att olika saker är äckliga?',
          'När kände du dig senast äcklad och vad gjorde du då?',
        ],
      },
    ],
  },
  {
    id: 'jim-avsky',
    title: 'Avsky',
    categoryId: 'jim-nar-det-gor-ont',
    sections: [
      {
        id: 'jim-avsky-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns avsky?',
          'Hur ser du ut när du känner avsky?',
          'Varför tror du att människor känner avsky?',
          'Varför tror du att avsky ibland kan vara ett jobbigt eller obehagligt sätt att känna?',
          'Hur kan du göra för att känna mindre avsky?',
          'Har du känt avsky mot något? Vad var det och vad gjorde du?',
        ],
      },
    ],
  },
  {
    id: 'jim-skam',
    title: 'Skam',
    categoryId: 'jim-nar-det-gor-ont',
    sections: [
      {
        id: 'jim-skam-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det i kroppen när du skäms?',
          'Varför tror du att människor skäms?',
          'Vad kan du skämmas över? Vad vill du göra då?',
          'Vad kan du göra för att skämmas mindre?',
          'Är det lätt eller svårt att berätta för någon att du skäms? Varför tror du det är så?',
          'Om du vill, berätta om en gång du känt dig skamsen.',
        ],
      },
    ],
  },
  {
    id: 'jim-avundsjuk',
    title: 'Avundsjuk',
    categoryId: 'jim-nar-det-gor-ont',
    sections: [
      {
        id: 'jim-avundsjuk-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns avundsjuka?',
          'Varför tror du att människor känner avundsjuka?',
          'Vad kan du bli avundsjuk på?',
          'Varför kan det kännas viktigt att ha det som andra har?',
          'Har du känt dig avundsjuk ibland, även om vuxna sagt att allt är rättvist? Hur kändes det då?',
          'Vad tror du vuxna kan vara avundsjuka på?',
          'Hur kan du tänka för att känna dig mindre avundsjuk?',
        ],
      },
    ],
  },
  {
    id: 'jim-svartsjuk',
    title: 'Svartsjuk',
    categoryId: 'jim-nar-det-gor-ont',
    sections: [
      {
        id: 'jim-svartsjuk-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur skiljer sig svartsjuka från avundsjuka?',
          'Hur känns det att vara svartsjuk?',
          'Varför tror du att människor känner svartsjuka?',
          'Har du varit svartsjuk någon gång? Vad gjorde du då?',
          'När kan det bli problem av att känna svartsjuka?',
          'Hur kan man dela på en persons uppmärksamhet och kärlek med andra? Vad hjälper dig att känna dig trygg ändå?',
        ],
      },
    ],
  },
  {
    id: 'jim-utanfor',
    title: 'Utanför',
    categoryId: 'jim-nar-det-gor-ont',
    sections: [
      {
        id: 'jim-utanfor-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det att inte få vara med?',
          'Varför tror du att det är viktigt att känna att man får vara med?',
          'Vad kan du göra för att ingen annan ska känna sig utanför?',
          'Måste man leka med någon som behandlar en dåligt? Varför eller varför inte?',
          'Hur kan du förklara varför någon inte fick vara med i leken?',
          'Hur kan du leka med någon även om ni tycker olika saker är kul?',
          'När har du känt dig utanför och vad gjorde du då?',
        ],
      },
    ],
  },
  // ── K4: Jag som helhet ──
  {
    id: 'jim-stolt',
    title: 'Stolt',
    categoryId: 'jim-jag-som-helhet',
    sections: [
      {
        id: 'jim-stolt-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur ser du ut när du är stolt?',
          'Vad kan människor vara stolta över?',
          'Vad vill du göra när du är stolt?',
          'När kan du vara stolt över någon annan?',
          'Vad tror du vuxna känner sig stolta över?',
          'Berätta om en gång då du känt dig stolt.',
        ],
      },
    ],
  },
  {
    id: 'jim-bestamd',
    title: 'Bestämd',
    categoryId: 'jim-jag-som-helhet',
    sections: [
      {
        id: 'jim-bestamd-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur ser du ut när du är bestämd?',
          'Hur vet du att du är bestämd? Hur känns det?',
          'Varför är det viktigt att kunna vara bestämd?',
          'Finns det tillfällen när det kan vara bra att lyssna mer på andra och vara mer flexibel? Berätta.',
          'Vet du någon som ofta är bestämd?',
          'Berätta om en gång när du var bestämd.',
        ],
      },
    ],
  },
  {
    id: 'jim-karlek',
    title: 'Kärlek',
    categoryId: 'jim-jag-som-helhet',
    sections: [
      {
        id: 'jim-karlek-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det att vara älskad?',
          'Hur kan du visa kärlek och att du tycker om någon utan ord?',
          'Hur kan kärlek se ut mellan olika människor?',
          'Kan du känna olika sorters kärlek?',
          'Är det samma sak att älska ett husdjur som att älska en person?',
          'Berätta om någon eller något du älskar.',
        ],
      },
    ],
  },
  {
    id: 'jim-nyfiken',
    title: 'Nyfiken',
    categoryId: 'jim-jag-som-helhet',
    sections: [
      {
        id: 'jim-nyfiken-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det i kroppen att vara nyfiken?',
          'Vad vill du göra när du är nyfiken?',
          'Vad kan vara bra med att vara nyfiken?',
          'När kan du hamna i trubbel av att vara nyfiken?',
          'Varför tror du att människor vill veta så mycket?',
          'Vad önskar du att du visste mer om?',
          'Om du visste var din födelsedagspresent var gömd, skulle du gå och titta på den? Varför? Varför inte?',
        ],
      },
    ],
  },
  {
    id: 'jim-forvanad',
    title: 'Förvånad',
    categoryId: 'jim-jag-som-helhet',
    sections: [
      {
        id: 'jim-forvanad-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur ser du ut när du är förvånad?',
          'Varför kan det vara kul att bli förvånad?',
          'Vad gör du när du blir förvånad?',
          'Vad kan du göra för att överraska någon?',
          'Vad kan vara skillnaden mellan en bra och en dålig överraskning?',
          'Berätta om en gång då du blev förvånad.',
        ],
      },
    ],
  },
  {
    id: 'jim-jag',
    title: 'Jag',
    categoryId: 'jim-jag-som-helhet',
    sections: [
      {
        id: 'jim-jag-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur mår du just nu, på riktigt?',
          'Vad är det bästa med dig?',
          'Vilken känsla gillar du mest?',
          'Om du fick dela en känsla med någon du litar på, vilken känsla skulle det vara -- och vem skulle du dela den med?',
          'Om en vän skulle beskriva dig, vad tror du den personen skulle säga?',
        ],
      },
    ],
  },
];

export const jagIMigProduct: ProductManifest = {
  id: 'jag_i_mig',
  name: 'Jag i Mig',
  slug: 'jag-i-mig',
  tagline: 'Känslokort för barn',
  description: 'Utforska känslor inifrån och ut',
  headerTitle: 'Inifrån & ut',
  categories,
  cards,
};
