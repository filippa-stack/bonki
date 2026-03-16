import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { LANTERN_GLOW, DRIFTWOOD } from '@/lib/palette';
import { useCardImage } from '@/hooks/useCardImage';

const EASE = [0.4, 0.0, 0.2, 1] as const;

/**
 * Converts a hex color to rgba string.
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface NextConversationCardProps {
  product: ProductManifest;
  progress: KidsProductProgress;
}

/**
 * "Nästa samtal" card for kids product home screens.
 * Frosted glass treatment with card illustration bleed-out on the right.
 */
export default function NextConversationCard({ product, progress }: NextConversationCardProps) {
  const navigate = useNavigate();

  const { nextSuggestedCardId, nextSuggestedCategoryId } = progress;

  // Don't render if there's no next card or if active session exists (resume banner takes priority)
  if (!nextSuggestedCardId || progress.activeSession) return null;

  const card = product.cards.find(c => c.id === nextSuggestedCardId);
  const category = product.categories.find(c => c.id === nextSuggestedCategoryId);

  if (!card) return null;

  const tileLight = product.tileLight ?? product.accentColor;
  const tileMid = product.tileMid ?? '#2A2D3A';
  const cardImage = useCardImage(nextSuggestedCardId);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.94, y: 3 }}
      transition={{ duration: 0.5, ease: EASE }}
      onClick={() => navigate(`/card/${card.id}`)}
      style={{
        width: '100%',
        background: `linear-gradient(135deg, ${hexToRgba(tileMid, 0.70)} 0%, ${hexToRgba(tileMid, 0.50)} 100%)`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: `1px solid ${hexToRgba(tileLight, 0.45)}`,
        padding: '16px',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginTop: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Card illustration — bleeds out on the right */}
      {cardImage && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-8%',
              width: '55%',
              height: '120%',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            <img
              src={cardImage}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '50% 30%',
                opacity: 0.30,
              }}
            />
          </div>
          {/* Gradient mask from left to protect text readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '70%',
              background: `linear-gradient(to right, ${hexToRgba(tileMid, 0.95)} 0%, ${hexToRgba(tileMid, 0.4)} 60%, transparent 100%)`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </>
      )}

      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: 600,
        color: `${LANTERN_GLOW}B3`,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        position: 'relative',
        zIndex: 2,
      }}>
        Nästa samtal
      </span>

      <span style={{
        fontFamily: "var(--font-display)",
        fontVariationSettings: "'opsz' 20",
        fontSize: '22px',
        fontWeight: 600,
        color: LANTERN_GLOW,
        lineHeight: 1.3,
        position: 'relative',
        zIndex: 2,
      }}>
        {card.title}
      </span>

      {category && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: DRIFTWOOD,
          position: 'relative',
          zIndex: 2,
        }}>
          Från {category.title}
        </span>
      )}
    </motion.button>
  );
}
