/**
 * Tänk om content for each card.
 * Each card has a scenario (preamble text) and a question (discussion prompt).
 * Content team will replace placeholder strings with real content.
 */

export interface TankOmEntry {
  scenario: string;
  question: string;
}

export const TANK_OM_CONTENT: Record<string, TankOmEntry> = Object.fromEntries(
  Array.from({ length: 22 }, (_, i) => [
    `card_${i + 1}`,
    {
      scenario: `[Tänk om-scenario för vecka ${i + 1} — ersätt med riktigt innehåll]`,
      question: `[Tänk om-fråga för vecka ${i + 1} — ersätt med riktigt innehåll]`,
    },
  ])
);

/**
 * Look up Tänk om content by card_id (card_N format).
 * Returns undefined if card_id not found.
 */
export function getTankOmContent(cardId: string): TankOmEntry | undefined {
  return TANK_OM_CONTENT[cardId];
}
