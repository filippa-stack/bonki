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
}

export default function ProductCardTile({
  card,
  tileBg,
  isCompleted,
  productSlug,
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
      onClick={() => navigate(`/card/${card.id}`)}
      aria-label={card.title}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '2 / 3',
        borderRadius: '38px',
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
            inset: 0,
            overflow: 'hidden',
            transform: 'scale(1.05)',
            transformOrigin: 'center center',
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
              objectFit: 'cover',
              objectPosition: '50% 25%',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
            }}
          />
        </div>
      )}

      {/* Bottom scrim */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '25%',
          background:
            'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 100%)',
          borderRadius: 'inherit',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 14px',
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 24",
            fontSize: '20px',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1.2,
            display: 'block',
            textShadow:
              '0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.5)',
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
            top: 12,
            right: 12,
            zIndex: 4,
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
          >
            <path
              d="M3.5 9.5 L7.5 13.5 L14.5 5.5"
              stroke={SAFFRON_FLAME}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </button>
  );
}
