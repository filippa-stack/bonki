import type { ProductManifest } from '@/types/product';
import type { Category, Card } from '@/types';
import heroImage from '@/assets/illustration-jag-med-andra.png';

const categories: Category[] = [
  { id: 'jma-vem-ar-jag', title: 'Att höra till', subtitle: 'Att hitta sin plats — bland andra och i sig själv.', description: 'Olikhet, utseende, jämlikhet, utanförskap och acceptans', cardCount: 5 },
  { id: 'jma-jag-och-andra', title: 'Att vara nära', subtitle: 'Det som händer mellan människor — i det nära och det ärliga.', description: 'Kontakt, vänskap, respekt, sanning och integritet', cardCount: 5 },
  { id: 'jma-varlden-omkring-mig', title: 'När det blir svårt', subtitle: 'Konflikter, gränser och känslan av att ha gjort fel.', description: 'Tävling, konflikt, kritik, gränser och skuld', cardCount: 5 },
  { id: 'jma-vad-tror-jag-pa', title: 'Att vara sig själv', subtitle: 'Press, mod och de stora frågorna om vem en är.', description: 'Prestation, avund, skam, misslyckande, mod och tankeexperiment', cardCount: 6 },
];

const cards: Card[] = [
  // ── K1: Att höra till ──
  {
    id: 'jma-annorlunda', title: 'Olik', subtitle: 'Att vara sig själv när omgivningen vill att en ska passa in',
    categoryId: 'jma-vem-ar-jag',
    sections: [{ id: 'jma-annorlunda-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad tror du det innebär att "vara sig själv"? Är det samma sak som att vara annorlunda?',
      'Vad är det som gör att du uppfattar någon som annorlunda?',
      'Har du någon gång känt dig annorlunda? Vad gjorde att du kände så?',
      'Hur skulle du känna om någon tyckte att du skulle ändra dig?',
      'Du har börjat prova en egen klädstil som du trivs med. Dina närmsta två vänner vill att ni ska vara mer lika så att ni ser ut som ett gäng. Vad gör du?',
    ]}],
  },
  {
    id: 'jma-utseende', title: 'Utseende', subtitle: 'Hur vi ser på oss själva och varandra – och vad yttre egentligen säger',
    categoryId: 'jma-vem-ar-jag',
    sections: [{ id: 'jma-utseende-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad tycker du om med ditt utseende?',
      'Har du någon gång trott något om någon utifrån utseendet som inte har stämt?',
      'Vad kan göra ett utseende vackert eller fint, utöver att det passar in i ett ideal?',
      'En vän pratar ofta negativt om sitt eget utseende. Hur påverkar det dig att höra det? Vad kan du säga eller göra för att visa att du bryr dig?',
    ]}],
  },
  {
    id: 'jma-lika-varde', title: 'Jämlikhet', subtitle: 'Att alla människors åsikter och röster räknas lika mycket',
    categoryId: 'jma-vem-ar-jag',
    sections: [{ id: 'jma-lika-varde-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Hur skulle det vara om alla vore lika?',
      'Vad gör dig olik andra?',
      'Är någon människa mer värd än någon annan?',
      'Finns det situationer där du tror att barn och vuxna borde ha lika mycket att säga till om? Ge ett exempel.',
      'I klassen pratar ni om hur ett kungarike ska styras. Många i klassen tycker att det ska finnas en kung, men det tycker inte du. När du uttrycker din åsikt skrattar några och tycker att du låter dum. Är din åsikt mindre värd för att inte lika många tycker som du? Varför?',
    ]}],
  },
  {
    id: 'jma-utanfor', title: 'Utanför', subtitle: 'Känslan av att inte höra till – och vad en kan göra för varandra',
    categoryId: 'jma-vem-ar-jag',
    sections: [{ id: 'jma-utanfor-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har du någon gång känt dig utanför? Hur kändes det?',
      'Vad skulle du ge för tips till någon som ska börja i en ny grupp där hen inte känner någon?',
      'Alla i klassen är bjudna till en fest utom en person. Hur tror du att den personen känner sig? Vad önskar du att du eller någon annan hade gjort eller sagt i den situationen?',
    ]}],
  },
  {
    id: 'jma-acceptans', title: 'Acceptans', subtitle: 'Att lära sig leva med saker en inte kan förändra',
    categoryId: 'jma-vem-ar-jag',
    sections: [{ id: 'jma-acceptans-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad betyder det att acceptera något?',
      'Hur vet en skillnaden mellan saker en bör acceptera och saker en bör försöka förändra?',
      'Hur känns det att behöva acceptera att någon inte tycker som du?',
      'Bills pappa var med i en olycka när Bill var liten. Han skadade sina ben och sitter i rullstol. Bill undrar om pappa är ledsen att han inte kan vara med och spela fotboll och leka som de andra vuxna. Då svarar pappa: "Jo det är jag. Men jag har accepterat det och det finns ju massa andra saker jag kan göra som de andra papporna inte kan!" Så drar han upp Bill i knäet och snurrar rullstolen åt sidan så att Bill kiknar av skratt. Hur menade pappa?',
    ]}],
  },
  // ── K2: Att vara nära ──
  {
    id: 'jma-kontakt', title: 'Kontakt', subtitle: 'Att läsa av hur någon mår – och vad en gör med det en ser',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-kontakt-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Kan en se på någon hur de mår, utan att de säger något? Vad brukar du titta på?',
      'Om någon säger att hen är glad men ser ledsen ut, vilket tror du stämmer?',
      'Om någons ord inte stämmer med det du ser, vad gör du då?',
      'Du har en god vän som säger att allt är bra hemma, men en annan person har berättat att vännen kanske inte mår riktigt bra. Vad tänker du? Vad skulle du göra?',
    ]}],
  },
  {
    id: 'jma-vanskap', title: 'Vänskap', subtitle: 'Vad som gör en vänskap äkta – och hur den kan förändras',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-vanskap-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Varför tror du att din vän valde dig som vän?',
      'Varför valde du din vän?',
      'Har du blivit kompis med någon du inte tyckte om från början? Vad fick dig att ändra mening?',
      'Behöver en ha många vänner eller räcker det med en?',
      'En kompis slutar höra av sig och verkar inte vilja ses mer. Kan hen bestämma att ni inte är vänner längre? Hur kan en tänka om en vänskap som inte blev som en hoppats?',
    ]}],
  },
  {
    id: 'jma-respekt', title: 'Respekt', subtitle: 'Att behandla andra väl – även när en tänker och tror olika',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-respekt-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad betyder det att respektera någon?',
      'Varför är det viktigt att få respekt och visa respekt?',
      'Två av dina kompisar tror på olika saker när det gäller religion. Kan en vara nära vänner trots det? Vad tror du kan göra det svårt, och vad kan hjälpa?',
    ]}],
  },
  {
    id: 'jma-sanning', title: 'Sanning', subtitle: 'Ärlighet och dess gränser – när är det rätt att inte säga allt?',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-sanning-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Kan sanningen vara olika för olika personer?',
      'Är det fel att inte säga sanningen?',
      'Om du gör någon glad genom att inte säga sanningen, är det okej?',
      'Hur känns det när någon är oärlig?',
      'En god vän har handlat nya kläder med pengar som hen fick i present. Du tycker inte att kläderna passar vännen, men hen verkar trivas i dem. Vad säger du när hen frågar vad du tycker?',
    ]}],
  },
  {
    id: 'jma-integritet', title: 'Integritet', subtitle: 'Att stå för det en tror på – även när det är svårt',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-integritet-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad betyder det att ha integritet?',
      'När kan det vara svårt att säga nej eller vad en tycker?',
      'När kan det vara viktigt att stå upp för någon annan?',
      'Du märker att några i klassen behandlar en klasskompis dåligt, och alla vet om det men ingen gör något. Vad stoppar folk från att ingripa? Vad tror du att du själv skulle kunna göra?',
    ]}],
  },
  // ── K3: När det blir svårt ──
  {
    id: 'jma-tavla', title: 'Tävling', subtitle: 'Viljan att vinna – och vad som händer när det inte går',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-tavla-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Varför tror du att det för många känns viktigt att vinna eller vara bäst?',
      'Berätta när du vann något -- hur kändes det?',
      'Vad kan en lära sig av att inte vinna?',
      'Om du kom tvåa eller sist, vad önskar du att någon skulle säga till dig då?',
      'Du håller på att vinna ett lopp på en kilometer. Precis bakom dig finns en elev som är ny i klassen och inte verkar trivas så bra. Vore det sjysst om du lät den personen vinna? Förklara.',
    ]}],
  },
  {
    id: 'jma-konflikt', title: 'Konflikt', subtitle: 'Bråk som en del av relationer – och hur en tar sig igenom dem',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-konflikt-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad kan vara början på en konflikt?',
      'Kan det vara bra att bråka med någon en tycker om?',
      'Kan du komma ihåg en gång när en vuxen blev arg eller besviken på dig? Vad hände och hur upplevde du det?',
      'Tror du att den vuxne förstod varför du gjorde det du gjorde?',
      'Vad tror du att vuxna bråkar om?',
      'Du och din bästa kompis i skolan har bråkat om en sak och ni har inte pratat på flera dagar. Du står fast vid att hen hade fel. Skolan är slut för terminen. Hur löser ni detta?',
    ]}],
  },
  {
    id: 'jma-kritik', title: 'Kritik', subtitle: 'Att ge och ta emot återkoppling – utan att det blir ett personangrepp',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-kritik-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har du blivit kritiserad för något? Hur kändes det?',
      'När kan det vara bra att få kritik?',
      'Finns det ett sätt att ge kritik som hjälper, och ett sätt som skadar? Vad är skillnaden?',
      'Hur tar en emot kritik för något en har gjort utan att känna sig kritiserad för den en är?',
      'Du lämnar in en skrivuppgift som du är stolt över. Den har tagit lång tid att skriva och du har även ritat en bild som passar till texten. Trots detta har läraren valt att bara kommentera dina stavfel. Hur känns det och tycker du att läraren gjorde rätt?',
    ]}],
  },
  {
    id: 'jma-stopp', title: 'Stopp', subtitle: 'Att sätta och respektera gränser – för sig själv och för andra',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-stopp-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'När vet du att det är dags att säga stopp?',
      'När är det svårt att säga stopp?',
      'Hur hjälper en någon annan att säga stopp?',
      'Hur märker en att någon vill säga stopp utan att de har sagt stopp?',
      'En klasskompis beter sig på ett sätt som känns obehagligt för dig -- till exempel att stå för nära eller röra vid dig. Hur kan du berätta för den personen att du inte gillar det? Vad gör du om hen inte slutar?',
    ]}],
  },
  {
    id: 'jma-skuld', title: 'Skuld', subtitle: 'Att ha orsakat något som gick snett – och vad ett äkta förlåt innebär',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-skuld-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'När är det för sent att säga förlåt?',
      'Kan en visa sitt förlåt istället för att säga det?',
      'Har du någon gång sagt förlåt utan att mena det? Varför?',
      'När har du känt att du har fått skulden för något du inte har gjort?',
      'Du är på läger och säger något dumt till en du delar rum med. Det är sista kvällen på lägret och du kommer inte träffa personen igen vad du vet. Spelar det någon roll för dig eller för den andra om du inte säger förlåt?',
    ]}],
  },
  // ── K4: Att vara sig själv ──
  {
    id: 'jma-duktig', title: 'Prestation', subtitle: 'Vem presterar en egentligen för – sig själv eller andra?',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-duktig-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har du någon gång gjort något bra eller presterat väl mest för att göra någon annan glad? Hur kändes det jämfört med när du gör det för din egen skull?',
      'Berätta om ett tillfälle när du var stolt över dig själv – inte för att någon annan sa det, utan för att du själv kände det. Hur kändes det?',
      'Har du berättat för någon annan att du är stolt över dem eller att de gjort något bra? Vad hände och hur reagerade den personen?',
      'Du spelar fotboll tre dagar i veckan eftersom dina vuxna också gjorde det när de var små. De är alltid med på matcherna och hejar, och du vet att fotbollen är viktig för dem. Ibland är det jättekul att spela, men ibland önskar du att du fick vara hemma. Är du duktig för dig själv eller för de vuxnas skull?',
    ]}],
  },
  {
    id: 'jma-avund', title: 'Avundsjuka', subtitle: 'Att längta efter det någon annan har – och vad som ligger bakom det',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-avund-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har du känt avundsjuka någon gång? På vad eller vem?',
      'Varför tror du att vissa människor verkar viktigare för andra om de har mycket pengar eller saker? Stämmer det egentligen?',
      'Tror du att en kan vara lycklig utan att ha mycket saker eller pengar? Vad är det i så fall som gör en lycklig?',
      'Din kusins familj har gott om pengar. De har regelbundna solsemestrar och till och med ett sommarhus vid kusten. Du hade gjort vad som helst för att ha det din kusin har, men din kusin verkar inte nöjd. Varför tror du att ni känner så olika?',
    ]}],
  },
  {
    id: 'jma-skam', title: 'Skam', subtitle: 'Känslan av att ha gjort fel inför andra – och vad som egentligen triggar den',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-skam-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Varför skäms vi ibland?',
      'Har någon annan tyckt att du borde skämmas för något som du själv inte känner är fel?',
      'Har du någon gång skämts för någon annan? Varför då?',
      'Det är övernattningsparty hos en kompis. Du har med dig din gosekanin som du har haft sedan du var liten. Du behöver den inte, men av vana följer den med. Någon tycker att det är fånigt och retar dig inför de andra. Vad gör du?',
    ]}],
  },
  {
    id: 'jma-misslyckas', title: 'Misslyckande', subtitle: 'Känslan av att ha gjort bort sig – och vad en egentligen lär sig av det',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-misslyckas-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'När gjorde du något som du trodde skulle bli bra men som inte blev som du tänkte dig? Vad hade du velat göra annorlunda?',
      'När kan det vara bra att misslyckas?',
      'Varför kan en känna sig misslyckad utan att ha misslyckats?',
      'Vad tror du kan hjälpa dig att må bättre när du känner att du har misslyckats?',
      'Din vän känner sig misslyckad över ett prov i skolan. Hen vet att du klarade provet bra. Vad skulle du säga till din vän?',
    ]}],
  },
  {
    id: 'jma-modig', title: 'Modig', subtitle: 'Att göra något svårt – och att ibland vara modig nog att låta bli',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-modig-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'När har du varit modig?',
      'Hur kändes det?',
      'Kan en vara modig för någon annans skull?',
      'Kan mod ibland leda till något negativt? Ge ett exempel.',
      'I området finns en badanläggning som har öppet på sommaren. På kvällen är det stängt och ingen får vara där. Ditt kompisgäng ska dit och klättra över staketet för att bada sent på kvällen. Det finns risk att någon skadar sig eller att ni blir upptäckta. Vågar du? Varför är det modigt att våga göra det? Varför är det modigt att inte göra det?',
    ]}],
  },
  {
    id: 'jma-kluringen', title: 'Gåtan', subtitle: 'Ett tankeexperiment om vem en egentligen är – när en möter sig själv',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-kluringen-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Föreställ dig att du delar boende med en exakt kopia av dig själv. Hur tror du att det skulle gå? Vad tror du att ni skulle bråka om? Och vad tror du att du inte tål hos dig själv?',
    ]}],
  },
];
export const jagMedAndraProduct: ProductManifest = {
  id: 'jag_med_andra',
  name: 'Jag med Andra',
  slug: 'jag-med-andra',
  tagline: 'Det trygga och det svåra.',
  description: 'Utforska relationer och sociala sammanhang',
  headerTitle: 'Tillsammans',
  accentColor: 'hsl(32, 44%, 47%)',
  accentColorMuted: 'hsl(32, 30%, 85%)',
  secondaryAccent: 'hsl(32, 44%, 47%)',
  backgroundColor: '#721B3A',
  ctaButtonColor: '#CB7AB2',
  tileLight: '#CB7AB2',
  tileMid: '#A85E94',
  tileDeep: '#721B3A',
  pronounMode: 'du',
  heroImage,
  freeCardId: 'jma-vanskap',
  ageLabel: '6+',
  paywallDescription: 'Lås upp alla samtal om vänskap, gränser och att vara tillsammans.',
  categories,
  cards,
};
