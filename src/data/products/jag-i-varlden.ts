import type { ProductManifest } from '@/types/product';
import type { Category, Card } from '@/types';
import heroImage from '@/assets/illustration-jag-i-varlden.png';

const categories: Category[] = [
  { id: 'jiv-varlden-omkring-mig', title: 'Omvärlden', subtitle: 'Normer, press och frågor som påverkar oss alla.', description: 'Sociala medier, fördomar, prestation, hälsa och psykisk ohälsa', cardCount: 5 },
  { id: 'jiv-vem-ar-jag', title: 'Vem är jag', subtitle: 'Det som formar dig inifrån – identitet, roller och självbild.', description: 'Identitet, självkänsla, roller och bekräftelse', cardCount: 4 },
  { id: 'jiv-jag-och-andra', title: 'Jag & andra', subtitle: 'Hur vi pratar, bråkar och bryr oss om varandra.', description: 'Vänskap, kommunikation, medkänsla, konflikter och mobbning', cardCount: 5 },
  { id: 'jiv-vad-tror-jag-pa', title: 'Vad tror jag på', subtitle: 'Värderingar, mening och det som är större än oss.', description: 'Kärlek, sexualitet, moral & etik, frihet, existens och aktivism', cardCount: 6 },
];

// Helper — single section per card (scenario appended as final prompt)
const qsCard = (id: string, title: string, subtitle: string, catId: string, questions: string[], scenario: string): Card => ({
  id, title, subtitle, categoryId: catId,
  sections: [
    { id: `${id}-opening`, type: 'opening', title: 'Frågor', content: '', prompts: [...questions, scenario] },
  ],
});

const cards: Card[] = [
  // ── K1: Omvärlden (free card first) ──
  qsCard('jiv-fordomar', 'Fördomar', 'Att vi bedömer varandra - utan att tänka på det', 'jiv-varlden-omkring-mig',
    ['Varifrån kommer fördomar? Varför tror du att vi människor har fördomar om varandra?','Om någon träffade dig under endast en timme, vilken felaktig bedömning hade de kunnat göra om dig?','Berätta om ett tillfälle då du hade en fördom som visade sig inte stämma. Vad fick dig att ändra dig?','Hur kan du upptäcka fördomar som inte märks så tydligt hos andra?','Har någon påpekat att du har en fördom? Stämde det?'],
    'Du och ditt kompisgäng sitter och diskuterar fördomar. En påstår sig vara helt utan fördomar. Är det möjligt?'),
  qsCard('jiv-social-media', 'Social media', 'Sociala mediers roll i ungas liv -- glädje, press och risker', 'jiv-varlden-omkring-mig',
    ['När blir du glad av något som har hänt på sociala medier?','Mår du dåligt ibland av något du har sett eller läst på sociala medier? Ge exempel.','Kan sociala medier vara farliga? Berätta hur du tänker.','På vilket sätt har sociala medier haft en positiv inverkan på ditt liv?','Vad tror du att de i din ålder gjorde innan sociala medier fanns?'],
    'Du lägger ut en bild, ingen gillar den. Hur påverkas du? Utveckla.'),
  qsCard('jiv-prestation', 'Prestation', 'Krav och förväntningar — varifrån de kommer och hur de påverkar', 'jiv-varlden-omkring-mig',
    ['Beskriv ett tillfälle då du gjorde en särskild ansträngning för att slutföra något. Vad fick dig att inte ge upp?','Känner du att det är viktigt att bli "bäst" i något du gör? Varför - varför inte?','På vilket sätt kan ett misslyckande vara något bra?','De krav du har på dig själv och din framtid — vet du om det är du själv eller någon annan som ställt dem?'],
    'Vuxna och lärare pratar ofta om att det är viktigt att engagera sig nu för att få en bra framtid. Om du blundar och tänker på din framtid -- hur vill du att den ska se ut?'),
  qsCard('jiv-halsa', 'Hälsa', 'Vad innebär hälsa - för dig själv och andra', 'jiv-varlden-omkring-mig',
    ['Syns det på en kropp att den är hälsosam? Hur syns det?','Kan en kropp som ser hälsosam ut ändå vara ohälsosam? Vad kan göra att det är så?','Tror du att överdriven hälsomedvetenhet kan bli ohälsosamt? Vad kan hända då?','Hälsa kan betyda olika saker för olika personer. Berätta om något du tycker är hälsosamt som kanske inte alla skulle hålla med om.','Finns det tillfällen då du har ansvar för någon annans hälsa? Ge exempel.'],
    'Tänk dig att några du känner är väldigt fokuserade på träning och kost, och att de förväntar sig att andra gör likadant. Hur påverkar det dig?'),
  qsCard('jiv-psykisk-ohalsa', 'Psykisk ohälsa', 'Att förstå skillnaden mellan att må dåligt och att behöva hjälp', 'jiv-varlden-omkring-mig',
    ['Beskriv hur det känns i kroppen när du mår bra.','Hur vet du när du inte mår bra? Vad är det första i kroppen du lägger märke till?','Vem pratar du med när något inte känns bra?','Hur kan du beskriva skillnaden mellan att må dåligt och psykisk ohälsa?','Vilka är fördelarna och nackdelarna med att få en diagnos för psykisk ohälsa?','Om en vän berättade att den ibland inte orkar eller att livet känns för tungt — vad skulle du göra? Vem skulle du kontakta?'],
    'Om en vän delade något online som fick dig att oroa dig för hens säkerhet — vad är det första du skulle göra? Vem kan du ta hjälp av?'),
  // ── K2: Vem är jag ──
  qsCard('jiv-identitet', 'Identitet', 'Vem en är och vem en vill vara – och hur det kan skilja sig åt', 'jiv-vem-ar-jag',
    ['På vilka sätt kan personer visa att de tillhör en speciell grupp?','Beskriv första gången du verkligen kände tillhörighet. Vad fick dig att känna så?','Uppfattar du dig själv på samma sätt som du vill att andra ska uppfatta dig?','Vilken del av din identitet önskar du fick mer utrymme?'],
    'Du har träffat nya kompisar och börjat klä dig annorlunda jämfört med tidigare. Finns det någonting i din identitet som förblir oförändrat trots att ditt yttre har förändrats? Berätta hur du tänker.'),
  qsCard('jiv-sjalvkansla', 'Självkänsla', 'Att tro på sig själv - självkänsla, självförtroende och egoism', 'jiv-vem-ar-jag',
    ['Är det viktigt att älska sig själv? Förklara.','Hur kan god självkänsla visa sig hos någon?','Kan en person ha en låg självkänsla men ett bra självförtroende? Hur märks det?','Vad skulle du ge en person med låg självkänsla för råd?','Vad är skillnaden mellan sund självkärlek och egoism?'],
    'En person du känner är alltid väldigt nöjd med sitt utseende och gillar att prata om det och lägger ofta upp bilder på sig själv. Samma person tycker dock att det är jobbigt att uttrycka sina åsikter och blir osäker när någon frågar vad hen tycker om något. Hur kan det vara så?'),
  qsCard('jiv-roller', 'Roller', 'Olika roller vi har, tar och får - och när vi är oss själva', 'jiv-vem-ar-jag',
    ['Beskriv en situation då du vet att du går in i en roll.','Hur kan man vara på olika sätt i olika situationer och fortfarande vara sig själv?','Har du tilldelats en roll av någon eller andra som inte känns rätt?','Kan du känna av när någon inte verkar vara sig själv? Hur märker du det?'],
    'Hemma är du den som pratar mest och ser till att det händer saker. Du har rätt mycket ansvar och anses duktig. I ditt kompisgäng är det dock du som får finna dig i andras beslut och du hänger mest på. Är du dig själv i båda situationerna? Varför tror du att dina roller har blivit så olika?'),
  qsCard('jiv-bekraftelse', 'Bekräftelse', 'Behovet av att bli sedd och hörd - och när det tar över', 'jiv-vem-ar-jag',
    ['På vilka sätt kan en person få bekräftelse från andra?','Vilken sorts bekräftelse betyder mest för dig - att få bekräftelse på det du gör eller på vem du är?','Är bekräftelse alltid något positivt? Skulle bekräftelse kunna leda till något negativt? Ge ett exempel.','På vilket sätt kan vi bli beroende av bekräftelse? Vad tror du det beror på?'],
    'Du har skrivit en lång uppsats om något som du bryr dig mycket om. Du har lagt ner många timmar på den och det känns lite utelämnande att visa den för andra. När du visar den för läraren och dina vuxna får du inte riktigt någon respons utöver "vad bra". Är det nog? Vad hade du behövt?'),
  // ── K3: Jag & andra ──
  qsCard('jiv-vanskap', 'Vänskap', 'Vad innebär vänskap - och olika sorters vänskap', 'jiv-jag-och-andra',
    ['Varför tror du att människan är naturligt programmerad att behöva vänner?','Är vänskap något vi väljer eller något som bara uppstår?','Hur skulle du beskriva "en vän för livet"? Vad tror du krävs för en sådan relation?','Kan vi ha olika typer av vänskapsrelationer? Ge exempel.'],
    'En person har flera olika vänner. Vissa av dem är mer populära än andra. Några kan vara tråkiga, men finns alltid där. Är några vänner mer värda än andra? Kan en värdera vänskap? Förklara.'),
  qsCard('jiv-kommunikation', 'Kommunikation', 'Hur vi förstår varandra', 'jiv-jag-och-andra',
    ['Hur skulle du tillbringa en dag om du inte kunde kommunicera med någon?','Om vi upplever att det är svårt att kommunicera med någon, vad kan det bero på?','Finns det vissa kommunikationskanaler (sociala medier, fysiska möten) som är mer lämpliga beroende på vad samtalet handlar om? Ge exempel.','Berätta om en situation då du önskar att du hade kommunicerat annorlunda.'],
    'En person du känner säger aldrig någonting. Du brukar fråga hur hen mår och vad som händer men får aldrig några svar. Personen låter dig dock förstå på andra sätt hur hen har det. När kan en icke-verbal kommunikation vara till hjälp, och när kan den bli ett problem?'),
  qsCard('jiv-medkansla', 'Medkänsla', 'Förmågan att förstå andras situation och vilja hjälpa', 'jiv-jag-och-andra',
    ['Vilka handlingar, inte ord, visar medkänsla?','Beskriv likheterna mellan dig och en skolkamrat som utåt sett är väldigt olik dig.','Har en vän till dig blivit ledsen för något som du inte skulle bli ledsen för? Vad var det och varför tror du hen blev ledsen?','Hur skulle du lära dina barn medkänsla?'],
    'Tänk dig att du blir satt i en situation du verkligen inte vill vara i. Kanske blir du tvungen att göra något du inte vill eller tvingad att säga något du inte vill. Utöver att du önskar att du slapp, vad hade du önskat att någon annan hade gjort för att hjälpa dig?'),
  qsCard('jiv-konflikt', 'Konflikt', 'Konflikter som en del av livet — att hantera dem och komma vidare', 'jiv-jag-och-andra',
    ['På vilket sätt kan det vara positivt med konflikt?','Vad kan undvikande av konflikt leda till?','Hur tror du att vänskap påverkas av konflikter? Vad kan vara positivt? Vad kan vara negativt?','Berätta om en konflikt som du inte kunnat lösa. Varför gick den inte att lösa?','Hur kan vi gå vidare efter en olöst konflikt?','Beskriv en konflikt som du kunnat lösa. Vad gjorde du som ledde till en lösning?'],
    'Föreställ dig att någon oavsiktligt orsakat dig en stor och smärtsam förlust. Du känner stark ilska varje gång du ser personen. Hur kan du hantera den ilskan på ett sätt som inte skadar dig eller andra?'),
  qsCard('jiv-mobbning', 'Mobbning', 'Vad mobbning är och inte är — och vilket ansvar var och en har', 'jiv-jag-och-andra',
    ['Vad är skillnaden mellan ett bråk och mobbning?','Hur tror du att mobbning har förändrats sedan dina vuxna var barn?','Kan du ge ett exempel på hur en vuxen kan bli mobbad?','Vad skulle ett barn respektive en vuxen kunna göra för att få hjälp om de blir mobbade?','Kan en vara mobbare utan att veta om det? Ge exempel.'],
    'Tänk dig att det finns elever i din klass som alltid är ensamma och saknar vänner. Ingen gör dem något direkt, men ingen inkluderar dem heller. Kan det räknas som mobbning? Vilket ansvar har du och klassen?'),
  // ── K4: Vad tror jag på ──
  qsCard('jiv-karlek', 'Kärlek', 'Vårt behov av - och sätt att uttrycka - olika former av kärlek', 'jiv-vad-tror-jag-pa',
    ['Hur känns kärlek i kroppen?','Hur kan kärlek uttryckas för olika personer?','Vad finns det för likheter och skillnader mellan vänskap och kärlek?','Varför behöver vi kärlek? Kan vi leva utan kärlek och ändå må bra?','Är det skillnad på attraktion, förälskelse och kärlek? Försök beskriva skillnaden.','Har du någon gång märkt att din kärlek till en viss person förändrats över tid? På vilket sätt?','Kan man sluta älska någon som man älskat? Vad kan vara orsak att man slutar älska någon?'],
    'Du förstår att en person gillar dig som mer än som en vän, men du känner inte likadant. Vad kan du göra?'),
  qsCard('jiv-sexualitet', 'Sexualitet', 'Normer kring sex, könsidentitet och sexualitet - för en själv och andra', 'jiv-vad-tror-jag-pa',
    ['Varifrån har du lärt dig det du vet om sex?','Vad kan vara positivt med att prata om sexualitet?','Vilka normer eller förväntningar uppfattar du finns när det gäller att ha sex? Ser det olika ut för olika personer - tjejer, killar, unga, vuxna?','Har du funderat över din könsidentitet och din sexuella läggning? Hur vet du vad som är rätt för dig?','På vilka sätt kan vi påverkas av kroppsideal och trender när det kommer till sex?','Vad innebär samtycke till sex, och varför är det viktigt?'],
    'Du befinner dig i en situation där någon du tycker om vill ha sex, men du är osäker på om du vill. Vad blir viktigt för dig i denna situation att tänka på?'),
  qsCard('jiv-moral-etik', 'Moral & etik', 'Våra tankar (etik) och handlingar (moral) om vad som är rätt och fel - och varifrån vi lärt oss det', 'jiv-vad-tror-jag-pa',
    ['Varifrån har du lärt dig om vad som är rätt och fel?','Hur vet vi vad som är rätt och fel?','Vad är det som gör att något känns moraliskt riktigt att göra - eller moraliskt fel?','Ge ett exempel på när något kan vara moraliskt riktigt men fel enligt lagen.'],
    'Dina vuxna har glömt logga ut från sitt e-postkonto. Du ser ett mejl från din lärare med ditt namn i ämnesraden. Vad gör du?'),
  qsCard('jiv-frihet', 'Frihet', 'Vad innebär frihet — och hur frihet och ansvar hänger ihop', 'jiv-vad-tror-jag-pa',
    ['Vilken personlig frihet skulle du sakna mest om den togs ifrån dig?','Tycker du att frihet och ansvar hör ihop? På vilket sätt?','Berätta om en situation där du känt dig väldigt fri.','Vilka friheter tror du vuxna har?','Vilka begränsningar eller ofriheter tror du vuxna har som inte barn har?'],
    'Någon du känner får vara ute hur sent som helst, har ingen bestämd middagstid och har ett kort där pengar sätts in för att kunna köpa vad hen vill. Samma person blir aldrig hämtad, får ofta laga mat och klara sig själv. Tror du att den här personen känner sig fri? Förklara.'),
  qsCard('jiv-existens', 'Existens', 'De stora frågorna - om mening, liv och död', 'jiv-vad-tror-jag-pa',
    ['Om du inte fanns, hur hade världen sett annorlunda ut?','Vad tror du är meningen med dig och med oss människor?','Varför tror du att många människor tror på sådant vars existens inte kan bevisas?','Hur kommer det sig att tro kan vara så olika för olika människor?'],
    'Din vän tror att när man dör händer ingenting - man läggs i en kista, ruttnar och återgår till naturen. En annan vän tror att vi är en del av en större plan. Den planen är inte nödvändigtvis gjord av en gud, men efter döden kommer vi säkert få veta vad det gick ut på, tror vännen. Vad tror du händer när vi dör?'),
  qsCard('jiv-aktivism', 'Aktivism', 'Att vilja förändra världen', 'jiv-vad-tror-jag-pa',
    ['Vad är ett bra sätt att protestera mot något?','Vad innebär aktivism - och varför tror du det finns?','Kan få personer påverka stora system? Hur får man folk att lyssna?','Känner du till något stort i samhället som förändrats för att människor utövat aktivism?','Vad tycker du är orättvist och som du skulle vilja kämpa för att förändra?'],
    'En person skriker på hjälp i en miljö med många andra människor. Ingen ingriper. Alla tror att någon annan ska göra något. Varför tror du att det blir så?'),
];

export const jagIVarldenProduct: ProductManifest = {
  id: 'jag_i_varlden',
  name: 'Jag i Världen',
  slug: 'jag-i-varlden',
  tagline: 'Att hitta sig själv när allt blir större',
  description: 'Utforska dig själv i större sammanhang',
  headerTitle: 'Jag i sammanhang',
  // Chartreuse identity — accents now in family (was teal-derived)
  accentColor: 'hsl(65, 71%, 49%)',        // ~#C6D423
  accentColorMuted: 'hsl(65, 60%, 88%)',
  secondaryAccent: 'hsl(70, 72%, 40%)',
  backgroundColor: '#3F4A0E',              // deep chartreuse atmospheric (was olive #606613)
  ctaButtonColor: '#D8E145',               // lifted chartreuse — verify pill contrast vs bg
  tileLight: '#C6D423',
  tileMid: '#A3AF1C',
  tileDeep: '#606613',
  pronounMode: 'du',
  heroImage,
  freeCardId: 'jiv-fordomar',
  // No ageLabel — older product
  paywallDescription: 'Lås upp alla samtal om världen, rättvisa och att hitta sin plats.',
  darkTextOnTile: true,
  categories,
  cards,
};