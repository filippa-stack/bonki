/**
 * Bare product home screens for App Store graphics 8–16.
 * Each component embeds the production app at the relevant route via
 * RealAppFrame in browse mode (all categories/cards unlocked).
 *
 * Accepts frameWidth/frameHeight so the iframe sizes match whatever
 * DeviceFrame dimensions the caller renders (bare graphics use a larger
 * device than graphics 1–7).
 */
import RealAppFrame from './RealAppFrame';

const q = '?demo=1&devState=browse&exportFonts=1';

type Props = { frameWidth?: number; frameHeight?: number };

export const ScreenLibrary = (p: Props) => <RealAppFrame src={`/${q}`} {...p} />;
export const ScreenJimHome = (p: Props) => <RealAppFrame src={`/product/jag-i-mig${q}`} {...p} />;
export const ScreenJmaHome = (p: Props) => <RealAppFrame src={`/product/jag-med-andra${q}`} {...p} />;
export const ScreenJivHome = (p: Props) => <RealAppFrame src={`/product/jag-i-varlden${q}`} {...p} />;
export const ScreenVardagsHome = (p: Props) => <RealAppFrame src={`/product/vardagskort${q}`} {...p} />;
export const ScreenSyskonHome = (p: Props) => <RealAppFrame src={`/product/syskonkort${q}`} {...p} />;
export const ScreenSexHome = (p: Props) => <RealAppFrame src={`/product/sexualitetskort${q}`} {...p} />;
export const ScreenVvHome = (p: Props) => <RealAppFrame src={`/product/still-us${q}`} {...p} />;
