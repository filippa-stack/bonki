/**
 * BonkiLogoMark — hand-drawn SVG brand mark used across onboarding + UI.
 *
 * Sized via the `size` prop (px). Uses currentColor so it inherits color from
 * its parent. Designed to render crisply at sizes from 9px to 120px.
 */

import React from 'react';

interface BonkiLogoMarkProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

export default function BonkiLogoMark({
  size = 32,
  color,
  className,
  style,
  'aria-hidden': ariaHidden = true,
}: BonkiLogoMarkProps) {
  // A simple, warm, hand-drawn "spark" — two arcs forming an open conversation
  // bubble with a soft inner dot. Kept geometrically simple so it remains
  // legible at very small sizes (9-12 px favicons / inline marks).
  const stroke = Math.max(1.25, size * 0.07);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color: color ?? 'currentColor', display: 'block', ...style }}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
    >
      {/* Outer warm arc */}
      <path
        d="M10 28 C 10 16, 20 8, 30 10 C 40 12, 42 22, 38 30 C 35 36, 28 38, 22 36 L 14 40 L 16 32 C 12 30, 10 30, 10 28 Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner spark */}
      <circle cx="26" cy="24" r={Math.max(1.5, size * 0.06)} fill="currentColor" />
    </svg>
  );
}
