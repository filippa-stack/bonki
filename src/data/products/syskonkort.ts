import type { ProductManifest } from '@/types/product';
import type { Category, Card } from '@/types';

const categories: Category[] = [
  {
    id: 'sk-vi-blev-syskon',
    title: 'Vi blev syskon',
    subtitle: 'Hur allt började -- och vad vi delar.',
    description: 'Att få ett syskon och de tidiga minnena',
    cardCount: 4,
  },
  {
    id: 'sk-vi-ar-olika',
    title: 'Vi är olika',
    subtitle: 'Plats, personlighet och det som gör oss unika.',
    description: 'Unikhet, plats i syskonskaran och bonussyskon',
    cardCount: 3,
  },
  {
    id: 'sk-nar-det-skaver',
    title: 'När det skaver',
    subtitle: 'Rättvisa, svartsjuka och bråk som formar relationen.',
    description: 'Konflikter, delande och rättvisa',
    cardCount: 5,
  },
  {
    id: 'sk-nar-livet-forandras',
    title: 'När livet förändras',
    subtitle: 'Förlust, förändring och band som sträcker sig framåt.',
    description: 'Förlust och framtid',
    cardCount: 2,
  },
];

const cards: Card[] = [
  // ── K1: Vi blev syskon ──
  {
    id: 'sk-att-fa-ett-syskon',
    title: 'Att få ett syskon',
    subtitle: 'Den stora förändringen när familjen plötsligt blev en till',
    categoryId: 'sk-vi-blev-syskon',
    sections: [
      {
        id: 'sk-att-fa-ett-syskon-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur förändrades ditt liv när du fick veta att du skulle få ett syskon?',
          'Hur berättade dina vuxna att du skulle få ett syskon?',
          'Vilket råd skulle du ge någon som ska få ett syskon?',
          'Vad hade du önskat att du visste när du skulle bli någons syskon?',
          'Vilka fördelar och nackdelar finns med att ha syskon?',
          'Vad tror du att du kan göra, eller vad har du gjort, för att ditt syskon ska känna sig välkommet och älskat?',
        ],
      },
    ],
  },
  {
    id: 'sk-syskonminnen',
    title: 'Syskonminnen',
    subtitle: 'De stunder och berättelser som bara ni syskon delar',
    categoryId: 'sk-vi-blev-syskon',
    sections: [
      {
        id: 'sk-syskonminnen-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Beskriv ett favoritfoto där du och dina syskon är tillsammans. Vad minns du av den stunden?',
          'Har du och dina syskon skapat några egna traditioner? Vilka är de och hur började de?',
          'Vilket tror du är ditt syskons roligaste minne?',
          'Minns du vad du tänkte och kände första gången du träffade ditt syskon?',
        ],
      },
    ],
  },
  {
    id: 'sk-syskonkunskap',
    title: 'Syskonkunskap',
    subtitle: 'Hur väl känner man egentligen sitt syskon?',
    categoryId: 'sk-vi-blev-syskon',
    sections: [
      {
        id: 'sk-syskonkunskap-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Om du och ditt syskon skulle sova borta, vilka tre saker tror du att ditt syskon skulle ta med sig?',
          'Vem skulle ditt syskon vilja bjuda hem till en familjemiddag?',
          'Vad tror du att ditt syskon tycker är det svåraste med att vara syskon till dig?',
          'Vad tycker du är det bästa med att ha syskon? Vad tror du ditt syskon skulle svara?',
          'Har ditt syskon någon egenskap som ingen annan du känner har?',
        ],
      },
    ],
  },
  {
    id: 'sk-vanskap',
    title: 'Vänskap',
    subtitle: 'Syskons unika band -- en relation man inte väljer men kan vårda',
    categoryId: 'sk-vi-blev-syskon',
    sections: [
      {
        id: 'sk-vanskap-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur kan man älska sitt syskon en dag och vara jätteirriterad på dem nästa? Vad tror du händer i kroppen och i känslorna?',
          'På vilket sätt är din vänskap med ditt syskon annorlunda jämfört med andra vänskaper?',
          'Bästa vänner kan ibland sluta vara bästa vänner och välja att inte längre umgås. Hur är det att inte kunna göra detta val med ett syskon?',
          'Tror du att du och dina syskon kommer att vara vänner när ni är vuxna? Varför? Varför inte?',
        ],
      },
    ],
  },
  // ── K2: Vi är olika ──
  {
    id: 'sk-unik',
    title: 'Unik',
    subtitle: 'Vad som gör varje syskon till sin egen person -- likheter och olikheter',
    categoryId: 'sk-vi-ar-olika',
    sections: [
      {
        id: 'sk-unik-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vilka likheter har du och dina syskon?',
          'Vilka egenskaper har dina syskon som du inte har?',
          'Om någon skulle beskriva dig och ditt syskon med tre ord vardera, vad skulle den personen säga?',
          'Beskriv en egenskap hos ditt syskon som du är stolt över.',
          'Finns det sätt som ni beter er lika, trots att ni är olika? Berätta!',
          'Hur skulle någon som inte känner dig och ditt syskon förstå att ni är från samma familj?',
          'Vad tror du gör att ditt syskons kompisar gillar hen?',
        ],
      },
    ],
  },
  {
    id: 'sk-aldst-mitten-yngst',
    title: 'Äldst, mitten, yngst',
    subtitle: 'Hur platsen i syskonskaran formar ens roll och upplevelse i familjen',
    categoryId: 'sk-vi-ar-olika',
    sections: [
      {
        id: 'sk-aldst-mitten-yngst-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'På vilket sätt tror du att du blir behandlad olika beroende på om du är det yngsta, mellersta eller det äldsta syskonet?',
          'Borde det äldsta syskonet alltid ha mest ansvar? Är det rättvist?',
          'Om det finns tre syskon i en familj, vem tror du har mest fördelar -- det yngsta, det i mitten eller det äldsta? Förklara hur du tänker.',
          'Vilken plats i syskonskaran har du? Vad är bra med det? Skulle du vilja byta plats om du fick bestämma? Med vem, och varför?',
        ],
      },
    ],
  },
  {
    id: 'sk-bonussyskon',
    title: 'Bonussyskon',
    subtitle: 'Att få nya syskon via en ombildad familj -- möjligheter och utmaningar',
    categoryId: 'sk-vi-ar-olika',
    sections: [
      {
        id: 'sk-bonussyskon-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vilka fördelar kan finnas med att ha bonussyskon?',
          'Om du har bonussyskon -- vad har varit svårast att vänja sig vid? Om du inte har det, vad tror du hade kunnat vara svårt?',
          'Om en vän berättade att hen skulle få bonussyskon, vad skulle du ge för råd?',
          'Har du något gemensamt intresse eller tycker du om samma saker som dina bonussyskon?',
          'Hur har det påverkat dig att ha bonussyskon?',
        ],
      },
    ],
  },
  // ── K3: När det skaver ──
  {
    id: 'sk-konflikt',
    title: 'Konflikt',
    subtitle: 'Bråk mellan syskon -- varför det händer och vad man lär sig av det',
    categoryId: 'sk-nar-det-skaver',
    sections: [
      {
        id: 'sk-konflikt-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad är det vanligaste du och ditt syskon bråkar om?',
          'Kan det finnas något bra med att bråka med ett syskon?',
          'Vad är det löjligaste, tramsigaste eller dummaste som du och ditt syskon har bråkat om?',
          'Tror du att bråk med dina syskon har hjälpt dig att bli en bättre person eller familjemedlem?',
          'Hur brukar du göra för att lösa en konflikt eller ett bråk med ditt syskon?',
          'Hur brukar konflikter mellan dig och ditt syskon sluta? Hur gör ni för att bli vänner igen?',
        ],
      },
    ],
  },
  {
    id: 'sk-dela',
    title: 'Dela',
    subtitle: 'Att dela saker, utrymme och tid -- och vad det tränar oss i',
    categoryId: 'sk-nar-det-skaver',
    sections: [
      {
        id: 'sk-dela-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur skulle det kännas att ha samma födelsedag som ditt syskon?',
          'Vad gör ditt syskon om du inte delar med dig till hen?',
          'Berätta om ett tillfälle då du och ditt syskon ville ha eller ville göra samma sak samtidigt. Hur löste ni det?',
          'Vad tror du att du kan lära dig av att dela med dig till dina syskon?',
        ],
      },
    ],
  },
  {
    id: 'sk-rattvisa',
    title: 'Rättvisa',
    subtitle: 'Känslan av att bli behandlad ojämlikt -- och vad rättvisa egentligen betyder i en familj',
    categoryId: 'sk-nar-det-skaver',
    sections: [
      {
        id: 'sk-rattvisa-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Vad gör du om du känner dig orättvist behandlad av en vuxen?',
          'När kände du senast att du blev orättvist behandlad av en vuxen? Vad hände?',
          'Är det rättvist att vuxna jämför syskon med varandra? Förklara hur du tänker!',
          'Hur försöker de vuxna hemma lära er att behandla varandra rättvist? Tycker du att det fungerar?',
        ],
      },
    ],
  },
  {
    id: 'sk-uppmarksamhet',
    title: 'Uppmärksamhet',
    subtitle: 'Att dela på de vuxnas kärlek -- och vad som händer när det inte känns rättvist',
    categoryId: 'sk-nar-det-skaver',
    sections: [
      {
        id: 'sk-uppmarksamhet-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur känns det för dig när ett syskon får all uppmärksamhet från de vuxna?',
          'Vid vilket tillfälle skulle det kännas rätt att ett syskon fick mer uppmärksamhet än du?',
          'Kan du komma ihåg ett tillfälle då du kände dig avundsjuk på ditt syskon? Vad fick dig att känna så?',
          'Tror du att ditt syskon har varit avundsjuk på dig någon gång? För vad?',
        ],
      },
    ],
  },
  {
    id: 'sk-sjukdom',
    title: 'Sjukdom',
    subtitle: 'När ett syskon har en diagnos eller funktionsnedsättning -- hur påverkar det hela familjen?',
    categoryId: 'sk-nar-det-skaver',
    sections: [
      {
        id: 'sk-sjukdom-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur skulle ditt syskon hjälpa dig om du blev allvarligt sjuk eller fick en diagnos?',
          'Hur skulle ditt liv bli annorlunda om ditt syskon hade en funktionsnedsättning?',
          'Vad tror du att du skulle kunna lära dig om dig själv genom att leva med ett syskon med någon sorts funktionsnedsättning?',
          'Om du har ett syskon med en sjukdom eller funktionsnedsättning -- vill du berätta om hur det är?',
        ],
      },
    ],
  },
  // ── K4: När livet förändras ──
  {
    id: 'sk-forlora-ett-syskon',
    title: 'Förlora ett syskon',
    subtitle: 'Sorgen och saknadet när ett syskon inte längre finns',
    categoryId: 'sk-nar-livet-forandras',
    sections: [
      {
        id: 'sk-forlora-ett-syskon-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Hur skulle du trösta en vän som har förlorat ett syskon?',
          'Om du tänker på ett syskon som inte längre finns hos dig -- vad hjälper dig att minnas hen?',
          'Om du tänker på hur du vill bli ihågkommen av dina syskon i framtiden -- vad hoppas du att de minns om dig?',
          'Vad kan du göra för att hjälpa dig själv att må bättre när du saknar ett syskon?',
        ],
      },
    ],
  },
  {
    id: 'sk-framtid',
    title: 'Framtid',
    subtitle: 'Hur syskonrelationen kan se ut när ni båda är vuxna och lever era egna liv',
    categoryId: 'sk-nar-livet-forandras',
    sections: [
      {
        id: 'sk-framtid-opening',
        type: 'opening',
        title: 'Frågor',
        content: '',
        prompts: [
          'Om du skulle bli förälder, skulle du välja att ha mer än ett barn? Varför? Varför inte?',
          'Vilken händelse eller situation med ditt syskon tror du att du kommer vilja berätta om när du är äldre?',
          'Hur tror du att din relation med ditt syskon ser ut när ni båda är vuxna?',
          'Hur länge tror du att du kan vara utan kontakt med ditt syskon?',
          'Vad tror du kan ha hänt när vuxna inte längre har kontakt med sina (vuxna) syskon?',
          'Vad tror du gör att vuxna syskon håller kontakten och vill fortsätta träffas?',
        ],
      },
    ],
  },
];

export const syskonkortProduct: ProductManifest = {
  id: 'syskonkort',
  name: 'Syskon',
  slug: 'syskonkort',
  tagline: 'Om bandet som både skaver och håller.',
  description: 'Utforska syskonbandet och allt det innebär',
  headerTitle: 'Syskonband',
  accentColor: 'hsl(215, 80%, 33%)',
  accentColorMuted: 'hsl(215, 25%, 90%)',
  secondaryAccent: 'hsl(215, 80%, 33%)',
  backgroundColor: '#F2F8FC',
  ctaButtonColor: '#0F4E99',
  pronounMode: 'du',
  freeCardId: 'sk-syskonkunskap',
  ageLabel: '6+',
  categories,
  cards,
};