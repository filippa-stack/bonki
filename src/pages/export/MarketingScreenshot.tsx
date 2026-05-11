/**
 * Marketing screenshot export route. Six clean, marketing-ready PNGs of
 * existing app surfaces, exported with iPhone bezel only — no surrounding
 * 1284×2778 App Store canvas. Drops straight into email/social.
 *
 * Capture node = the bezel rectangle (FRAME_WIDTH_PX × FRAME_HEIGHT_PX).
 * Background outside the bezel is transparent.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DeviceFrame,
  FRAME_WIDTH_PX,
  FRAME_HEIGHT_PX,
} from '@/lib/exportScreenshot/composition';
import { exportNodeToPng } from '@/lib/exportScreenshot/exportPng';
import MarketingVvQuestion from './marketing/MarketingVvQuestion';
import MarketingVardagQuestion from './marketing/MarketingVardagQuestion';
import MarketingVvCompletion from './marketing/MarketingVvCompletion';
import MarketingOnboarding from './marketing/MarketingOnboarding';
import MarketingJivPortal from './marketing/MarketingJivPortal';
import MarketingJournalSingle from './marketing/MarketingJournalSingle';
import { MIDNIGHT_INK, productTileColors } from '@/lib/palette';

interface Spec {
  n: number;
  name: string;
  background: string;
  Screen: React.ComponentType;
  showChrome?: boolean;
}

const SPECS: Spec[] = [
  { n: 1, name: 'vart-vi-question',     background: MIDNIGHT_INK,                        Screen: MarketingVvQuestion },
  { n: 2, name: 'vardag-question',      background: productTileColors.vardagskort.tileDeep, Screen: MarketingVardagQuestion },
  { n: 3, name: 'vart-vi-completion',   background: MIDNIGHT_INK,                        Screen: MarketingVvCompletion },
  { n: 4, name: 'onboarding-quote',     background: MIDNIGHT_INK,                        Screen: MarketingOnboarding },
  { n: 5, name: 'jag-i-varlden-portal', background: '#3F4A0E',                           Screen: MarketingJivPortal },
  { n: 6, name: 'journal-single',       background: MIDNIGHT_INK,                        Screen: MarketingJournalSingle },
];

export default function MarketingScreenshot() {
  const { n } = useParams<{ n: string }>();
  const idx = Math.max(1, Math.min(SPECS.length, parseInt(n ?? '1', 10))) - 1;
  const spec = SPECS[idx];
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState(0.4);

  // Force-load Fraunces with display:block to avoid serif fallback during capture.
  useLayoutEffect(() => {
    if (document.querySelector('link[data-export-fraunces="1"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=block';
    link.setAttribute('data-export-fraunces', '1');
    document.head.appendChild(link);
  }, []);

  const isRaw =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('raw') === '1';

  useEffect(() => {
    if (isRaw) return;
    const compute = () => {
      const w = window.innerWidth;
      setScale(Math.min(0.55, (w * 0.7) / FRAME_WIDTH_PX));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [isRaw]);

  const Screen = spec.Screen;

  const handleDownload = async () => {
    if (!captureRef.current || busy) return;
    setBusy(true);
    try {
      await exportNodeToPng(
        captureRef.current,
        `marketing-${String(spec.n).padStart(2, '0')}-${spec.name}.png`,
        FRAME_WIDTH_PX,
        FRAME_HEIGHT_PX,
      );
    } finally {
      setBusy(false);
    }
  };

  // The capture node is a wrapper sized exactly to the bezel. DeviceFrame is
  // absolutely positioned via top/left:50% inside it, so the captured PNG
  // matches FRAME_WIDTH_PX × FRAME_HEIGHT_PX with the bezel filling it.
  const CaptureNode = (
    <div
      ref={(el) => (captureRef.current = el)}
      style={{
        position: 'relative',
        width: `${FRAME_WIDTH_PX}px`,
        height: `${FRAME_HEIGHT_PX}px`,
        background: 'transparent',
      }}
    >
      {/* Override DeviceFrame's absolute top so it sits at top:0 of capture node. */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <DeviceFrame background={spec.background} showChrome={true} top={0}>
          <Screen />
        </DeviceFrame>
      </div>
    </div>
  );

  if (isRaw) {
    return (
      <div style={{ margin: 0, padding: 0, background: 'transparent', width: FRAME_WIDTH_PX, height: FRAME_HEIGHT_PX }}>
        {CaptureNode}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0c0c12',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          Marketing screen {spec.n}/{SPECS.length} — {spec.name}
        </h1>
        <button
          onClick={handleDownload}
          disabled={busy}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: busy ? '#555' : '#E85D2C',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Förbereder…' : 'Ladda ner PNG'}
        </button>
        <nav style={{ display: 'flex', gap: 6, fontSize: 12 }}>
          {SPECS.map((g) => (
            <Link
              key={g.n}
              to={`/export/marketing/${g.n}`}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: g.n === spec.n ? '#E85D2C' : '#222',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {g.n}
            </Link>
          ))}
        </nav>
      </div>

      <div
        style={{
          width: FRAME_WIDTH_PX * scale,
          height: FRAME_HEIGHT_PX * scale,
          margin: '0 auto',
          backgroundImage:
            'linear-gradient(45deg, #1a1a24 25%, transparent 25%), linear-gradient(-45deg, #1a1a24 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a24 75%), linear-gradient(-45deg, transparent 75%, #1a1a24 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: FRAME_WIDTH_PX,
            height: FRAME_HEIGHT_PX,
          }}
        >
          {CaptureNode}
        </div>
      </div>
    </div>
  );
}
