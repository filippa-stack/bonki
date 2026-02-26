import { useSearchParams } from 'react-router-dom';
import bonkiLogo from '@/assets/bonki-logo.png';

export type WatermarkMode = 'full' | 'behind' | 'hero' | null;

/**
 * Reads ?watermark= from URL.
 * - full:   Giant centered logo filling the viewport
 * - behind: Logo behind tiles (tiles become semi-transparent via CSS class)
 * - hero:   Logo fills the top zone (header → first section)
 * - tile:   Handled inside CategoryCard directly
 */
export function useWatermarkMode(): WatermarkMode {
  const [params] = useSearchParams();
  const raw = params.get('watermark');
  if (raw === 'full' || raw === 'behind' || raw === 'hero' || raw === 'tile') return raw as WatermarkMode;
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
      <div className="absolute top-14 left-0 right-0 h-[28vh] pointer-events-none z-0 flex items-end justify-center overflow-hidden" aria-hidden="true">
        <img
          src={bonkiLogo}
          alt=""
          className="w-[70vw] h-[70vw] max-w-[420px] max-h-[420px] object-contain opacity-[0.05] select-none -mb-[30%]"
          draggable={false}
        />
      </div>
    );
  }

  return null;
}
