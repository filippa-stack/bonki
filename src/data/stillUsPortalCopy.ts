/**
 * Vårt Vi v3.1 — Portal copy per card.
 * Subtitle override (shown above the preview tile) + preparation paragraph
 * (shown as the body before the user starts the samtal).
 *
 * Keyed by bare card id. Falls back to content.ts subtitle if a card id
 * is missing here.
 */

export interface PortalCopy {
  /** Italic subtitle shown in the portal header. */
  subtitle: string;
  /** Preparation paragraph shown to set the tone before starting. */
  preparation: string;
}

const stillUsPortalCopy: Record<string, PortalCopy> = {
  'our-traditions': {
    subtitle: 'Mönstren vi ärvde – och de vi skapar idag',
    preparation: 'Det här samtalet har sina rötter i tiden innan ni träffades. I barndomshemmet, i det som sades och det som förblev outsagt. Fokus ligger inte på era föräldrar, utan på vad ni har tagit med er därifrån och hur ni väljer att förhålla er till det nu.',
  },
  'identity-shift': {
    subtitle: 'Hur vi formats sedan vi blev ett par',
    preparation: 'Människor förändras över tid. Det som en gång förde er samman är inte nödvändigtvis det som definierar er idag – det är en naturlig del av livet. Reflektera över hur ni har förändrats, både vad gäller självinsikt och hur den andre har sett er växa.',
  },
  'listening-presence': {
    subtitle: 'Det jag längtar efter att du ser – och det du kanske missar',
    preparation: 'Att känna sig sedd av sin partner är ett av kärlekens mest grundläggande behov. Det handlar om de stunder då ni genuint möts och landar i varandra. Utforska var i er vardag denna bekräftelse finns, och var ni upplever att den saknas.',
  },
  'expressing-needs': {
    subtitle: 'Tystnadens innehåll – och priset vi betalar',
    preparation: 'Vi håller ofta tillbaka tankar och känslor inför dem vi älskar mest, antingen för att skydda dem, oss själva eller för att orden saknas. Syftet med detta samtal är inte att blotta allt, utan att synliggöra vad som döljer sig i tystnaden och hur den påverkar er.',
  },
  'behind-the-scenes': {
    subtitle: 'Det som vänner ger – det relationen inte rymmer',
    preparation: 'Nära vänskaper ger utrymme för delar av oss själva som relationen inte alltid har plats för. Detta är inte ett tecken på brist i paret, utan en naturlig del av ett komplett liv. Utforska vad era vänskaper tillför era liv, hur ni balanserar dem gentemot er parrelation och hur denna balans har skiftat över tid.',
  },
  'thoughtful-space': {
    subtitle: 'Omvärldens blickar – hur påverkas vi av andras åsikter?',
    preparation: 'Inga par lever i ett vakuum. Kommentarer från familj, vänner eller kollegor påverkar hur vi ser på oss själva som par. Reflektera över vilka röster ni har låtit väga tyngst genom åren och hur ni vill förhålla er till detta inflytande framöver.',
  },
  'self-esteem-wavering': {
    subtitle: 'Livet utanför oss – nödvändigheten av att få andas fritt',
    preparation: 'Paradoxalt nog är något av det viktigaste i en relation det som finns utanför den. Egna intressen, separata vänskaper och platser där man får vara sig själv utan att vara en del av "paret" är avgörande. Utforska vad dessa egna utrymmen ger er – och vad som händer med er som par när de riskerar att gå förlorade.',
  },
  'smallest-we': {
    subtitle: 'Tankekraften och den mentala bördan',
    preparation: 'I varje relation finns ett ansvar som sällan syns men ständigt tar plats: det mentala planerandet och logistiken. Samtalet handlar inte om hushållssysslor, utan om hur ansvaret för ert gemensamma liv är fördelat och om balansen känns hållbar för er båda.',
  },
  'worth-spending-on': {
    subtitle: 'Vad ekonomi betyder för oss – bortom kronor och ören',
    preparation: 'Pengar representerar ofta värden som trygghet, frihet eller kontroll, djupt rotade i våra erfarenheter. Det här samtalet handlar inte om er inkomst eller era kontoutdrag, utan om vilken innebörd pengar har för er och hur dessa perspektiv påverkar er som par.',
  },
  'facing-adversity': {
    subtitle: 'Omsorgens förutsättningar – balansen mellan närhet och tyngd',
    preparation: 'Att finnas där för varandra under svåra perioder är en av relationens viktigaste uppgifter. Men det finns en punkt där omsorg kan övergå i en tung börda och närvaro kan kännas som ett krav. Det här samtalet handlar inte om att väga vem som ger mest, utan om att identifiera vilket stöd ni faktiskt behöver – och hur ni kan ge det utan att någon förlorar sig själv i omhändertagandet.',
  },
  'conflict-repair': {
    subtitle: 'Konflikternas reaktionsmönster – vad döljer sig bakom tystnaden?',
    preparation: 'När en konflikt känns överväldigande, reagerar kroppen ofta snabbare än tanken. Vi drar oss undan, tystnar, går i försvarsställning eller stänger av, ofta utan att förstå varför. Reflektera över era egna reaktionsmönster: vad behöver ni egentligen av varandra när orden inte längre räcker till?',
  },
  'adrift': {
    subtitle: 'När begäret möter vardagen – och allt som sker däremellan',
    preparation: 'Begär i en parrelation är sällan konstant. Det fluktuerar beroende på stress, sömn, livsskeden och känslan av att bli sedd och bekräftad. Det här samtalet fokuserar inte på hur ofta ni har sex, utan på hur ni förhåller er till begäret när det är närvarande respektive frånvarande – och hur ni underhåller närheten oavsett vilket.',
  },
  'love-languages': {
    subtitle: 'Det vi suktar efter – men sällan vågar be om',
    preparation: 'I alla långvariga relationer finns det önskningar som förblir osagda. Ibland för att de känns triviala, ibland för att de känns för omfattande, eller för att vi tappat hoppet om att den andre ska förstå. Reflektera över vilka behov av närhet ni bär på men sällan uttrycker, och vad det skulle innebära – i både risk och vinst – att börja sätta ord på dem.',
  },
  'when-life-tilts': {
    subtitle: 'Hur vi finner varandra igen – efter att ha orsakat varandra smärta',
    preparation: 'Alla par sårar varandra. En relations hållbarhet avgörs inte av att sår uppstår, utan av hur ni reparerar dem. Detta samtal handlar inte om att placera skuld, utan om att utforska hur ni tidigare hanterat konflikter och vad som krävs för att ett sår ska kännas genuint läkt, snarare än bara förlåtet.',
  },
  'family-ab': {
    subtitle: 'Dragningen utåt – och var gränserna går',
    preparation: 'Det är mänskligt att lägga märke till andra. Det är inte själva uppmärksamheten som utgör ett hot mot relationen, utan hur vi hanterar den och hur vi kommunicerar kring den. Utforska var gränsdragningen går hos er mellan att bara se och att faktiskt agera, och huruvida ni någonsin har definierat dessa gränser gemensamt.',
  },
  'parenting-boundaries': {
    subtitle: 'Det icke-förhandlingsbara – och det som aldrig sagts',
    preparation: 'Detta är det mest tyngdande samtalet i "Vårt Vi". Ni ska tala om de gränser ni bär inom er men sällan uttalar – det som är absolut för er och det ni befarar att ni inte skulle kunna förlåta. Kom ihåg att ni har möjligheten att pausa: säg "jag behöver en paus" om det blir övermäktigt. Det finns ingen prestige i att ta sig igenom hela kortet under en kväll. Det är klokt att stanna upp när kroppen signalerar att det är dags.',
  },
  'different-parenting-styles': {
    subtitle: 'Förväntningar på föräldraskap – och det vi inte vågat uttala',
    preparation: 'Frågan om att skaffa barn handlar sällan bara om logistik. Den är laddad med längtan, rädslor, förväntningar och arv från er egen uppväxt. Reflektera över vilken roll barn spelar i er vision för framtiden och om ni har varit helt ärliga mot varandra, eller om det finns outtalade tankar som fortfarande dröjer kvar i tystnaden.',
  },
  'parenting-exhaustion': {
    subtitle: 'Det vi bär på – och vad det kostar att förverkliga våra mål',
    preparation: 'En långvarig relation är en ständig förhandling mellan två individers drömmar. Vissa mål kan uppnås gemensamt, medan andra kräver utrymme, tid eller uppoffringar som inte alltid fördelas jämnt. Utforska vilka av era drömmar som är icke-förhandlingsbara, vilka ni redan valt att lägga åt sidan, och hur ni vill förhålla er till de drömmar som ännu inte fått ta plats.',
  },
};

export function getPortalCopy(bareCardId: string): PortalCopy | undefined {
  return stillUsPortalCopy[bareCardId];
}

export default stillUsPortalCopy;
