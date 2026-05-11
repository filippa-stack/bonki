/**
 * Bare product home screens for App Store graphics 8–16.
 * Each component embeds the production app at the relevant route via
 * RealAppFrame in browse mode (all categories/cards unlocked).
 */
import RealAppFrame from './RealAppFrame';

const q = '?demo=1&devState=browse&exportFonts=1';

export const ScreenLibrary = () => <RealAppFrame src={`/${q}`} />;
export const ScreenJimHome = () => <RealAppFrame src={`/product/jag-i-mig${q}`} />;
export const ScreenJmaHome = () => <RealAppFrame src={`/product/jag-med-andra${q}`} />;
export const ScreenJivHome = () => <RealAppFrame src={`/product/jag-i-varlden${q}`} />;
export const ScreenVardagsHome = () => <RealAppFrame src={`/product/vardagskort${q}`} />;
export const ScreenSyskonHome = () => <RealAppFrame src={`/product/syskonkort${q}`} />;
export const ScreenSexHome = () => <RealAppFrame src={`/product/sexualitetskort${q}`} />;
export const ScreenVvHome = () => <RealAppFrame src={`/product/still-us${q}`} />;
