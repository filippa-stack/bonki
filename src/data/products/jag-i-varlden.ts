import type { ProductManifest } from '@/types/product';
import type { Category, Card } from '@/types';

const categories: Category[] = [
  { id: 'jiv-min-vardag', title: 'Min vardag', subtitle: 'Det som formar dig varje dag -- inifrån och ut.', description: 'Hälsa, prestation, bekräftelse och självkänsla', cardCount: 4 },
  { id: 'jiv-vem-jag-ar', title: 'Vem jag är', subtitle: 'Identitet, frihet och relationer som speglar dig.', description: 'Identitet, roller, frihet, kärlek och vänskap', cardCount: 5 },
  { id: 'jiv-jag-och-andra', title: 'Jag & andra', subtitle: 'Hur vi pratar, bråkar och bryr oss om varandra.', description: 'Kommunikation, konflikt, medkänsla, mobbning och fördomar', cardCount: 5 },
  { id: 'jiv-jag-i-samhallet', title: 'Jag i samhället', subtitle: 'Normer, ansvar och frågor som påverkar oss alla.', description: 'Social media, psykisk ohälsa, sexualitet, moral och aktivism', cardCount: 5 },
  { id: 'jiv-det-stora-sammanhanget', title: 'Det stora sammanhanget', subtitle: 'Tankar om mening, liv och det som är större än oss.', description: 'Existentiella frågor', cardCount: 1 },
];

// Helper to create a card with scenario
const qsCard = (id: string, title: string, subtitle: string, catId: string, questions: string[], scenario: string): Card => ({
  id, title, subtitle, categoryId: catId,
  sections: [
    { id: `${id}-opening`, type: 'opening', title: 'Frågor', content: '', prompts: questions },
    { id: `${id}-scenario`, type: 'scenario', title: 'I verkligheten', content: '', prompts: [scenario] },
  ],
});

const cards: Card[] = [
  // ── K1: Min vardag ──
  qsCard('jiv-halsa', 'Hälsa', 'Vad hälsa egentligen innebär -- och när hälsofokus kan bli ett problem', 'jiv-min-vardag',
    ['Kan en se på en kropp att den är hälsosam? Berätta.','Tror du att överdriven hälsomedvetenhet kan bli ohälsosam? Vad kan det bero på?','Hälsa kan betyda olika saker för olika personer. Berätta om något du tycker är hälsosamt som någon du känner inte håller med om.','Finns det tillfällen då du har ansvar för någon annans hälsa? Ge exempel.'],
    'Tänk dig att några i din omgivning är väldigt fokuserade på träning och kost och förväntar sig att andra gör likadant. Hur påverkar det dig? Hur kan du förhålla dig till det?'),
  qsCard('jiv-prestation', 'Prestation', 'Krav och förväntningar -- varifrån de kommer och hur de påverkar', 'jiv-min-vardag',
    ['Beskriv ett tillfälle då du gjorde en särskild ansträngning för att slutföra något. Vad fick dig att inte ge upp?','Känner du att det är viktigt att bli "bäst" i allt du gör? Varför?','När kan ett misslyckande vara bra?','De krav du har på dig själv och din framtid -- vet du om det är du själv eller någon annan som ställt dem?'],
    'Vuxna och lärare pratar ofta om att det är viktigt att engagera sig nu för att få en bra framtid. Om du blundar och tänker på din framtid -- hur vill du att den ska se ut?'),
  qsCard('jiv-bekraftelse', 'Bekräftelse', 'Behovet av att bli sedd och hörd -- och när det kan gå för långt', 'jiv-min-vardag',
    ['På vilka sätt kan en person få bekräftelse från andra?','Varför är det så värdefullt att få bekräftelse för saker vi gör?','Är bekräftelse alltid något bra? Kan det skada?','På vilket sätt kan en bli beroende av bekräftelse? Vad tror du det beror på?','Vilken sorts bekräftelse betyder mest för dig?'],
    'Du har skrivit en lång uppsats om något som du bryr dig mycket om. Du har lagt ner väldigt många timmar på den och det känns lite utelämnat att visa den för andra. När du gör det, för läraren och dina vuxna, får du inte riktigt någon respons utöver "vad bra". Är det nog? Vad hade du behövt?'),
  qsCard('jiv-sjalvkansla', 'Självkänsla', 'Att tro på sig själv -- skillnaden mellan självkänsla, självförtroende och egoism', 'jiv-min-vardag',
    ['Är det viktigt att älska sig själv? Förklara.','Hur kan god självkänsla visa sig hos någon?','Kan en ha en låg självkänsla men ett bra självförtroende?','Vad skulle du ge en person med låg självkänsla för råd?','Vad är skillnaden mellan sund självkärlek och egoism?'],
    'En person du känner är alltid väldigt nöjd med sitt utseende och gillar att prata om det och lägger ofta upp bilder på sig själv. Personen tycker dock att det är jobbigt att uttrycka sina åsikter och blir osäker när någon frågar vad hen tycker om något. Hur kan det vara så?'),
  // ── K2: Vem jag är ──
  qsCard('jiv-identitet', 'Identitet', 'Vem man är och vem man vill vara -- och hur det kan skilja sig åt', 'jiv-vem-jag-ar',
    ['På vilka sätt kan personer visa att de tillhör en speciell grupp?','Beskriv första gången du verkligen kände tillhörighet. Vad fick dig att känna så?','Uppfattar du dig själv på samma sätt som du vill att andra ska uppfatta dig?','Vilken del av din identitet önskar du fick mer utrymme?'],
    'Du har träffat nya kompisar och börjat klä dig annorlunda jämfört med tidigare. Finns det någonting i din identitet som förblir oförändrat trots att ditt yttre har förändrats? Berätta hur du tänker.'),
  qsCard('jiv-roller', 'Roller', 'De roller vi tar på oss i olika sammanhang -- och om vi alltid är oss själva', 'jiv-vem-jag-ar',
    ['Beskriv en situation då du vet att du går in i en roll.','Kan en vara på olika sätt i olika situationer och fortfarande vara sig själv?','Har du tilldelats en roll av någon eller några som inte känns rätt?','Kan du känna av när någon inte verkar vara sig själv? Hur märker du det?'],
    'Hemma är du den som pratar mest och ser till att det händer saker. Du har rätt mycket ansvar och anses duktig. I ditt kompisgäng är det dock du som får finna dig i andras beslut och du hänger mest på. Är du dig själv i båda situationerna? Varför tror du att dina roller har blivit så olika?'),
  qsCard('jiv-frihet', 'Frihet', 'Vad frihet egentligen innebär -- och hur ansvar och frihet hänger ihop', 'jiv-vem-jag-ar',
    ['Vilken personlig frihet skulle du sakna mest om den togs ifrån dig?','Tycker du att frihet och ansvar hör ihop? På vilket sätt?','Berätta om en situation där du känt dig väldigt fri.','Vilka friheter tror du vuxna har?','Vilka begränsningar eller ofriheter tror du vuxna har som inte barn har?'],
    'Någon du känner får vara ute hur sent som helst, har ingen bestämd middagstid och har ett kort där pengar sätts in för att kunna köpa vad hen vill. Samma person blir aldrig hämtad, får ofta laga mat själv och får klara sig själv. Tror du att den här personen känner sig fri? Förklara.'),
  qsCard('jiv-karlek', 'Kärlek', 'Kärlekens många former -- attraktion, förälskelse och hur det förändras', 'jiv-vem-jag-ar',
    ['Hur känns kärlek?','Hur kan kärlek se ut för olika personer?','Vad finns det för likheter och skillnader mellan vänskap och kärlek?','Varför behöver vi kärlek? Kan en leva utan kärlek och ändå må bra?','Är det skillnad på attraktion, förälskelse, att vara kär och kärlek? Hur vet en skillnaden?','Hur kan ens kärlek till en person förändras över tid?','Vad kan orsaka att en slutar älska någon?'],
    'Du förstår att en person gillar dig som mer än en vän, men du känner inte likadant. Vad kan du göra?'),
  qsCard('jiv-vanskap', 'Vänskap', 'Vad som håller en vänskap levande -- och om alla vänskaper är lika värda', 'jiv-vem-jag-ar',
    ['Varför tror du att människan är naturligt programmerad att behöva vänner?','Är vänskap något en väljer eller något som bara uppstår?','Hur skulle du definiera en vän för livet? Vad krävs för en sådan relation?','Kan en ha olika typer av vänskapsrelationer? Hur kan de i så fall se ut?'],
    'En person har flera olika vänner. Vissa av dem är mer populära än andra. Några kan vara tråkiga, men finns alltid där. Är några vänner mer värda än andra? Kan man värdera vänskap? Förklara.'),
  // ── K3: Jag & andra ──
  qsCard('jiv-kommunikation', 'Kommunikation', 'Hur vi förstår varandra -- och vad som händer när orden inte räcker', 'jiv-jag-och-andra',
    ['Hur skulle du tillbringa en dag om du inte kunde kommunicera med någon?','Om en upplever att det är svårt att kommunicera med någon, vad kan det bero på?','Finns det vissa kommunikationskanaler (sociala medier, IRL) som är mer lämpliga beroende på vad samtalet handlar om?','Berätta om en situation då du önskar att du hade kommunicerat annorlunda.'],
    'En person du känner säger aldrig någonting. Du brukar fråga hur hen mår och vad som händer men får aldrig några svar. Personen låter dig dock förstå på andra sätt hur hen har det. När kan en icke-verbal kommunikation vara till hjälp, och när kan den bli ett problem?'),
  qsCard('jiv-konflikt', 'Konflikt', 'Konflikter som en del av livet -- hur man hanterar dem och kommer vidare', 'jiv-jag-och-andra',
    ['Kan det vara konstruktivt med konflikt?','Vad kan undvikande av konflikt leda till?','Hur tror du att vänskap påverkas av konflikter? Vad kan vara positivt? Vad kan vara negativt?','Berätta om en konflikt som du inte kunnat lösa. Varför gick den inte att lösa?','Hur kan en gå vidare efter en olöst konflikt?','Beskriv en konflikt som du kunnat lösa. Vad gjorde du som ledde till en lösning?'],
    'Föreställ dig att någon oavsiktligt orsakat dig en stor och smärtsam förlust. Du känner stark ilska varje gång du ser personen. Hur kan du hantera den ilskan på ett sätt som inte skadar dig eller andra?'),
  qsCard('jiv-medkansla', 'Medkänsla', 'Förmågan att förstå andras situation och vilja hjälpa', 'jiv-jag-och-andra',
    ['Vilka handlingar, inte ord, visar medkänsla?','Beskriv likheterna mellan dig och en skolkamrat som utåt sett är väldigt olik dig.','Har en vän till dig blivit ledsen för något du inte skulle bli ledsen för? Vad var det och varför tror du hen blev ledsen?','Hur skulle du lära dina barn medkänsla?'],
    'Tänk dig att du blir satt i en situation du verkligen inte vill vara i. Kanske blir du tvungen att göra något du inte vill eller tvingad att säga något du inte vill. Utöver att du önskar att du slapp, vad hade du önskat att någon annan hade gjort för att hjälpa dig?'),
  qsCard('jiv-mobbning', 'Mobbning', 'Vad mobbning är och inte är -- och vilket ansvar var och en har', 'jiv-jag-och-andra',
    ['Vad är skillnaden mellan ett bråk och mobbning?','Hur tror du att mobbning har förändrats sedan dina vuxna var barn?','Kan du ge ett exempel på hur en vuxen kan bli mobbad?','Vad skulle ett barn respektive en vuxen kunna göra för att få hjälp om de blir mobbade?','Kan man vara mobbare utan att veta om det? Ge exempel.'],
    'Tänk dig att det finns elever i din klass som alltid är ensamma och saknar vänner. Ingen gör dem något direkt, men ingen inkluderar dem heller. Kan det räknas som mobbning? Vilket ansvar har du och klassen?'),
  qsCard('jiv-fordomar', 'Fördomar', 'Hur vi bedömer varandra -- och varför vi gör det utan att tänka på det', 'jiv-jag-och-andra',
    ['Varför tror du att vi människor har fördomar om varandra?','Om någon träffade dig under endast en timme, vilken felaktig bedömning hade de kunnat göra om dig?','Berätta om ett tillfälle då du hade en fördom som visade sig inte stämma. Vad fick dig att ändra dig?','Hur kan du upptäcka fördomar som inte märks så tydligt hos andra?','Har någon påpekat att du har en fördom? Stämde det?'],
    'Du och ditt kompisgäng sitter och diskuterar fördomar. En påstår sig vara helt utan fördomar. Är det möjligt?'),
  // ── K4: Jag i samhället ──
  qsCard('jiv-social-media', 'Social media', 'Sociala mediers roll i ungas liv -- glädje, press och risker', 'jiv-jag-i-samhallet',
    ['När blir du glad av något som har hänt på sociala medier?','Mår du dåligt ibland av något du har sett eller läst på sociala medier? Ge exempel.','Kan sociala medier vara farliga? Berätta hur du tänker.','På vilket sätt har sociala medier haft en positiv inverkan på ditt liv?','Vad tror du att de i din ålder gjorde innan sociala medier fanns?'],
    'Du lägger ut en bild, ingen gillar den. Hur påverkas du? Utveckla.'),
  qsCard('jiv-psykisk-ohalsa', 'Psykisk ohälsa', 'Att förstå skillnaden mellan att må dåligt och att behöva hjälp', 'jiv-jag-i-samhallet',
    ['Beskriv hur det känns när du mår bra.','Hur vet du när du inte mår bra?','Vem pratar du med när något inte känns bra?','Hur vet man skillnaden mellan att må dåligt och psykisk ohälsa?','Vilka är fördelarna och nackdelarna med att få en diagnos för psykisk ohälsa?','Om en vän berättade att de ibland inte orkar eller att livet känns för tungt -- vad skulle du göra? Vem skulle du kontakta?'],
    'Om en vän delade något online som fick dig att oroa dig för hens säkerhet -- vad är det första du skulle göra? Vem kan du ta hjälp av?'),
  qsCard('jiv-sexualitet', 'Sexualitet', 'Normer och förväntningar kring sex -- och varför det är viktigt att prata om', 'jiv-jag-i-samhallet',
    ['Varifrån har du lärt dig det du vet om sex?','Vilka normer eller förväntningar uppfattar du finns när det gäller att ha sex? Ser det olika ut för olika personer?','Varför är det viktigt att fundera över sin könsidentitet och sexuella läggning?','På vilka sätt kan en påverkas av kroppsideal och trender när det kommer till sex?','Vad är samtycke och varför är det viktigt?','Varför är det viktigt att prata om sexualitet?'],
    'Du befinner dig i en situation där någon du tycker om vill ha sex, men du är osäker på om du vill. Vad är viktigt att tänka på? Vad har du rätt att göra?'),
  qsCard('jiv-moral-etik', 'Moral & etik', 'Vad som är rätt och fel -- och vem som egentligen bestämmer det', 'jiv-jag-i-samhallet',
    ['Vad är skillnaden mellan moral och etik?','Vem bestämmer vad som är etiskt och moraliskt riktigt?','Var tror du att din moral kommer ifrån?','Vad är det som gör att något känns moraliskt fel? Eller moraliskt riktigt?','Ge ett exempel på när något kan vara moraliskt riktigt men fel enligt lagen.'],
    'Hur skulle du reagera om en favoritlärare skickade en vänförfrågan till dig? Dina vuxna har glömt logga ut från sitt e-postkonto. Du ser ett mejl från din lärare med ditt namn i ämnesraden. Vad gör du?'),
  qsCard('jiv-aktivism', 'Aktivism', 'Att vilja förändra världen -- och vad som faktiskt gör skillnad', 'jiv-jag-i-samhallet',
    ['Varför finns aktivism?','Vilket är det bästa sättet att protestera mot något?','Kan få personer påverka stora system? Hur får man folk att lyssna?','Känner du till något stort i samhället som förändrats för att människor utövat aktivism?','Vad tycker du är orättvist och som du skulle vilja kämpa för att förändra?'],
    'En person skriker på hjälp i en miljö med många andra människor. Ingen ingriper. Alla tror att någon annan ska göra något. Varför tror du att det blir så?'),
  // ── K5: Det stora sammanhanget ──
  qsCard('jiv-existens', 'Existens', 'De stora frågorna om mening, liv och vad som händer efter döden', 'jiv-det-stora-sammanhanget',
    ['Om du inte fanns, hur hade världen sett annorlunda ut?','Vad tror du är meningen med dig och med oss människor?','Varför tror du att många människor tror på sådant vars existens inte kan bevisas?','Varför är tro så olika för olika människor?'],
    'Din bror tror att när man dör händer ingenting. Då läggs man i en kista, ruttnar och återgår till naturen. Din syster tror att vi är en del av en plan. Den planen är inte nödvändigtvis gjord av en gud, men efter döden kommer vi säkert få veta vad det gick ut på, tror hon. Vad tror du?'),
];

export const jagIVarldenProduct: ProductManifest = {
  id: 'jag_i_varlden',
  name: 'Jag i Världen',
  slug: 'jag-i-varlden',
  tagline: 'Samtal om identitet, ansvar och livet runt omkring oss.',
  description: 'Utforska dig själv i större sammanhang',
  headerTitle: 'Jag i sammanhang',
  accentColor: 'hsl(195, 40%, 22%)',
  accentColorMuted: 'hsl(195, 25%, 90%)',
  secondaryAccent: 'hsl(35, 72%, 48%)',
  pronounMode: 'du',
  ageLabel: '12+',
  categories,
  cards,
};