/**
 * Screen 4 — Jag i Mig session, "Glad" card, step 2 of 4.
 * Renders the real CardView with the step URL param. Optional scrollY lets
 * the export spec lock the iframe to viewport top so the character head
 * stays in frame.
 */
import RealAppFrame from './RealAppFrame';

interface Props {
  scrollY?: number;
}

export default function Screen4JimSession({ scrollY = 0 }: Props) {
  return <RealAppFrame src="/card/jim-glad?demo=1&devState=browse&step=1" scrollY={scrollY} />;
}
