/**
 * Still Us v3.0 — Tillbaka (maintenance) cards.
 * 12 monthly cards delivered after the 22-week program.
 * Each has 2 sliders, 2 questions, and an optional reflection prompt.
 */

export interface TillbakaCard {
  index: number;
  title: string;
  theme: string;
  question1: string;
  question2: string;
  sliders: { id: string; text: string; leftLabel: string; rightLabel: string }[];
  reflectionPrompt?: string;
}

const tillbakaCards: TillbakaCard[] = [
  {
    index: 0,
    title: 'Det som blev kvar',
    theme: 'Revisiterar: Grunden',
    question1: 'Har något förändrats i hur ni pratar med varandra — inte vad ni pratar om, utan hur det känns att ta upp saker?',
    question2: 'Finns det en insikt om er som ni har nu — som ingen av er använder?',
    sliders: [
      { id: 'tb0-1', text: 'Hur vi pratar', leftLabel: 'Vi pratar lättare nu', rightLabel: 'Vi pratar mer försiktigt nu' },
      { id: 'tb0-2', text: 'Vad vi vet', leftLabel: 'Jag vet vad vi behöver', rightLabel: 'Jag vet vad vi undviker' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 1,
    title: 'Det ni inte längre undviker',
    theme: 'Revisiterar: Konflikten',
    question1: 'Tänk på senaste gången ni var oense. Var det annorlunda än det hade varit för ett halvår sedan?',
    question2: 'Finns det en konflikt ni har slutat ta — och vet ni båda varför?',
    sliders: [
      { id: 'tb1-1', text: 'Konflikten', leftLabel: 'Vi går närmare konflikten nu', rightLabel: 'Vi har hittat nya sätt att gå runt den' },
      { id: 'tb1-2', text: 'Vad jag visar', leftLabel: 'Jag visar mer av det som skaver', rightLabel: 'Jag har lärt mig vilka strider jag inte tar' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 2,
    title: 'Vad ni gjorde med det ni sa',
    theme: 'Revisiterar: Längtan',
    question1: 'Av allt ni har sagt till varandra om vad ni vill — vad har faktiskt rört sig?',
    question2: 'Finns det något du sa att du ville som du har ändrat dig om — utan att säga det högt?',
    sliders: [
      { id: 'tb2-1', text: 'Det jag ville', leftLabel: 'Det jag ville — det gäller fortfarande', rightLabel: 'Det jag ville — det ser annorlunda ut nu' },
      { id: 'tb2-2', text: 'Det jag sa', leftLabel: 'Det jag sa att jag ville — det menade jag', rightLabel: 'Det jag sa att jag ville — det var lättare att säga än att göra' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 3,
    title: 'Fortfarande ett val',
    theme: 'Revisiterar: Valet',
    question1: 'Hur märks det i er vardag att ni fortfarande väljer det här — om det märks?',
    question2: 'Vad behöver du för att fortsätta välja — som du inte har bett om?',
    sliders: [
      { id: 'tb3-1', text: 'Valet', leftLabel: 'Jag väljer det här varje dag', rightLabel: 'Jag har slutat tänka på det som ett val' },
      { id: 'tb3-2', text: 'Min partner', leftLabel: 'Min partner vet att jag väljer hen', rightLabel: 'Min partner vet att jag är kvar — men inte varför' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 4,
    title: 'De tysta reglerna',
    theme: 'Revisiterar: Normen',
    question1: 'Vilken outtalad regel mellan er är du mest medveten om just nu?',
    question2: 'Finns det en regel du följer som du aldrig bad om — och som din partner inte vet att du upplever som en regel?',
    sliders: [
      { id: 'tb4-1', text: 'Reglerna', leftLabel: 'Vi har färre outtalade regler nu', rightLabel: 'Vi har bytt ut gamla regler mot nya' },
      { id: 'tb4-2', text: 'Mina regler', leftLabel: 'Jag följer regler jag själv bestämt', rightLabel: 'Jag följer regler jag aldrig gick med på' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 5,
    title: 'Det ni slutat lägga märke till',
    theme: 'Revisiterar: Grunden, cykel 2',
    question1: 'Vad gör din partner för er som du har slutat lägga märke till?',
    question2: 'Vad behöver du för att se det igen — som inte handlar om att din partner gör mer?',
    sliders: [
      { id: 'tb5-1', text: 'Det lilla', leftLabel: 'Jag ser fortfarande det lilla', rightLabel: 'Det lilla har blivit bakgrund' },
      { id: 'tb5-2', text: 'Överraskningar', leftLabel: 'Min partner överraskar mig fortfarande', rightLabel: 'Jag vet vad som kommer' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 6,
    title: 'Vad bråken handlar om',
    theme: 'Revisiterar: Konflikten, cykel 2',
    question1: 'När ni bråkade senast — vad handlade det egentligen om?',
    question2: 'Finns det ett mönster i era bråk som du ser — men som du inte har nämnt?',
    sliders: [
      { id: 'tb6-1', text: 'Bråken', leftLabel: 'Våra bråk handlar om det vi säger', rightLabel: 'Våra bråk handlar om något annat' },
      { id: 'tb6-2', text: 'Vad jag säger', leftLabel: 'Jag säger vad jag behöver när det skaver', rightLabel: 'Jag väntar tills det blir för mycket' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 7,
    title: 'Nya överenskommelser',
    theme: 'Revisiterar: Normen, cykel 2',
    question1: 'Finns det något ni gör annorlunda nu än förra året — något som hållit?',
    question2: 'Finns det en överenskommelse mellan er som bara en av er fortfarande håller?',
    sliders: [
      { id: 'tb7-1', text: 'Förändring', leftLabel: 'Vi har medvetet ändrat hur vi gör saker', rightLabel: 'Vi har glidit tillbaka till det gamla' },
      { id: 'tb7-2', text: 'Överenskommelser', leftLabel: 'Våra nya överenskommelser håller', rightLabel: 'Vi har nya överenskommelser som ingen följer' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 8,
    title: 'Det du inte säger att du vill',
    theme: 'Revisiterar: Längtan, cykel 2',
    question1: 'Vad längtar du efter just nu — som inte handlar om något som är trasigt?',
    question2: 'Finns det något du vill som du inte har sagt — för att du är rädd att det förändrar något?',
    sliders: [
      { id: 'tb8-1', text: 'Det viktigaste', leftLabel: 'Jag har sagt det viktigaste', rightLabel: 'Det viktigaste har jag inte sagt' },
      { id: 'tb8-2', text: 'Min längtan', leftLabel: 'Min längtan handlar om oss', rightLabel: 'Min längtan handlar om mig' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 9,
    title: 'När valet är svårt',
    theme: 'Revisiterar: Valet, cykel 2',
    question1: 'Finns det stunder just nu där valet att vara här känns tungt — inte för att något är fel, utan för att det krävs?',
    question2: 'Vad är det som gör valet svårt just nu som du inte har sagt?',
    sliders: [
      { id: 'tb9-1', text: 'Valet just nu', leftLabel: 'Att välja det här känns lätt just nu', rightLabel: 'Att välja det här kräver något av mig just nu' },
      { id: 'tb9-2', text: 'Varför jag är här', leftLabel: 'Jag vet varför jag är här', rightLabel: 'Jag är här — men skuggorna skiftar' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 10,
    title: 'Det lilla',
    theme: 'Revisiterar: Grunden, cykel 3',
    question1: 'Vad är det lilla mellan er som fortfarande håller?',
    question2: 'Räcker det?',
    sliders: [
      { id: 'tb10-1', text: 'Bara vårt', leftLabel: 'Vi har en sak som är bara vår', rightLabel: 'Jag vet inte vad som är bara vårt längre' },
      { id: 'tb10-2', text: 'Det lilla', leftLabel: 'Det lilla räcker', rightLabel: 'Det lilla räcker inte längre' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
  {
    index: 11,
    title: 'Ett år',
    theme: 'Revisiterar: Valet, cykel 3',
    question1: 'Vad vet du om er nu som du inte visste för ett år sedan?',
    question2: 'Vad vill du säga till din partner som du inte har sagt?',
    sliders: [
      { id: 'tb11-1', text: 'Vad jag vet', leftLabel: 'Jag känner oss bättre nu', rightLabel: 'Jag känner oss annorlunda nu' },
      { id: 'tb11-2', text: 'Vad jag känner', leftLabel: 'Jag är tacksam', rightLabel: 'Jag är förändrad' },
    ],
    reflectionPrompt: 'Något ni vill minnas?',
  },
];

export function getTillbakaCard(index: number): TillbakaCard | undefined {
  return tillbakaCards.find((c) => c.index === index);
}

export default tillbakaCards;
