import type { CSSProperties, ReactNode } from 'react';

export const CANVAS_W = 1290;
export const CANVAS_H = 2796;

export const LANTERN_GLOW = '#F5E8CC';
export const MIDNIGHT_INK = '#1A1A2E';
export const JIM_DEEP = '#8C4A2D';

// Spec-zone layout constants. See .lovable/plan.md.
export const TOP_BREATH_PX = 170;
export const CAPTION_ZONE_TOP_PX = 170;
export const CAPTION_ZONE_HEIGHT_PX = 720;
export const HAIRLINE_TOP_PX = 910;
export const FRAME_TOP_PX = 970;
export const FRAME_WIDTH_PX = 1084;   // 84% of canvas width
export const FRAME_HEIGHT_PX = 1700;  // ~60.8% of canvas height
// Logical iPhone CSS viewport used inside the device frame (mobile breakpoints)
export const INNER_LOGICAL_W = 390;

const FRAUNCES = '"Fraunces", "Cormorant", Georgia, serif';

export function CaptionZone({
  children,
  size = 130,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${CAPTION_ZONE_TOP_PX}px`,
        left: 0,
        right: 0,
        height: `${CAPTION_ZONE_HEIGHT_PX}px`,
        display: 'flex',
        alignItems: 'center',
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

export function HairlineDivider() {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${HAIRLINE_TOP_PX}px`,
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
 * iPhone-styled device frame at fixed spec dimensions
 * (FRAME_WIDTH_PX × FRAME_HEIGHT_PX) centered horizontally on the canvas.
 * Children render inside the inner screen, full-bleed.
 */
export function DeviceFrame({
  background,
  children,
  showChrome = true,
}: {
  background: string;
  children: ReactNode;
  showChrome?: boolean;
}) {
  const bezel = 12;
  const innerW = FRAME_WIDTH_PX - bezel * 2;
  const innerH = FRAME_HEIGHT_PX - bezel * 2;
  const innerRadius = 90;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${FRAME_TOP_PX}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${FRAME_WIDTH_PX}px`,
        height: `${FRAME_HEIGHT_PX}px`,
        borderRadius: `${innerRadius + bezel}px`,
        background: '#000',
        boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.35)',
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
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
        {showChrome && <StatusBar />}
        {showChrome && <HomeIndicator />}
      </div>
    </div>
  );
}

function StatusBar() {
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
        <SvgSignal />
        <SvgWifi />
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

/** Outer canvas wrapper at exact 1290×2796. */
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
