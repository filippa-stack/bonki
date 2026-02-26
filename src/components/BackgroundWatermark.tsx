import { useSearchParams } from 'react-router-dom';
import bonkiLogo from '@/assets/bonki-logo.png';

export type WatermarkMode = 'full' | 'behind' | 'hero' | 'heroAlt' | null;

/**
 * Reads ?watermark= from URL.
 * - full:    Giant centered logo filling the viewport
 * - behind:  Logo behind tiles (tiles become semi-transparent via CSS class)
 * - hero:    Logo fills the top zone, behind everything (z-0)
 * - heroAlt: Same size/pos as hero but z-[1] + gradient fade — logo shows through cards
 * - tile:    Handled inside CategoryCard directly
 */
export function useWatermarkMode(): WatermarkMode {
  const [params] = useSearchParams();
  const raw = params.get('watermark');
  if (raw === 'full' || raw === 'behind' || raw === 'hero' || raw === 'heroAlt' || raw === 'tile') return raw as WatermarkMode;
  return null;
}

export default function BackgroundWatermark() {
  const mode = useWatermarkMode();

  if (mode === 'full') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center" aria-hidden="true">
        <img
          src={bonkiLogo}
          alt=""
          className="w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] object-contain opacity-[0.04] select-none"
          draggable={false}
        />
      </div>
    );
  }

  if (mode === 'behind') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center" aria-hidden="true">
        <img
          src={bonkiLogo}
          alt=""
          className="w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] object-contain opacity-[0.06] select-none"
          draggable={false}
        />
      </div>
    );
  }

  if (mode === 'hero') {
    return (
      <div
        className="absolute inset-x-0 pointer-events-none z-0 flex items-start justify-center"
        style={{ top: '12px' }}
        aria-hidden="true"
      >
        <img
          src={bonkiLogo}
          alt=""
          className="object-contain select-none"
          style={{
            width: '96vw',
            maxWidth: '600px',
            opacity: 0.07,
            filter: 'saturate(0.3)',
          }}
          draggable={false}
        />
      </div>
    );
  }

  if (mode === 'heroAlt') {
    return (
      <div
        className="absolute inset-x-0 pointer-events-none z-[1] flex items-start justify-center overflow-hidden"
        style={{
          top: '56px',          /* start below header so logo edge is hidden */
          marginTop: '-44px',   /* pull visual position back up to match original top:12px */
          paddingTop: '44px',   /* compensate so img stays in same visual spot */
          clipPath: 'inset(44px 0 0 0)', /* clip the top 44px that would bleed into header */
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}
        aria-hidden="true"
      >
        <img
          src={bonkiLogo}
          alt=""
          className="object-contain select-none"
          style={{
            width: '96vw',
            maxWidth: '600px',
            opacity: 0.06,
            filter: 'saturate(0.3)',
          }}
          draggable={false}
        />
      </div>
    );
  }

  return null;
}
