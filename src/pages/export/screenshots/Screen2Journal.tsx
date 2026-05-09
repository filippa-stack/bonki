/**
 * Screen 2 — Era samtal (Journal). Uses pre-cropped clean journal screenshot
 * (status bar / Dynamic Island / device bezel removed). DeviceFrame paints
 * canonical iOS chrome on top via showChrome={true} in the spec.
 */
import journalImg from '@/assets/exports/journal-clean.png';

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
