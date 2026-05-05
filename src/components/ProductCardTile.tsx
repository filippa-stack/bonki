/**
 * ProductCardTile — single card tile for the product home grid.
 *
 * Reuses the painterly illustration + bottom scrim + bottom-left serif title
 * pattern from KidsProductHome's CategoryTile. Tap → /card/:cardId.
 *
 * Completed cards: 1.5px saffron INSET border (box-shadow) — sits inside the
 * rounded radius without disturbing layout or being clipped.
 */

import { useNavigate } from 'react-router-dom';
import type { Card } from '@/types';
import { useCardImage } from '@/hooks/useCardImage';
import { SAFFRON_FLAME } from '@/lib/palette';

interface ProductCardTileProps {
  card: Card;
  tileBg: string;
  isCompleted: boolean;
}

export default function ProductCardTile({
  card,
  tileBg,
  isCompleted,
}: ProductCardTileProps) {
  const navigate = useNavigate();
  const tileImage = useCardImage(card.id);

  const baseShadow =
    '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)';
  const shadow = isCompleted
    ? `${baseShadow}, inset 0 0 0 1.5px ${SAFFRON_FLAME}`
    : baseShadow;

  return (
    <button
      type="button"
      onClick={() => navigate(`/card/${card.id}`)}
      aria-label={card.title}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '2 / 3',
        borderRadius: '38px',
        cursor: 'pointer',
        textAlign: 'left',
        backgroundColor: tileBg,
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: shadow,
        padding: 0,
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
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
    </button>
  );
}
