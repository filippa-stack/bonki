/**
 * AdultProductCardTile — adult-product (Vårt Vi) card composition.
 *
 * Two-zone portrait: framed illustration on top (65%), dedicated
 * typographic title zone on bottom (35%), separated by a 1px warm-gold
 * accent line. Aspect ratio 3:4. Used only for adult products.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Card } from '@/types';
import { useCardImage } from '@/hooks/useCardImage';
import {
  SAFFRON_FLAME,
  WARM_GOLD,
  LANTERN_GLOW,
  CORNFLOWER,
  MIDNIGHT_INK,
  DUSTY_ROSE,
  WARM_GOLD as WARM_GOLD_ANCHOR,
  STORM_GREY,
  SAGE,
} from '@/lib/palette';

/** Hardcoded contrasting medallion fill per anchor color (Emma's mockups). */
function getCircleColor(cardColor: string): string {
  switch (cardColor) {
    case CORNFLOWER:        return '#5A85D5'; // darker (only light anchor)
    case MIDNIGHT_INK:      return '#2A2D45';
    case DUSTY_ROSE:        return '#C99A9D';
    case WARM_GOLD_ANCHOR:  return '#E8D4A8';
    case STORM_GREY:        return '#5A6573';
    case SAGE:              return '#A8B5A8';
    default:                return cardColor;
  }
}

interface AdultProductCardTileProps {
  card: Card;
  cardColor: string;
  isCompleted: boolean;
  productSlug: string;
}

export default function AdultProductCardTile({
  card,
  cardColor,
  isCompleted,
  productSlug,
}: AdultProductCardTileProps) {
  const navigate = useNavigate();
  const tileImage = useCardImage(card.id);

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);
  const skipPillAnimation = isFirstRenderRef.current && isCompleted;

  const titleZoneBg = `color-mix(in srgb, ${cardColor} 88%, #000000)`;
  const accentLine = `color-mix(in srgb, ${WARM_GOLD} 60%, transparent)`;

  return (
    <button
      type="button"
      className="product-card-tile"
      onClick={() =>
        navigate(`/product/${productSlug}/portal/${card.categoryId}?card=${card.id}`)
      }
      aria-label={card.title}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: '22px',
        overflow: 'hidden',
        textAlign: 'left',
        backgroundColor: cardColor,
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 24px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.08)',
        padding: 0,
        minWidth: 0,
      }}
    >
      {/* Zone A — illustration (65%) */}
      <div
        style={{
          position: 'relative',
          flex: '0 0 65%',
          backgroundColor: cardColor,
          overflow: 'hidden',
        }}
      >
        {tileImage && (
          <img
            src={tileImage}
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '6px',
              display: 'block',
            }}
          />
        )}

        {/* Inner shadow at bottom edge of zone A */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background:
              'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Saffron checkmark */}
        {isCompleted && (
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
              zIndex: 4,
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

      {/* Accent line — 1px warm gold */}
      <div
        style={{
          height: '1px',
          width: '100%',
          backgroundColor: accentLine,
          flexShrink: 0,
        }}
      />

      {/* Zone B — title (35%) */}
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          backgroundColor: titleZoneBg,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 24",
            fontSize: '18px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {card.title}
        </span>
      </div>
    </button>
  );
}
