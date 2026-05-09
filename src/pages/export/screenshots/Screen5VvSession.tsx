/**
 * Screen 5 — Vårt Vi session, "Det osynliga ansvaret" (smallest-we), step 0.
 * Pre-seeds a paused demo session so CardView resumes on the cream prompt
 * card with the opening question visible.
 */
import { useEffect } from 'react';
import RealAppFrame from './RealAppFrame';
import { saveDemoSession } from '@/lib/demoSession';

const CARD_ID = 'su-07-smallest-we';

export default function Screen5VvSession() {
  useEffect(() => {
    saveDemoSession({
      productId: 'still_us',
      cardId: CARD_ID,
      categoryId: 'emotional-intimacy',
      currentStepIndex: 0,
    });
  }, []);

  return <RealAppFrame src={`/card/${CARD_ID}?demo=1&devState=browse&step=0`} />;
}
