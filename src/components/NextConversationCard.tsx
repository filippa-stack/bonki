import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { LANTERN_GLOW, DRIFTWOOD } from '@/lib/palette';

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
 * Frosted glass treatment using product creature color.
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

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.94, y: 3 }}
      transition={{ duration: 0.5, ease: EASE }}
      onClick={() => navigate(`/card/${card.id}`)}
      style={{
        width: '100%',
        background: hexToRgba(tileMid, 0.20),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: `1px solid ${hexToRgba(tileLight, 0.40)}`,
        padding: '16px',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginTop: '16px',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        fontWeight: 600,
        color: `${LANTERN_GLOW}B3`, // 70% opacity
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
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
      }}>
        {card.title}
      </span>

      {category && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 400,
          color: DRIFTWOOD,
        }}>
          Från {category.title}
        </span>
      )}
    </motion.button>
  );
}
