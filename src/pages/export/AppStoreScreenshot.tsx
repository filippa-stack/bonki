/**
 * App Store screenshot export route. Renders one of 7 graphics at exact
 * 1290×2796 px and exposes a "Ladda ner PNG" button that captures it via
 * html-to-image. The canvas is visually scaled down with CSS transform for
 * preview only — capture happens at native pixel size.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  /** When false, hides DeviceFrame's status bar + home indicator (e.g. Graphic 2 image already includes them). */
  showChrome?: boolean;
  /** Optional iframe content scroll-Y in CSS pixels (used to bring clipped content into view). */
  iframeScrollY?: number;
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
    iframeScrollY: 0,
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
    showChrome: false,
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
    captionSize: 120,
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

  // Inject a Fraunces stylesheet with font-display:block so the headline never
  // paints in a serif fallback during capture (font-race fix). Scoped to this
  // route only — does NOT leak into production via the global index.html link.
  useLayoutEffect(() => {
    const existing = document.querySelector('link[data-export-fraunces="1"]');
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&display=block';
    link.setAttribute('data-export-fraunces', '1');
    document.head.appendChild(link);
    return () => {
      // Keep it for the lifetime of the export tab; safe to re-inject if removed.
    };
  }, []);

  // ?raw=1 mode for puppeteer: skip preview chrome and render the canvas at
  // native 1290×2796 from origin so page.screenshot can clip cleanly.
  const isRaw =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('raw') === '1';

  useEffect(() => {
    if (isRaw) return;
    const compute = () => {
      const w = window.innerWidth;
      setScale(Math.min(0.4, (w * 0.8) / CANVAS_W));
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
      await exportNodeToPng(captureRef.current, `app-store-${spec.n}-${spec.name}.png`, CANVAS_W, CANVAS_H);
    } finally {
      setBusy(false);
    }
  };

  // Render the bare canvas at 1:1 with no surrounding chrome — for puppeteer.
  if (isRaw) {
    return (
      <div style={{ margin: 0, padding: 0, background: '#000', width: CANVAS_W, height: CANVAS_H }}>
        <AppStoreCanvas innerRef={(el) => (captureRef.current = el)} background={spec.canvasBg}>
          {spec.bare ? (
            <div style={{ position: 'absolute', inset: 0 }}>
              <Screen />
            </div>
          ) : (
            <>
              <CaptionZone size={spec.captionSize}>{spec.caption}</CaptionZone>
              <HairlineDivider />
              <DeviceFrame background={spec.screenBg} showChrome={spec.showChrome ?? true}>
                <Screen />
              </DeviceFrame>
            </>
          )}
        </AppStoreCanvas>
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
                <CaptionZone size={spec.captionSize}>{spec.caption}</CaptionZone>
                <HairlineDivider />
                <DeviceFrame background={spec.screenBg} showChrome={spec.showChrome ?? true}>
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
