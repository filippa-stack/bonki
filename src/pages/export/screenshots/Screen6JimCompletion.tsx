/**
 * Screen 6 — Jag i Mig completion + takeaway for `jim-glad`.
 * Pre-seeds the demo completion state and writes the approved takeaway
 * into the demo-takeaway localStorage key consumed by CompletedSessionView
 * when ?demo=1 is present.
 */
import { useEffect } from 'react';
import RealAppFrame from './RealAppFrame';
import { completeDemoSession } from '@/lib/demoSession';

const CARD_ID = 'jim-glad';

export const DEMO_TAKEAWAY_TEXT =
  'Att Lova mår bra. På riktigt. När vi frågade vad som gjorde henne gladast sa hon "att vi pratar såhär". Vi har varit oroliga utan att säga det till varandra på flera månader.';

export const DEMO_TAKEAWAY_KEY = (cardId: string) => `bonki-demo-takeaway-${cardId}`;

export default function Screen6JimCompletion() {
  useEffect(() => {
    completeDemoSession('jag-i-mig', CARD_ID);
    localStorage.setItem(DEMO_TAKEAWAY_KEY(CARD_ID), DEMO_TAKEAWAY_TEXT);
  }, []);

  return <RealAppFrame src={`/card/${CARD_ID}?demo=1&devState=completed&view=completed&exportFonts=1`} />;
}
