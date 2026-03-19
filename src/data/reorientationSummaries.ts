/**
 * Still Us v3.0 — Session 2 reorientation summaries.
 * Shown at the start of Session 2 to recap Session 1.
 * One per card (22 total).
 */

const reorientationSummaries: Record<number, string> = {
  0: 'Ni lämnade ett ögonblick — ett tillfälle då ni märkte att ni glidit isär.',
  1: 'Ni stannade vid något som försvunnit tyst.',
  2: 'Ni pratade om en anpassning — och om den var vald eller inte.',
  3: 'Ni stannade vid något ni fortsätter göra trots att det kanske inte behövs.',
  4: 'Ni tittade på en roll ni inte vill ge bort — men ibland önskar att ni kunde dela.',
  5: 'Ni stannade vid ett ögonblick där ni förklarade er mer än ni ville.',
  6: 'Ni pratade om vad ni antog om varandra — innan ni visste.',
  7: 'Ni utforskade skillnaden mellan att visa enighet och att känna den.',
  8: 'Ni stannade vid gränsen mellan utrymme och ensamhet.',
  9: 'Ni pratade om vad som gör det lättare att hålla tyst.',
  10: 'Ni lämnade en reaktion — och frågan om den egentligen handlade om något äldre.',
  11: 'Ni stannade vid den starka reaktionen — och vad den egentligen svarade på.',
  12: 'Ni lämnade ett ögonblick där ni inte levde som ni tror på.',
  13: 'Ni pratade om hur ni hanterar släkten — som lag eller som individer.',
  14: 'Ni stannade vid en tradition som kanske är redo att bli er egen.',
  15: 'Ni pratade om vad ni gör med era misstag — tar upp dem, eller håller tyst.',
  16: 'Ni lämnade frågan om vad stödet kostade.',
  17: 'Ni stannade vid känslan av att vilja satsa på något — utan att bli förstådd.',
  18: 'Ni klassificerade ett beslut — modigt, ansvarsfullt, eller något annat.',
  19: 'Ni pratade om hur avståndet växer — efter bråk, eller i tystnaden.',
  20: 'Ni stannade vid hur er partner visar att hen vill vara nära.',
  21: 'Ni lämnade ett ögonblick där ni kände att ni aktivt valde varandra.',
};

export function getReorientationSummary(cardIndex: number): string {
  return reorientationSummaries[cardIndex] ?? `Vecka ${cardIndex + 1} — fortsätt där ni slutade.`;
}

export default reorientationSummaries;
