/**
 * ProductCardTile — single card tile for the product home grid.
 *
 * Reuses the painterly illustration + bottom scrim + bottom-left serif title
 * pattern from KidsProductHome's CategoryTile. Tap → /card/:cardId.
 *
 * Completed cards display a glassy saffron "Klart" pill in the top-right.
 * The pill fades in (240ms) when transitioning incomplete → complete; on
 * initial mount with already-completed cards it appears without animation.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Card } from '@/types';
import { useCardImage } from '@/hooks/useCardImage';
import { SAFFRON_FLAME } from '@/lib/palette';

interface ProductCardTileProps {
  card: Card;
  tileBg: string;
  isCompleted: boolean;
  productSlug: string;
  darkText?: boolean;
}

export default function ProductCardTile({
  card,
  tileBg,
  isCompleted,
  productSlug,
  darkText = false,
}: ProductCardTileProps) {
  const navigate = useNavigate();
  const tileImage = useCardImage(card.id);

  // Track first render so already-completed cards don't fade in on mount
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);
  const skipPillAnimation = isFirstRenderRef.current && isCompleted;

  const shadow =
    '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)';

  return (
    <button
      type="button"
      className="product-card-tile"
      onClick={() => navigate(`/product/${productSlug}/portal/${card.categoryId}?card=${card.id}`)}
      aria-label={card.title}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: '22px',
        textAlign: 'left',
        backgroundColor: tileBg,
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: shadow,
        padding: 0,
      }}
    >
      {tileImage && (
        <div
          style={{
            position: 'absolute',
            inset: 16,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <img
            src={tileImage}
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
            }}
          />
        </div>
      )}

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          padding: 0,
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 24",
            fontSize: '18px',
            fontWeight: 600,
            color: darkText ? '#5A3A1F' : '#FFFFFF',
            lineHeight: 1.2,
            display: 'block',
            textShadow: darkText
              ? '0 1px 2px rgba(255,255,255,0.45)'
              : '0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.5)',
          }}
        >
          {card.title}
        </span>
      </div>

      {/* Klart completion checkmark */}
      {isCompleted && (
        <motion.div
          role="status"
          aria-label="Klart"
          initial={skipPillAnimation ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
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
    </button>
  );
}
