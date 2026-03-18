/**
 * Still Us v3.0 — Threshold mood framings.
 * Maps mood combination (user + partner) to a framing text
 * displayed at the start of Session 1.
 *
 * 4 moods: Trött, Nyfiken, Orolig, Öppen
 * Both Nyfiken/Öppen = null (no framing needed)
 * One or both Trött = softener text
 * One or both Orolig = courage text + exit CTA option
 */

export type ThresholdMood = 'Trött' | 'Nyfiken' | 'Orolig' | 'Öppen';

export interface ThresholdFraming {
  title: string;
  body: string;
  showExitCta?: boolean;
}

/**
 * Returns framing text based on the two moods, or null if none needed.
 * Moods are sorted alphabetically to normalise key order.
 */
export function getThresholdFraming(
  userMood: ThresholdMood,
  partnerMood: ThresholdMood,
): ThresholdFraming | null {
  const moods = [userMood, partnerMood];

  const hasOrolig = moods.includes('Orolig');
  const hasTrott = moods.includes('Trött');
  const allPositive = moods.every((m) => m === 'Nyfiken' || m === 'Öppen');

  // Both positive — no framing needed
  if (allPositive) return null;

  // Any Orolig — courage framing with exit CTA
  if (hasOrolig) {
    return {
      title: 'Det är modigt att vara här',
      body: 'Ni behöver inte göra allt ikväll. Ni kan pausa när som helst, och det är helt okej att avsluta om det behövs.',
      showExitCta: true,
    };
  }

  // Any Trött — softener framing
  if (hasTrott) {
    return {
      title: 'Det är okej att ta det lugnt',
      body: 'Ni behöver inte prestera. Att vara här tillsammans räcker. Ta det i er egen takt.',
    };
  }

  // Mixed but neither Trött nor Orolig (e.g. Nyfiken + other)
  return null;
}

// Legacy compat: also export the 4 mood options
export const MOOD_OPTIONS: ThresholdMood[] = ['Trött', 'Nyfiken', 'Orolig', 'Öppen'];
