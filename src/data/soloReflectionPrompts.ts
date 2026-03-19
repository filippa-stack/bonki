/**
 * Still Us v3.0 — Solo-mode reflection prompts.
 * Used when a user is doing the program solo (no partner linked).
 * One per card (22 total).
 */

const soloReflectionPrompts: Record<number, string> = {
  0: 'Vad har ni börjat göra annorlunda — som du inte är säker på att ni pratade om?',
  1: 'Hur ofta hamnar era samtal i logistik — och när märker du det?',
  2: 'Vad har du slutat göra sedan ni fick barn — som du inte ens tänker på längre?',
  3: 'Vad brukar hålla igång tankarna i dig efter att barnen somnat?',
  4: 'Vilka roller hemma har du tagit som du aldrig bad om?',
  5: 'Hur vet du i stunden att det du gör med barnen är rätt — eller vet du inte det?',
  6: 'Hur syns det på dig när pressen ökar — även om du inte säger något?',
  7: 'Vilken typ av situation med barnen gör dig mest osäker?',
  8: 'Hur ser det ut för dig när du behöver utrymme — vad slutar du göra?',
  9: 'Hur brukar du hantera det när ditt självförtroende sviktar — visar du det eller döljer du det?',
  10: 'Vilken typ av situation med barnen väcker reaktioner som överraskar dig?',
  11: 'Efter att du satt en gräns för barnen — vad händer i dig?',
  12: 'Vilken värdering tror du att dina barn redan har lärt sig av dig — utan att du avsiktligt lärde ut den?',
  13: 'Inför en familjeträff — anpassar du dig eller håller du din linje?',
  14: 'Vilken tradition är viktigast för dig — egentligen?',
  15: 'Tänk på ett ögonblick nyligen när du agerade under press. Var det du?',
  16: 'Vad skulle hjälpa dig att ta mer plats — för dina egna mål?',
  17: 'Vad skulle du vilja spendera pengar på som du aldrig nämner?',
  18: 'Vad skiljer ett modigt beslut från ett dumdristigt — för dig?',
  19: 'Vad har ni slutat göra tillsammans — utan att besluta det?',
  20: 'Vad känns som närhet för dig — och hur signalerar du det?',
  21: 'Vad gör du i relationen som du gör helt för att du vill — inte för att du borde?',
};

export function getSoloReflectionPrompt(cardIndex: number): string {
  return soloReflectionPrompts[cardIndex] ?? `Reflektera kring vecka ${cardIndex + 1}.`;
}

export default soloReflectionPrompts;
