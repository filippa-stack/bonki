/**
 * KidsTileFrame — shared 3-zone composition primitive for kids tiles.
 *
 * Used by:
 *   - ProductCardTile (kids product home grid)
 *   - ProductLibrary kids library tiles (Batch C)
 *   - KidsCardPortal big card preview (Batch D)
 *
 * Composition:
 *   [outer frame: product anchor color (3:4, 22px radius)]
 *     └── [inner zone: tonal interior variant, inset 16px on all sides]
 *           └── illustration (children)
 *           └── completed checkmark (top-right of inner zone)
 *     └── [title strip: ~24% of card height, frame color background]
 *           └── 1px hairline separator at top in product dark text @ 18%
 *           └── serif title in product dark text
 *           └── optional footer row (subtitle + small-caps meta)
 *
 * Both `frame` and `interior` are required. When they match exactly
 * (e.g. Syskon middle variant) the card reads as a uniform color — intentional.
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { SAFFRON_FLAME } from '@/lib/palette';

interface KidsTileFrameProps {
  /** Product anchor color — outer frame + title strip background. */
  frame: string;
  /** Tonal variant of frame — inner zone background. */
  interior: string;
  /** Title text. */
  title: string;
  /** Optional italic-serif subtitle inside title strip. */
  subtitle?: string;
  /** Optional small-caps meta row (e.g. "8 AV 21 · FRÅN 3 ÅR"). */
  meta?: string;
  /** Optional trailing element rendered on the right of the meta row. */
  metaTrailing?: ReactNode;
  /** Dark text color (in product hue family). */
  darkText: string;
  /** Show saffron checkmark in top-right of inner zone. */
  completed?: boolean;
  /** Click handler — wraps the whole tile in a button. */
  onClick?: () => void;
  /** Inner zone children (illustration). */
  children?: ReactNode;
  /** Aria label for the tile. */
  ariaLabel?: string;
  /** Outer style overrides (sizing). */
  style?: CSSProperties;
  /** Title font size (default 18). */
  titleSize?: number;
  /** Border radius (default 22). */
  radius?: number;
  /** Title strip height as fraction of card (default 0.24). */
  stripFraction?: number;
}

export default function KidsTileFrame({
  frame,
  interior,
  title,
  subtitle,
  meta,
  metaTrailing,
  darkText,
  completed = false,
  onClick,
  children,
  ariaLabel,
  style,
  titleSize = 18,
  radius = 22,
  stripFraction = 0.24,
}: KidsTileFrameProps) {
  // Skip checkmark fade on initial mount when card is already completed
  const isFirstRenderRef = useRef(true);
  useEffect(() => { isFirstRenderRef.current = false; }, []);
  const skipPillAnimation = isFirstRenderRef.current && completed;

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel ?? title}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: radius,
        textAlign: 'left',
        backgroundColor: frame,
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        display: 'block',
        ...style,
      }}
    >
      {/* ── Inner zone (interior color, inset 16px on top/sides; bottom flush with strip) ── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          bottom: `calc(${stripFraction * 100}% + 8px)`,
          borderRadius: Math.max(8, radius - 8),
          backgroundColor: interior,
          border: `1px solid ${darkText}30`,
          overflow: 'hidden',
        }}
      >
        {children && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {children}
          </div>
        )}

        {/* Saffron checkmark — top-right of inner zone */}
        {completed && (
          <motion.div
            role="status"
            aria-label="Klart"
            initial={skipPillAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}
            >
              <path
                d="M3.5 9.5 L7.5 13.5 L14.5 5.5"
                stroke={SAFFRON_FLAME}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* ── Title strip ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: `${stripFraction * 100}%`,
          backgroundColor: frame,
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Hairline separator at top of strip */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 16,
            right: 16,
            height: 1,
            backgroundColor: darkText,
            opacity: 0.18,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 24",
            fontSize: titleSize,
            fontWeight: 600,
            color: darkText,
            lineHeight: 1.05,
            display: 'block',
            textAlign: 'center',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 11,
              fontWeight: 400,
              color: darkText,
              opacity: 0.75,
              lineHeight: 1.2,
              marginTop: 3,
              display: 'block',
              textAlign: 'center',
            }}
          >
            {subtitle}
          </span>
        )}
        {meta && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: darkText,
                opacity: 0.65,
                lineHeight: 1.2,
              }}
            >
              {meta}
            </span>
            {metaTrailing && (
              <span style={{ display: 'inline-flex', color: darkText, opacity: 0.55, flexShrink: 0 }}>
                {metaTrailing}
              </span>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
