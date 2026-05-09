/**
 * RealAppFrame — embeds the production app inside an iframe rendered at
 * iPhone logical width (390 px) and CSS-scaled to fill the DeviceFrame
 * inner screen. Forces production components into mobile breakpoints.
 */
import { useEffect, useRef } from 'react';
import { FRAME_WIDTH_PX, FRAME_HEIGHT_PX, INNER_LOGICAL_W } from '@/lib/exportScreenshot/composition';

interface Props {
  src: string;
  /** Optional CSS-pixel scroll-Y to apply to the iframe document after load. */
  scrollY?: number;
}

export default function RealAppFrame({ src, scrollY = 0 }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  // Inner screen dimensions (frame minus bezel) — must match DeviceFrame's bezel.
  const bezel = 12;
  const innerW = FRAME_WIDTH_PX - bezel * 2;
  const innerH = FRAME_HEIGHT_PX - bezel * 2;
  const scale = innerW / INNER_LOGICAL_W;
  const logicalH = innerH / scale;

  useEffect(() => {
    (window as any).__realAppFrameLoaded = false;
    const iframe = ref.current;
    if (!iframe) return;
    const onLoad = () => {
      (window as any).__realAppFrameLoaded = true;
      // Apply scroll after content settles.
      if (scrollY) {
        try {
          const doc = iframe.contentWindow;
          if (doc) {
            setTimeout(() => doc.scrollTo({ top: scrollY, behavior: 'instant' as any }), 200);
            setTimeout(() => doc.scrollTo({ top: scrollY, behavior: 'instant' as any }), 1200);
          }
        } catch {
          // cross-origin guarded — ignore
        }
      }
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [src, scrollY]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <iframe
        ref={ref}
        src={src}
        title="real-app-screen"
        style={{
          width: `${INNER_LOGICAL_W}px`,
          height: `${logicalH}px`,
          border: 'none',
          display: 'block',
          background: 'transparent',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}
