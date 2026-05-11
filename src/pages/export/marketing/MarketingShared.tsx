/**
 * Shared primitives for marketing screens.
 * Renders inline 390-wide JSX scaled to fill the export bezel inner area.
 * No hooks into app context, no auth, no DB — pure presentation.
 */
import type { CSSProperties, ReactNode } from 'react';
import { FRAME_WIDTH_PX, FRAME_HEIGHT_PX, INNER_LOGICAL_W } from '@/lib/exportScreenshot/composition';

const BEZEL = 12;
export const INNER_W = FRAME_WIDTH_PX - BEZEL * 2; // 1055
export const INNER_H = FRAME_HEIGHT_PX - BEZEL * 2; // 1665
export const SCALE = INNER_W / INNER_LOGICAL_W; // ≈ 2.705
export const LOGICAL_H = INNER_H / SCALE; // ≈ 615

/** Centers a 390-wide screen and CSS-scales it to fill the bezel inner area. */
export function ScaledScreen({ children, background }: { children: ReactNode; background: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background, overflow: 'hidden' }}>
      <div
        style={{
          width: `${INNER_LOGICAL_W}px`,
          height: `${LOGICAL_H}px`,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          background,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
export const FONT_DISPLAY = "'Fraunces', 'Cormorant Garamond', Georgia, serif";
export const FONT_SANS = "'DM Sans', -apple-system, system-ui, sans-serif";
export const FONT_LABEL = "'Bebas Neue', sans-serif";

export const sx = (s: CSSProperties) => s;
