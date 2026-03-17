/**
 * Still Us v2.5 — Solo-mode reflection prompts.
 * Used when a user is doing the program solo (no partner linked).
 * One per card (22 total). Placeholder for unauthored.
 */

const soloReflectionPrompts: Record<number, string> = {
  0: 'Tänk på ert minsta vi. Vad är det som gör er till just er, utan allt annat runtomkring?',
  1: 'Hur ser er rytm ut? Vad fungerar, och vad skulle du vilja ändra?',
  2: 'Vad gör att du känner dig trygg i en relation? Vad saknas ibland?',
  3: 'När kände du dig senast riktigt lyssnad på? Hur var det?',
  4: 'Vilka behov har du som du sällan sätter ord på?',
  // 5-21: placeholders
  ...Object.fromEntries(
    Array.from({ length: 17 }, (_, i) => [
      i + 5,
      `[PLACEHOLDER] Solo-reflektion för vecka ${i + 6}.`,
    ])
  ),
};

export function getSoloReflectionPrompt(cardIndex: number): string {
  return soloReflectionPrompts[cardIndex] ?? `Reflektera kring vecka ${cardIndex + 1}.`;
}

export default soloReflectionPrompts;
