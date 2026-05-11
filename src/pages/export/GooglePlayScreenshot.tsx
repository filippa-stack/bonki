/**
 * Google Play screenshot export route. Mirrors AppStoreScreenshot but at
 * 1080×1920 with an Android (Pixel 8 style) device frame. Same Screen*
 * components, same captions, same demo data — captions scaled −15% for the
 * smaller canvas.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GooglePlayCanvas,
  CaptionZone,
  HairlineDivider,
  AndroidDeviceFrame,
  CANVAS_W,
  CANVAS_H,
  MIDNIGHT_INK,
  JIM_DEEP,
} from '@/lib/exportScreenshot/compositionAndroid';
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
  bare?: boolean;
  showChrome?: boolean;
  iframeScrollY?: number;
}

// Caption sizes are −15% from the App Store variant (140→120, 130→112, 120→104).
const GRAPHICS: GraphicSpec[] = [
  {
    n: 1,
    name: 'recognition',
    caption: 'Samtalen som bär.',
    captionSize: 120,
    canvasBg: MIDNIGHT_INK,
    screenBg: MIDNIGHT_INK,
    Screen: Screen1Marquee,
  },
  {
    n: 2,
    name: 'journal',
    caption: 'En tidskapsel av era ord.',
    captionSize: 112,
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
    captionSize: 112,
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
    captionSize: 112,
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
    captionSize: 112,
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
    captionSize: 104,
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
    captionSize: 104,
    canvasBg: MIDNIGHT_INK,
    screenBg: MIDNIGHT_INK,
    Screen: Screen7Authority,
    bare: true,
  },
];

export default function GooglePlayScreenshot() {
  const { n } = useParams<{ n: string }>();
  const idx = Math.max(1, Math.min(7, parseInt(n ?? '1', 10))) - 1;
  const spec = GRAPHICS[idx];
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState(0.4);

  useLayoutEffect(() => {
    const existing = document.querySelector('link[data-export-fraunces="1"]');
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&display=block';
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
      setScale(Math.min(0.5, (w * 0.8) / CANVAS_W));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [isRaw]);

  const Screen = spec.Screen as React.ComponentType<{ scrollY?: number }>;
  const screenProps = spec.iframeScrollY != null ? { scrollY: spec.iframeScrollY } : {};

  const handleDownload = async () => {
    if (!captureRef.current || busy) return;
    setBusy(true);
    try {
      await exportNodeToPng(captureRef.current, `google-play-${spec.n}-${spec.name}.png`, CANVAS_W, CANVAS_H);
    } finally {
      setBusy(false);
    }
  };

  if (isRaw) {
    return (
      <div style={{ margin: 0, padding: 0, background: '#000', width: CANVAS_W, height: CANVAS_H }}>
        <GooglePlayCanvas innerRef={(el) => (captureRef.current = el)} background={spec.canvasBg}>
          {spec.bare ? (
            <div style={{ position: 'absolute', inset: 0 }}>
              <Screen {...screenProps} />
            </div>
          ) : (
            <>
              <CaptionZone size={spec.captionSize}>{spec.caption}</CaptionZone>
              <HairlineDivider />
              <AndroidDeviceFrame background={spec.screenBg} showChrome={spec.showChrome ?? true}>
                <Screen {...screenProps} />
              </AndroidDeviceFrame>
            </>
          )}
        </GooglePlayCanvas>
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
          Google Play screenshot {spec.n}/7 — {spec.name}
        </h1>
        <button
          onClick={handleDownload}
          disabled={busy}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: busy ? '#555' : '#3DDC84',
            color: '#000',
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
              to={`/export/google-play/${g.n}`}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: g.n === spec.n ? '#3DDC84' : '#222',
                color: g.n === spec.n ? '#000' : '#fff',
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
          <GooglePlayCanvas innerRef={(el) => (captureRef.current = el)} background={spec.canvasBg}>
            {spec.bare ? (
              <div style={{ position: 'absolute', inset: 0 }}>
                <Screen {...screenProps} />
              </div>
            ) : (
              <>
                <CaptionZone size={spec.captionSize}>{spec.caption}</CaptionZone>
                <HairlineDivider />
                <AndroidDeviceFrame background={spec.screenBg} showChrome={spec.showChrome ?? true}>
                  <Screen {...screenProps} />
                </AndroidDeviceFrame>
              </>
            )}
          </GooglePlayCanvas>
        </div>
      </div>
    </div>
  );
}
