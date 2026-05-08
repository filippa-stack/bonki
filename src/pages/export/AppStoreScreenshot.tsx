/**
 * App Store screenshot export route. Renders one of 7 graphics at exact
 * 1290×2796 px and exposes a "Ladda ner PNG" button that captures it via
 * html-to-image. The canvas is visually scaled down with CSS transform for
 * preview only — capture happens at native pixel size.
 */
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AppStoreCanvas,
  CaptionZone,
  HairlineDivider,
  DeviceFrame,
  CANVAS_W,
  CANVAS_H,
  MIDNIGHT_INK,
  JIM_DEEP,
} from '@/lib/exportScreenshot/composition';
import { exportNodeToPng } from '@/lib/exportScreenshot/exportPng';
import Screen1Marquee from './screenshots/Screen1Marquee';
import Screen2Journal from './screenshots/Screen2Journal';
import Screen3JimHome from './screenshots/Screen3JimHome';
import Screen4JimSession from './screenshots/Screen4JimSession';
import Screen5VvSession from './screenshots/Screen5VvSession';
import Screen6JimCompletion from './screenshots/Screen6JimCompletion';
import Screen7Authority from './screenshots/Screen7Authority';

interface GraphicSpec {
  n: number;
  name: string;
  caption: React.ReactNode;
  captionSize: number;
  canvasBg: string;
  screenBg: string;
  Screen: React.ComponentType;
  /** When true, renders the screen full-canvas without a device frame (Screen 7). */
  bare?: boolean;
}

const GRAPHICS: GraphicSpec[] = [
  {
    n: 1,
    name: 'recognition',
    caption: 'Samtalen som bär.',
    captionSize: 140,
    canvasBg: MIDNIGHT_INK,
    screenBg: MIDNIGHT_INK,
    Screen: Screen1Marquee,
  },
  {
    n: 2,
    name: 'journal',
    caption: 'En tidskapsel av era ord.',
    captionSize: 130,
    canvasBg: MIDNIGHT_INK,
    screenBg: MIDNIGHT_INK,
    Screen: Screen2Journal,
  },
  {
    n: 3,
    name: 'audience',
    caption: (
      <>
        Att förstå sitt barn —
        <br />på riktigt.
      </>
    ),
    captionSize: 130,
    canvasBg: JIM_DEEP,
    screenBg: JIM_DEEP,
    Screen: Screen3JimHome,
  },
  {
    n: 4,
    name: 'mechanism',
    caption: (
      <>
        Frågor som faktiskt
        <br />öppnar samtalet.
      </>
    ),
    captionSize: 130,
    canvasBg: JIM_DEEP,
    screenBg: JIM_DEEP,
    Screen: Screen4JimSession,
  },
  {
    n: 5,
    name: 'adult-session',
    caption: (
      <>
        Tiden ni inte hittar —
        <br />finns här.
      </>
    ),
    captionSize: 130,
    canvasBg: MIDNIGHT_INK,
    screenBg: MIDNIGHT_INK,
    Screen: Screen5VvSession,
  },
  {
    n: 6,
    name: 'outcome',
    caption: (
      <>
        Det ni säger till varandra —
        <br />finns kvar.
      </>
    ),
    captionSize: 128,
    canvasBg: JIM_DEEP,
    screenBg: JIM_DEEP,
    Screen: Screen6JimCompletion,
  },
  {
    n: 7,
    name: 'authority',
    caption: (
      <>
        Utvecklat under 29 år
        <br />av klinisk praktik.
      </>
    ),
    captionSize: 120,
    canvasBg: MIDNIGHT_INK,
    screenBg: MIDNIGHT_INK,
    Screen: Screen7Authority,
    bare: true,
  },
];

export default function AppStoreScreenshot() {
  const { n } = useParams<{ n: string }>();
  const idx = Math.max(1, Math.min(7, parseInt(n ?? '1', 10))) - 1;
  const spec = GRAPHICS[idx];
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      // Fit canvas width within 80% of viewport.
      setScale(Math.min(0.4, (w * 0.8) / CANVAS_W));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const Screen = spec.Screen;
  const captionTopPercent = 0.075;
  const hairlineTopPx = Math.round(captionTopPercent * CANVAS_H + spec.captionSize * 1.1 * 2 + 40);
  // Device frame placement
  const frameWidth = 1080;
  const frameTopPx = hairlineTopPx + 80;

  const handleDownload = async () => {
    if (!captureRef.current || busy) return;
    setBusy(true);
    try {
      await exportNodeToPng(captureRef.current, `app-store-${spec.n}-${spec.name}.png`, CANVAS_W, CANVAS_H);
    } finally {
      setBusy(false);
    }
  };

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
          App Store screenshot {spec.n}/7 — {spec.name}
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
          {GRAPHICS.map((g) => (
            <Link
              key={g.n}
              to={`/export/app-store/${g.n}`}
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
          width: CANVAS_W * scale,
          height: CANVAS_H * scale,
          overflow: 'hidden',
          margin: '0 auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: CANVAS_W,
            height: CANVAS_H,
          }}
        >
          <AppStoreCanvas innerRef={(el) => (captureRef.current = el)} background={spec.canvasBg}>
            {spec.bare ? (
              <div style={{ position: 'absolute', inset: 0 }}>
                <Screen />
              </div>
            ) : (
              <>
                <CaptionZone size={spec.captionSize} topPercent={captionTopPercent}>
                  {spec.caption}
                </CaptionZone>
                <HairlineDivider topPx={hairlineTopPx} />
                <DeviceFrame topPx={frameTopPx} width={frameWidth} background={spec.screenBg}>
                  <Screen />
                </DeviceFrame>
              </>
            )}
          </AppStoreCanvas>
        </div>
      </div>
    </div>
  );
}
