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

  // Default: show hero watermark (also when explicitly set)
  // Render for 'hero' mode or when no watermark param is set (default)
  if (mode === 'hero' || mode === null) {
    return (
      <div className="absolute top-[260px] left-0 right-0 h-[120px] pointer-events-none z-0 flex items-center justify-center" aria-hidden="true">
        <img
          src={bonkiLogo}
          alt=""
          className="h-[100px] w-[100px] object-contain opacity-[0.045] select-none"
          draggable={false}
        />
      </div>
    );
  }

  return null;
}
