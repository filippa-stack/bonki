/**
 * RealAppFrame — embeds the real production app inside an iframe sized
 * to fill the DeviceFrame inner content area. Used by Screen1–6 so each
 * App Store graphic shows the actual production component (with real
 * `useCardImage` illustrations, layouts, shadows, etc.) instead of a
 * hand-built replica.
 *
 * Demo mode (`?demo=1`) bypasses auth; `?devState=...` provides deterministic
 * frozen state. Both work in the preview environment, which is where puppeteer
 * captures these screenshots.
 */
import { useEffect, useRef } from 'react';

interface Props {
  /** Path + query string, e.g. "/journal?demo=1&devState=archiveWithHistory" */
  src: string;
  /** Optional extra delay (ms) before iframe is considered ready, for animations to settle. */
  settleMs?: number;
}

export default function RealAppFrame({ src }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Mark window so puppeteer knows when to wait for iframe load.
    (window as any).__realAppFrameLoaded = false;
    const iframe = ref.current;
    if (!iframe) return;
    const onLoad = () => {
      (window as any).__realAppFrameLoaded = true;
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title="real-app-screen"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
        background: 'transparent',
      }}
    />
  );
}
