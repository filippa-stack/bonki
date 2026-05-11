import type { CSSProperties, ReactNode } from 'react';

// Google Play phone slot: 1080 × 1920.
export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

export const LANTERN_GLOW = '#F5E8CC';
export const MIDNIGHT_INK = '#1A1A2E';
export const JIM_DEEP = '#8C4A2D';

// Spec-zone layout constants — proportionally scaled from the App Store
// (1284×2778) layout by ~0.691 to fit the Google Play canvas while keeping
// the same visual rhythm (top breath / caption / hairline / device frame).
export const TOP_BREATH_PX = 117;
export const CAPTION_ZONE_TOP_PX = 117;
export const CAPTION_ZONE_HEIGHT_PX = 494;
export const HAIRLINE_TOP_PX = 625;
export const FRAME_TOP_PX = 666;
export const FRAME_WIDTH_PX = 907;
export const FRAME_HEIGHT_PX = 1218;
// Same logical viewport as App Store — Screen* components are designed
// against this 390px-wide breakpoint and must not change.
export const INNER_LOGICAL_W = 390;

const FRAUNCES = '"Fraunces", "Cormorant", Georgia, serif';

export function CaptionZone({
  children,
  size = 112,
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
        data-export-caption="1"
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
 * Pixel 8-styled Android device frame at fixed spec dimensions
 * (FRAME_WIDTH_PX × FRAME_HEIGHT_PX) centered horizontally on the canvas.
 * Aspect ratio ~1:1.34 is intentional to preserve INNER_LOGICAL_W = 390.
 */
export function AndroidDeviceFrame({
  background,
  children,
  showChrome = true,
}: {
  background: string;
  children: ReactNode;
  showChrome?: boolean;
}) {
  const bezel = 10;
  const innerW = FRAME_WIDTH_PX - bezel * 2;
  const innerH = FRAME_HEIGHT_PX - bezel * 2;
  const innerRadius = 60;

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
        {/* Punch-hole camera is hardware — render even when chrome is hidden */}
        <PunchHole />
        {showChrome && <AndroidStatusBar />}
        {showChrome && <AndroidNavBar />}
      </div>
    </div>
  );
}

function PunchHole() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#000',
        border: '1px solid rgba(245, 232, 204, 0.30)',
        boxSizing: 'border-box',
        zIndex: 11,
        pointerEvents: 'none',
      }}
    />
  );
}

function AndroidStatusBar() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        color: '#fff',
        fontFamily: '"Roboto", "Inter", -apple-system, sans-serif',
        fontSize: '30px',
        fontWeight: 500,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <span>12:00</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <SvgSignalAndroid />
        <SvgWifiAndroid />
        <SvgBatteryAndroid />
      </div>
    </div>
  );
}

function AndroidNavBar() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        height: '6px',
        borderRadius: '3px',
        background: 'rgba(255,255,255,0.85)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
}

function SvgSignalAndroid() {
  // Material-style 4 ascending bars
  return (
    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 7} y={22 - (i + 1) * 5} width="5" height={(i + 1) * 5} rx="0.5" fill="#fff" />
      ))}
    </svg>
  );
}

function SvgWifiAndroid() {
  // Material-style triangle wedge
  return (
    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3 L25 17 L13 19 Z" fill="#fff" />
      <path d="M13 3 L1 17 L13 19 Z" fill="#fff" opacity="0.45" />
    </svg>
  );
}

function SvgBatteryAndroid() {
  // Rounded rectangle, no tip (Material You style)
  return (
    <svg width="40" height="22" viewBox="0 0 40 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="3" width="38" height="16" rx="4" stroke="#fff" strokeWidth="1.5" />
      <rect x="3.5" y="5.5" width="33" height="11" rx="2.5" fill="#fff" />
    </svg>
  );
}

/** Outer canvas wrapper at exact 1080×1920. */
export function GooglePlayCanvas({
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
