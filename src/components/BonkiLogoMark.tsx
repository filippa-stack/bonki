/**
 * BonkiLogoMark — hand-drawn Bonki logo (two figures curled inside an oval).
 *
 * Renders the rasterized PNG asset from src/assets/bonki-logo.png.
 * The ghost-glow line color (#D4F5C0) and transparent background are
 * baked into the asset, so the logo composites cleanly on any dark
 * surface without mix-blend tricks.
 *
 * Props:
 *   - size: rendered px (square). Default 32.
 *   - color: NO-OP. The line color is baked into the PNG. Kept in the
 *     API so existing call sites compile, but does nothing. If a
 *     non-ghost-glow logo is ever needed, export a separate asset
 *     rather than try to recolor at runtime.
 *   - className / style / aria-hidden: standard passthrough.
 *
 * Tiny-size fallback:
 *   At sizes ≤ 12px (e.g. the 9px "Du har provat" pill in the library
 *   mock) the rasterized linework doesn't read clearly. We render a
 *   solid ghost-glow dot instead — the surrounding text carries the
 *   meaning, the icon is purely decorative at that scale.
 */

import React from 'react';
import logoSrc from '@/assets/bonki-logo.png';

interface BonkiLogoMarkProps {
  size?: number;
  /** NO-OP — the PNG has #D4F5C0 baked in. Kept for API compatibility. */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

const GHOST_GLOW = '#D4F5C0';

export default function BonkiLogoMark({
  size = 32,
  color: _color,
  className,
  style,
  'aria-hidden': ariaHidden = true,
}: BonkiLogoMarkProps) {
  // Tiny-size fallback: a clean dot reads better than a blurred PNG.
  if (size <= 12) {
    const dot = Math.max(6, Math.round(size * 0.7));
    return (
      <span
        className={className}
        aria-hidden={ariaHidden}
        style={{
          display: 'inline-block',
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: GHOST_GLOW,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={logoSrc}
      width={size}
      height={size}
      alt=""
      aria-hidden={ariaHidden}
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
