/**
 * Marketing 05 — Jag i Världen portal page.
 * Embeds the production KidsCardPortal route via RealAppFrame.
 */
import RealAppFrame from '../screenshots/RealAppFrame';

const SRC = '/product/jag-i-varlden/portal/jiv-varlden-omkring-mig?demo=1&devState=browse&exportFonts=1';

export default function MarketingJivPortal() {
  return <RealAppFrame src={SRC} />;
}
