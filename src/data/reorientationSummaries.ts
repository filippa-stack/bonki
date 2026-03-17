/**
 * Still Us v2.5 — Session 2 reorientation summaries.
 * Shown at the start of Session 2 to recap Session 1.
 * One per card (22 total). Placeholder for unauthored.
 */

const reorientationSummaries: Record<number, string> = {
  0: 'Förra gången pratade ni om ert minsta vi — vad ni är när allt annat skalas bort.',
  1: 'Ni utforskade er rytm och hur vardagen formar ert utrymme.',
  2: 'Ni talade om trygghet — vad som gör att ni vågar vara ärliga.',
  3: 'Ni reflekterade över att lyssna, och vad det betyder att verkligen höra.',
  4: 'Ni öppnade upp om behov — era egna och varandras.',
  // 5-21: placeholders
  ...Object.fromEntries(
    Array.from({ length: 17 }, (_, i) => [
      i + 5,
      `[PLACEHOLDER] Reorienteringstext för vecka ${i + 6}.`,
    ])
  ),
};

export function getReorientationSummary(cardIndex: number): string {
  return reorientationSummaries[cardIndex] ?? `Vecka ${cardIndex + 1} — fortsätt där ni slutade.`;
}

export default reorientationSummaries;
