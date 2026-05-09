/**
 * Screen 2 — Era samtal (Journal). Uses user-provided real iPhone screenshot
 * directly. The screenshot already includes the iOS status bar, so the
 * surrounding spec sets `showChrome={false}` to avoid double-painting.
 */
import journalImg from '@/assets/exports/journal-real.png';

export default function Screen2Journal() {
  return (
    <img
      src={journalImg}
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
