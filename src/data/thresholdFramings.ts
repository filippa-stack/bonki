/**
 * Still Us v2.5 — Threshold mood framings.
 * Maps mood combination (user + partner) to a framing text
 * displayed at the start of Session 1.
 */

export type ThresholdMood = 'light' | 'mixed' | 'heavy';

export interface ThresholdFraming {
  title: string;
  body: string;
}

/**
 * Framing text based on combined moods.
 * Key format: `${userMood}-${partnerMood}` (alphabetically sorted).
 */
const framings: Record<string, ThresholdFraming> = {
  'light-light': {
    title: 'Ni verkar båda vara på gott humör',
    body: 'Det är fint. Använd den energin för att verkligen lyssna på varandra ikväll.',
  },
  'light-mixed': {
    title: 'Ni är på lite olika ställen just nu',
    body: 'Det är helt okej. Var nyfiken på var din partner befinner sig.',
  },
  'light-heavy': {
    title: 'En av er bär på något tyngre',
    body: 'Ge utrymme för det. Ibland räcker det att vara närvarande.',
  },
  'mixed-mixed': {
    title: 'Det är blandat för er båda',
    body: 'Livet är sällan entydigt. Ta det lugnt med varandra.',
  },
  'mixed-heavy': {
    title: 'Det är en tyngre kväll',
    body: 'Ni behöver inte prestera. Att vara här tillsammans räcker.',
  },
  'heavy-heavy': {
    title: 'Ni bär båda på något tungt',
    body: 'Tack för att ni gör det här ändå. Var försiktiga med varandra.',
  },
};

export function getThresholdFraming(
  userMood: ThresholdMood,
  partnerMood: ThresholdMood
): ThresholdFraming {
  const key = [userMood, partnerMood].sort().join('-');
  return framings[key] ?? framings['mixed-mixed'];
}

export default framings;
