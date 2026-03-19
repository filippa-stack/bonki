/**
 * Still Us v3.0 — Tänk om content for each card.
 * Each card has a scenario (preamble text) and a question (discussion prompt).
 */

export interface TankOmEntry {
  scenario: string;
  question: string;
}

export const TANK_OM_CONTENT: Record<string, TankOmEntry> = {
  card_1: {
    scenario: 'Allt fungerar. Men något som tidigare var självklart har blivit tyst.',
    question: 'Vilka är de tidiga tecknen, för dig, på att ni börjar glida isär — innan det är uppenbart?',
  },
  card_2: {
    scenario: 'Ni löser vardagen smidigt. Samtalen handlar om tider, ansvar och barn.',
    question: 'Finns det något mellan er som har slutat leva — även om allt fortfarande fungerar?',
  },
  card_3: {
    scenario: 'Behov som hålls tillbaka för att vardagen ska fungera.',
    question: 'Välj en förändring sedan ni fick barn som du vet inte var ditt val. Hur känns det idag — har du gjort fred med den, eller skaver den fortfarande?',
  },
  card_4: {
    scenario: 'Efter läggning gör ni olika saker. Ingen säger något, men båda drar egna slutsatser.',
    question: 'Vad gör du — utan att säga det rakt ut — när du känner att kvällen är slut, men din partner inte verkar märka det?',
  },
  card_5: {
    scenario: 'En uppgift har blivit "din". Den andra kliver undan. Med tiden blir skillnaden självklar.',
    question: 'En uppgift har tillhört dig så länge att den blivit en del av vem du är hemma. Vad skulle förändras mellan er om du släppte den?',
  },
  card_6: {
    scenario: 'Ni gör samma saker, men på olika sätt. Barnet börjar navigera mellan er.',
    question: 'När barnen märker att ni gör saker på olika sätt — vad händer mellan er i det ögonblicket?',
  },
  card_7: {
    scenario: 'Ni möter en svår period. Två impulser krockar: agera nu, eller vänta.',
    question: 'Ni har just fått svåra besked. En av er vill agera, den andra behöver stillhet. Vad säger ni till varandra — eller vad låter ni bli att säga?',
  },
  card_8: {
    scenario: 'Efter en jobbig kväll tappar en av er tålamodet inför barnet. Den andra reagerar på det, men ni tar inte diskussionen där och då.',
    question: 'När en av er tappat tålamodet inför barnen — vad är det första som händer mellan er efteråt?',
  },
  card_9: {
    scenario: '',
    question: 'Beskriv hur det känns i kroppen — i ögonblicket efter att en av er har dragit sig undan och dörren stängs.',
  },
  card_10: {
    scenario: 'En motgång som gör att någon börjar ta mindre plats. Det märks inte i ord — men i ton, initiativ, och tystnad.',
    question: 'Din partner har börjat ta mindre plats — i samtalen, i besluten, i initiativet. Vad gör du med det du märker?',
  },
  card_11: {
    scenario: 'En vardagssituation väcker starka reaktioner. Den ena reagerar på händelsen, den andra på känslan som väcks.',
    question: 'När ni reagerat olika på något med barnen — brukar ni kunna prata om det utan att det blir en tävling om vem som hade rätt?',
  },
  card_12: {
    scenario: 'Ett beteende väcker olika impulser. Agera direkt — eller avvakta.',
    question: 'När en av er vill agera direkt och den andra vill avvakta — hur känns det i stunden?',
  },
  card_13: {
    scenario: 'Barnet beter sig respektlöst. Gränsen sätts — men det som följer handlar mer om tonen och ordvalet än om barnet.',
    question: 'Tänk på senaste gången ni reagerade olika i ett spänt ögonblick med barnen. Vad försökte du skydda?',
  },
  card_14: {
    scenario: 'En släkting ifrågasätter er inför barnet. Det som sårar mest är inte orden, utan att ni inte är helt synkade i stunden.',
    question: 'När en släkting ifrågasätter er inför barnen och ni inte hunnit prata ihop er — hur hittar ni tillbaka till att stå enade?',
  },
  card_15: {
    scenario: 'Traditioner är inte neutrala. De bär på vems värld som fick mest plats.',
    question: 'Vad har det kostat dig att låta en tradition som inte är din ta plats — och har du någonsin sagt det högt?',
  },
  card_16: {
    scenario: 'Barnet gör upprepade val som går emot era värderingar. Frustrationen växer.',
    question: 'Vad händer mellan er när frustrationen gör att en av er agerar på ett sätt som den andra inte kan stå bakom?',
  },
  card_17: {
    scenario: 'Någon vill satsa på något som tar mycket energi. Balansen skiftar.',
    question: 'Vad har ni i efterhand önskat att ni pratat om — innan något stort tog fart?',
  },
  card_18: {
    scenario: 'Ni står inför en satsning. Frågan om vad som är "värt det" väcker olika svar.',
    question: 'Tänk på den senaste satsningen ni var oense om. Vad gjorde den värd det för dig — eller vad fick dig att tveka?',
  },
  card_19: {
    scenario: 'En av er vill starta eget eller studera vidare, vilket innebär lägre inkomster under en period.',
    question: 'Vilka är de tidiga tecknen för dig på att en risk håller på att tippa över — att bli för kostsam?',
  },
  card_20: {
    scenario: 'Ni bråkar sällan. Men ni skrattar inte heller som förr. Närhet skjuts upp till "sen".',
    question: 'Vad är det som gör att du börjar undra om det här är mer än en tyst period?',
  },
  card_21: {
    scenario: 'Trötthet och längtan krockar. Press och tolkningar smyger sig in — trots goda intentioner.',
    question: 'Hur skiljer ni hos er på ett "nej" till sex och ett "nej" till varandra?',
  },
  card_22: {
    scenario: 'Relationen fungerar. Inget är trasigt. Men ni vet båda att man också kan gå.',
    question: 'Vad händer i dig när du påminner dig om att du inte stannar för att du måste — utan för att du vill?',
  },
};

/**
 * Look up Tänk om content by card_id (card_N format).
 * Returns undefined if card_id not found.
 */
export function getTankOmContent(cardId: string): TankOmEntry | undefined {
  return TANK_OM_CONTENT[cardId];
}
