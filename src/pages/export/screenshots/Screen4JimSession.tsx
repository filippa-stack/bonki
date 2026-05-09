/**
 * Screen 4 — Jag i Mig session, "Glad" card, step 2 of 4.
 * Renders the real CardView with the step URL param to land on step 2.
 */
import RealAppFrame from './RealAppFrame';

export default function Screen4JimSession() {
  return <RealAppFrame src="/card/jim-glad?demo=1&devState=browse&step=1" />;
}
