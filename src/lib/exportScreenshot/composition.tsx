import type { CSSProperties, ReactNode } from 'react';

export const CANVAS_W = 1290;
export const CANVAS_H = 2796;

export const LANTERN_GLOW = '#F5E8CC';
export const MIDNIGHT_INK = '#1A1A2E';
export const JIM_DEEP = '#8C4A2D';

const FRAUNCES = '"Fraunces", "Cormorant", Georgia, serif';

export function CaptionZone({
  children,
  size = 130,
  topPercent = 0.083,
}: {
  children: ReactNode;
  /** Caption font size in px (calibrate per caption length). */
  size?: number;
  /** Vertical offset of caption block from canvas top, fraction of canvas height. */
  topPercent?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${topPercent * CANVAS_H}px`,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: `${CANVAS_W * 0.86}px`,
          color: LANTERN_GLOW,
          fontFamily: FRAUNCES,
          fontWeight: 500,
          fontSize: `${size}px`,
          lineHeight: 1.1,
          letterSpacing: '-0.005em',
          textAlign: 'center',
          fontVariationSettings: '"opsz" 144',
          textWrap: 'balance' as any,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function HairlineDivider({ topPx }: { topPx: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${topPx}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${CANVAS_W * 0.5}px`,
        height: '1px',
        background: 'rgba(245, 232, 204, 0.25)',
      }}
    />
  );
}

/**
 * iPhone 15 Pro Max-ish device frame around the app screen content.
 * Inner content area is `screenW × screenH`. Children render inside that area
 * (full-bleed, edge to edge). Status bar + home indicator are drawn on top.
 */
export function DeviceFrame({
  topPx,
  width,
  background,
  children,
  contentScale = 1,
  showChrome = true,
}: {
  topPx: number;
  width: number;
  background: string;
  children: ReactNode;
  /** When the inner content was authored at e.g. 390 px wide, this scales it up to fit. */
  contentScale?: number;
  showChrome?: boolean;
}) {
  const aspect = 19.5 / 9;
  const height = Math.round(width * aspect);
  const bezel = 10;
  const innerW = width - bezel * 2;
  const innerH = height - bezel * 2;
  const innerRadius = 80;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${topPx}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${innerRadius + bezel}px`,
        background: '#000',
        boxShadow: '0 18px 60px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.35)',
        padding: `${bezel}px`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${innerW}px`,
          height: `${innerH}px`,
          borderRadius: `${innerRadius}px`,
          overflow: 'hidden',
          background,
        }}
      >
        {/* App content layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: contentScale === 1 ? undefined : `scale(${contentScale})`,
            transformOrigin: 'top left',
            width: contentScale === 1 ? '100%' : `${innerW / contentScale}px`,
            height: contentScale === 1 ? '100%' : `${innerH / contentScale}px`,
          }}
        >
          {children}
        </div>

        {showChrome && <StatusBar />}
        {showChrome && <HomeIndicator />}
      </div>
    </div>
  );
}

function StatusBar() {
  // Pixel-positioned to land inside the device inner radius.
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 60px',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
        fontSize: '32px',
        fontWeight: 600,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <span>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Signal */}
        <SvgSignal />
        {/* Wifi */}
        <SvgWifi />
        {/* Battery */}
        <SvgBattery />
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '270px',
        height: '8px',
        borderRadius: '4px',
        background: 'rgba(255,255,255,0.85)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
}

function SvgSignal() {
  return (
    <svg width="34" height="22" viewBox="0 0 34 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 8} y={22 - (i + 1) * 5} width="6" height={(i + 1) * 5} rx="1" fill="#fff" />
      ))}
    </svg>
  );
}

function SvgWifi() {
  return (
    <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 18a2 2 0 100 4 2 2 0 000-4z" fill="#fff" />
      <path d="M9 13c2-2 4.5-3 7-3s5 1 7 3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M3 8c4-4 8.5-6 13-6s9 2 13 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SvgBattery() {
  return (
    <svg width="50" height="22" viewBox="0 0 50 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="42" height="18" rx="4" stroke="#fff" strokeWidth="1.5" />
      <rect x="44" y="8" width="3" height="6" rx="1" fill="#fff" />
      <rect x="3.5" y="4.5" width="37" height="13" rx="2.5" fill="#fff" />
    </svg>
  );
}

/**
 * Outer canvas wrapper. Holds the page background and provides absolute
 * positioning context for caption + hairline + device frame.
 */
export function AppStoreCanvas({
  background,
  children,
  innerRef,
}: {
  background: string;
  children: ReactNode;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={innerRef}
      style={{
        position: 'relative',
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
        background,
        overflow: 'hidden',
        fontFamily: FRAUNCES,
      }}
    >
      {children}
    </div>
  );
}

export const sx = (s: CSSProperties) => s;
