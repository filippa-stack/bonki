import type { ProductManifest } from '@/types/product';
import type { Category, Card } from '@/types';
import heroImage from '@/assets/illustration-jag-med-andra.png';

const categories: Category[] = [
  { id: 'jma-jag-och-andra', title: 'Att vara nära', subtitle: 'Det som händer mellan människor — i det nära och det ärliga.', description: 'Kontakt, vänskap, respekt, sanning och tävling', cardCount: 5 },
  { id: 'jma-vem-ar-jag', title: 'Att höra till', subtitle: 'Att hitta sin plats — bland andra och i sig själv.', description: 'Olikhet, utseende, jämlikhet, utanförskap och skam', cardCount: 5 },
  { id: 'jma-varlden-omkring-mig', title: 'När vi kämpar', subtitle: 'Konflikter, gränser och känslan av att ha gjort fel.', description: 'Konflikt, kritik, gränser, skuld, misslyckande och avundsjuka', cardCount: 6 },
  { id: 'jma-vad-tror-jag-pa', title: 'Att vara sig själv', subtitle: 'Press, mod och de stora frågorna om vem en är.', description: 'Prestation, mod, acceptans, integritet och tankeexperiment', cardCount: 5 },
];

const cards: Card[] = [
  // ── K1: Att höra till (jma-vem-ar-jag) ──
  {
    id: 'jma-annorlunda', title: 'Olik', subtitle: 'Att vara sig själv - och att passa in',
    categoryId: 'jma-vem-ar-jag',
    sections: [{ id: 'jma-annorlunda-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad tror du det innebär att \'vara sig själv\'? Är det samma sak som att vara annorlunda?',
      'Vad innebär det att vara annorlunda?',
      'Vem bestämmer vad som är annorlunda?',
      'Hur skulle du känna om någon tyckte att du skulle ändra på dig?',
      'Du har börjat prova en egen klädstil som du trivs med. Dina närmsta två vänner vill att ni ska vara mer lika så att ni ser ut som ett gäng. Vad gör du?',
    ]}],
  },
  {
    id: 'jma-utseende', title: 'Utseende', subtitle: 'Hur vi ser på oss själva och varandra — och vad vårt yttre betyder',
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
      'Vad gör dig olik andra?',
      'Hur skulle det vara om alla vore lika?',
      'Är någon människa mer värd än någon annan?',
      'Finns det situationer där du tycker att barn och vuxna borde ha lika mycket att säga till om? Ge ett exempel.',
      'I klassen pratar ni om hur ett kungarike ska styras. Många i klassen tycker att det ska finnas en kung, men det tycker inte du. När du uttrycker din åsikt skrattar några och tycker att du har fel. Är din åsikt mindre värd för att inte lika många tycker som du? Varför?',
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
    id: 'jma-skam', title: 'Skam', subtitle: 'Känslan av att ha gjort fel inför andra - och vad den känslan vill säga',
    categoryId: 'jma-vem-ar-jag',
    sections: [{ id: 'jma-skam-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Varför skäms vi ibland?',
      'Har någon annan tyckt att du borde skämmas för något som du själv inte känner är fel?',
      'Har du någon gång skämts för någon annan? Vad var det som hände?',
      'Kan det någon gång vara bra att känna skam? Ge ett exempel.',
      'Det är övernattningsparty hos en kompis. Du har med dig din gosekanin som du har haft sedan du var liten. Du behöver den inte, men av vana följer den med. Någon tycker att det är fånigt och retar dig inför de andra. Vad gör du?',
    ]}],
  },
  // ── K2: Att vara nära (jma-jag-och-andra) ──
  {
    id: 'jma-kontakt', title: 'Kontakt', subtitle: 'Att läsa av hur någon mår — och vad vi gör med det vi ser',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-kontakt-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Kan man se på någon hur de mår, utan att de säger något? Vad brukar du titta på?',
      'Om någon säger att hen är glad men ser ledsen ut, vilket tror du stämmer?',
      'Om någons ord inte stämmer med det du ser, vad gör du då?',
      'Du har en god vän som säger att allt är bra hemma, men en annan person har berättat att vännen kanske inte mår riktigt bra. Vad tänker du? Vad skulle du göra?',
    ]}],
  },
  {
    id: 'jma-vanskap', title: 'Vänskap', subtitle: 'Hur vänskap uppstår - och vad vänskap innebär',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-vanskap-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Varför tror du att din vän valde dig som vän?',
      'Varför valde du din vän?',
      'Har du blivit kompis med någon du inte tyckte om från början? Vad fick dig att ändra mening?',
      'Behöver en ha många vänner eller räcker det med en?',
      'En kompis slutar höra av sig och verkar inte vilja ses mer. Kan hen bestämma att ni inte är vänner längre?',
    ]}],
  },
  {
    id: 'jma-respekt', title: 'Respekt', subtitle: 'Att behandla andra väl — även när man tänker och tror olika',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-respekt-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vilka personer känner du respekt för? Hur visar du att du känner respekt?',
      'Vem känner du som har respekt för dig? Hur visar de att de har respekt för dig?',
      'Är det samma sak att ha respekt för någon och att vara rädd för någon?',
      'Två av dina kompisar tror på olika saker när det gäller religion. Vad kan hjälpa, för att ni ska kunna vara vänner även om ni tror på olika saker?',
    ]}],
  },
  {
    id: 'jma-sanning', title: 'Sanning', subtitle: 'Att vara ärlig - mot sig själv och andra',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-sanning-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Varför tror du att det är viktigt att tala sanning?',
      'Hur känns det för dig när någon är oärlig?',
      'Är en sanning detsamma som det en tycker?',
      'Kan sanningen vara olika för olika personer? Hur kan det vara så?',
      'En god vän har handlat nya kläder med pengar som hen fick i present. Du tycker inte att kläderna passar vännen, men hen verkar trivas i dem. Vad säger du när hen frågar vad du tycker?',
    ]}],
  },
  {
    id: 'jma-tavla', title: 'Tävling', subtitle: 'Viljan att vinna — och vad som händer när det inte går',
    categoryId: 'jma-jag-och-andra',
    sections: [{ id: 'jma-tavla-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Varför tror du att det för många känns viktigt att vinna eller vara bäst?',
      'Berätta om en gång när du vann något. Hur kändes det?',
      'Vad kan man lära sig av att inte vinna?',
      'Om du kom tvåa eller sist, vad önskar du att någon skulle säga till dig då?',
      'Du håller på att vinna ett lopp på en kilometer. Precis bakom dig finns en elev som är ny i klassen och inte verkar trivas så bra. Skulle du låta den personen vinna? Förklara.',
    ]}],
  },
  // ── K3: När vi kämpar (jma-varlden-omkring-mig) ──
  {
    id: 'jma-konflikt', title: 'Konflikt', subtitle: 'Bråk som en del av relationer - och hur vi hanterar dem',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-konflikt-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad kan vara början på en konflikt?',
      'Kan det vara bra att bråka med någon man tycker om?',
      'Kan du komma ihåg en gång när en vuxen blev arg eller besviken på dig utan att du gjort något med vilje? Kunde den vuxne förstå varför du gjorde som du gjorde?',
      'Vad tror du att vuxna bråkar om?',
      'Du och din bästa kompis i skolan har bråkat om en sak och ni har inte pratat på flera dagar. Du står fast vid att hen hade fel. Skolan är slut för terminen. Hur löser ni detta?',
    ]}],
  },
  {
    id: 'jma-kritik', title: 'Kritik', subtitle: 'Att ge och få feedback utan att det blir angrepp',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-kritik-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har du blivit kritiserad för något? Hur kändes det?',
      'När kan det vara bra att få kritik?',
      'Hur känns skillnaden på att få hjälpsam kritik och att någon faktiskt är elak?',
      'Kan någon ge kritik för något du gjort, utan att du känner dig kritiserad för den du är? Ge ett exempel.',
      'Du lämnar in en skrivuppgift som du är stolt över. Den har tagit lång tid att skriva och du har även ritat en bild som passar till texten. Trots detta har läraren valt att bara kommentera dina stavfel. Hur kändes det? Vad hade du önskat att läraren hade sagt?',
    ]}],
  },
  {
    id: 'jma-stopp', title: 'Stopp', subtitle: 'Att sätta och respektera gränser — för sig själv och för andra',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-stopp-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'När vet du att det är dags att säga stopp?',
      'När är det svårt att säga stopp?',
      'Hur hjälper man någon annan att säga stopp?',
      'Hur märker du att någon vill säga stopp utan att den har sagt stopp?',
      'En klasskompis beter sig på ett sätt som känns obehagligt för dig — till exempel att stå för nära eller röra vid dig. Hur kan du tala om för den personen att du inte gillar det? Vad gör du om hen inte slutar?',
    ]}],
  },
  {
    id: 'jma-skuld', title: 'Skuld', subtitle: 'Att ha orsakat något som gick snett — och vad det innebär med ett förlåt',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-skuld-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Kan det bli för sent att säga förlåt?',
      'Kan man visa sitt förlåt istället för att säga det?',
      'Hur känns det i kroppen för dig att säga förlåt när du gjort fel? - Och hur känns det i dig när någon annan säger förlåt som gjort fel mot dig?',
      'Har du någon gång sagt förlåt utan att mena det? Varför tror du att du gjorde så?',
      'Har du någon gång fått skulden för något du inte har gjort? Hur kändes det?',
      'Du är på läger och säger något taskigt till en som du delar rum med. Det är sista kvällen på lägret och du kommer kanske inte träffa personen igen. Spelar det någon roll för dig, eller för den andra, om du säger förlåt - eller om du inte gör det?',
    ]}],
  },
  {
    id: 'jma-misslyckas', title: 'Misslyckande', subtitle: 'Att ibland inte klara det vi vill - och vad vi kan lära oss av det',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-misslyckas-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'När gjorde du något som du trodde skulle bli bra men som inte blev som du tänkte dig?',
      'Vad hade du velat göra annorlunda?',
      'När kan det vara bra att misslyckas?',
      'Varför kan man känna sig misslyckad utan att ha misslyckats?',
      'Vad tror du kan hjälpa dig att må bättre när du känner att du har misslyckats?',
      'Din vän känner sig misslyckad över ett prov i skolan, men vet att du klarade provet bra. Vad skulle du säga till din vän?',
    ]}],
  },
  {
    id: 'jma-avund', title: 'Avundsjuka', subtitle: 'Känslan av att vilja ha något som någon annan har',
    categoryId: 'jma-varlden-omkring-mig',
    sections: [{ id: 'jma-avund-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har du känt avundsjuka någon gång? På vad eller vem?',
      'Varför tror du att vissa människor verkar viktigare för andra om de har mycket pengar eller saker? Tycker du att det stämmer? Varför - varför inte?',
      'Vad har du som någon annan skulle kunna vara avundsjuk på?',
      'Tror du att man kan vara lycklig utan att ha mycket saker eller pengar? Vad är det i så fall som gör en lycklig?',
      'Din kusins familj har gott om pengar. De har regelbundna solsemestrar och ett sommarhus vid havet. Du hade gjort vad som helst för att ha det din kusin har, men din kusin verkar inte nöjd. Varför tror du att ni kan känna så olika?',
    ]}],
  },
  // ── K4: Att vara sig själv (jma-vad-tror-jag-pa) ──
  {
    id: 'jma-duktig', title: 'Prestation', subtitle: 'Vem presterar man egentligen för — sig själv eller andra?',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-duktig-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har du någon gång gjort eller presterat något bra för att göra någon annan glad? Hur kändes det jämfört med när du gjorde det för bara din egen skull?',
      'Berätta om ett tillfälle när du var stolt över dig själv — inte för att någon annan sa det, utan för att du själv kände det. Hur kändes det?',
      'Har du berättat för någon annan att du är stolt över den eller att den gjort något bra? Vad hände och hur reagerade den personen?',
      'Du spelar fotboll tre dagar i veckan eftersom dina vuxna också gjorde det när de var små. De är alltid med på matcherna och hejar, och du vet att fotbollen är viktig för dem. Ibland är det jättekul att spela, men ibland önskar du att du fick vara hemma. Är du duktig för dig själv eller för de vuxnas skull?',
    ]}],
  },
  {
    id: 'jma-modig', title: 'Modig', subtitle: 'Att våga göra något - och att våga låta bli',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-modig-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Berätta om en gång när du var modig. Hur kändes det?',
      'Kan man vara modig för någon annans skull?',
      'Kan det ibland leda till problem att vara modig? Ge ett exempel.',
      'I området finns en badanläggning som har öppet på sommaren. På kvällen är det stängt och ingen får vara där. Ditt kompisgäng ska dit och klättra över staketet för att bada sent på kvällen. Det finns risk att någon skadar sig eller att ni blir upptäckta. Vågar du? Är det modigt att våga göra det? Kan det vara modigt att inte göra det?',
    ]}],
  },
  {
    id: 'jma-acceptans', title: 'Acceptans', subtitle: 'Att lära sig leva med saker som inte går att förändra',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-acceptans-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Vad betyder det att acceptera något?',
      'Har du velat förändra något som inte går att förändra? Vad var det?',
      'Hur kan en veta skillnaden mellan att försöka förändra något och att behöva acceptera något?',
      'Hur känns det att acceptera att någon inte tycker som du?',
      'Bills pappa var med i en olycka när Bill var liten. Han skadade sina ben och sitter i rullstol. Bill undrar om pappa är ledsen att han inte kan vara med och spela fotboll och leka som de andra vuxna. Då svarar pappa: "Jo, det är jag. Men jag har accepterat det och det finns ju massa andra saker jag kan göra som de andra papporna inte kan!" Så drar han upp Bill i knäet och snurrar på rullstolen så att Bill gapskrattar. Hur menade Bills pappa?',
    ]}],
  },
  {
    id: 'jma-integritet', title: 'Integritet', subtitle: 'Att stå för det man tror på — även när det är svårt',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-integritet-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Har andra rätt att få veta vad du tänker och känner? Ge exempel på något som du och andra vill ha för sig själv.',
      'När kan det vara svårt att säga nej eller säga vad man tycker?',
      'När kan det vara viktigt att stå upp för någon annan?',
      'Har du någon gång känt att du har stått upp för dig själv eller din åsikt, trots att andra tyckt att du skulle göra eller tycka som dem? Vad var det som var viktigt för dig att stå upp för?',
      'Du märker att några i klassen behandlar en klasskompis dåligt, och alla vet om det men ingen gör något. Vad stoppar folk från att ingripa? Vad tror du att du själv skulle kunna göra?',
    ]}],
  },
  {
    id: 'jma-kluringen', title: 'Gåtan', subtitle: 'Ett tankeexperiment om vem man egentligen är — när man möter sig själv',
    categoryId: 'jma-vad-tror-jag-pa',
    sections: [{ id: 'jma-kluringen-opening', type: 'opening', title: 'Frågor', content: '', prompts: [
      'Föreställ dig att du bor ihop med en exakt kopia av dig själv. Hur tror du att det skulle gå? Vad tror du att du inte skulle tåla med dig själv? Vad hade du tyckt mest om med dig själv?',
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
