/**
 * Screen 3 — Jag i Mig product home. Renders the production KidsProductHome
 * via /product/jag-i-mig in browse mode (all cards unlocked, real
 * useCardImage illustrations resolve from /card-images/jim-*.webp).
 */
import RealAppFrame from './RealAppFrame';

export default function Screen3JimHome() {
  return <RealAppFrame src="/product/jag-i-mig?demo=1&devState=browse" />;
}
