/**
 * BonkiLogoMark — structural placeholder for the hand-drawn Bonki logo.
 *
 * Two figures (parent + child) curled inside an enclosing oval form, with
 * four small eye dots. Verbatim SVG from the v4 mockup HTML — to be swapped
 * for the final hand-drawn artwork later.
 *
 * Sized via the `size` prop (px). Uses currentColor so it inherits color
 * from its parent. Designed to render at sizes from 9px (favicons / inline)
 * up to 120px (welcome gift hero).
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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color: color ?? 'currentColor', display: 'block', ...style }}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
    >
      {/* Outer oval frame */}
      <path
        d="M 50 6 C 75 6, 92 24, 92 50 C 92 78, 76 94, 50 94 C 24 94, 8 76, 8 50 C 8 22, 26 6, 50 6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Parent figure */}
      <path
        d="M 42 22 C 52 20, 62 26, 64 36 C 66 46, 60 52, 52 50 C 44 48, 40 42, 42 22 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Child figure */}
      <path
        d="M 44 56 C 52 54, 60 60, 60 68 C 60 76, 54 80, 48 78 C 42 76, 40 70, 44 56 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Parent eyes */}
      <line x1="48" y1="32" x2="50" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="32" x2="58" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Child eyes */}
      <line x1="49" y1="64" x2="51" y2="64" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="55" y1="64" x2="57" y2="64" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
