/**
 * Screen 5 — Vårt Vi session ("Det osynliga ansvaret" / smallest-we).
 * Uses the user-provided real iPhone screenshot directly. The screenshot
 * already includes the iOS status bar, so the surrounding spec sets
 * `showChrome={false}` to avoid double-painting.
 */
import vvImg from '@/assets/exports/vart-vi-session-real.png';

export default function Screen5VvSession() {
  return (
    <img
      src={vvImg}
      alt=""
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center top',
        display: 'block',
      }}
    />
  );
}
