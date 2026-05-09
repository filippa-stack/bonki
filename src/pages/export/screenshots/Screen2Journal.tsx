/**
 * Screen 2 — Era samtal (Journal). Renders the production Journal page
 * with seeded demo entries via devState=archiveWithHistory.
 */
import RealAppFrame from './RealAppFrame';

export default function Screen2Journal() {
  return <RealAppFrame src="/journal?demo=1&devState=archiveWithHistory" />;
}
