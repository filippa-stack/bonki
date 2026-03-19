/**
 * Still Us v3.0 — Threshold mood framings.
 * Maps mood combination (user + partner) to a framing text
 * displayed at the start of Session 1.
 *
 * 4 moods: Trött, Nyfiken, Orolig, Öppen
 * Both Nyfiken/Öppen = null (no framing needed)
 * One or both Trött = softener text
 * One or both Orolig = courage text
 */

export type ThresholdMood = 'Trött' | 'Nyfiken' | 'Orolig' | 'Öppen';

export interface ThresholdFraming {
  title: string;
  body: string;
  showExitCta?: boolean;
}

/**
 * Returns framing text based on the two moods, or null if none needed.
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

  // Any Orolig — courage framing
  if (hasOrolig) {
    return {
      title: 'Det är modigt att vara här',
      body: 'Det är modigt att öppna något när det känns oroligt. Ni bestämmer takten.',
      showExitCta: true,
    };
  }

  // Any Trött — softener framing
  if (hasTrott) {
    return {
      title: 'Det är okej att ta det lugnt',
      body: 'Det är okej att vara trötta. Ni behöver inte vara på topp för det här.',
    };
  }

  // Mixed but neither Trött nor Orolig
  return null;
}

// Legacy compat: also export the 4 mood options
export const MOOD_OPTIONS: ThresholdMood[] = ['Trött', 'Nyfiken', 'Orolig', 'Öppen'];
