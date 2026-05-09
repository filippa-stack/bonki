/**
 * Screen 1 — Vårt Vi marquee (Recognition).
 * Renders the real production library (ProductLibrary) at /. The Vårt Vi
 * marquee is the dominant element at the top.
 */
import RealAppFrame from './RealAppFrame';

export default function Screen1Marquee() {
  return <RealAppFrame src="/?demo=1&devState=browse" />;
}
