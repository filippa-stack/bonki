import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import {
  LANTERN_GLOW,
  DRIFTWOOD,
} from '@/lib/palette';

const EASE = [0.4, 0.0, 0.2, 1] as const;

interface NextConversationCardProps {
  product: ProductManifest;
  progress: KidsProductProgress;
}

/**
 * "Nästa samtal" card for kids product home screens.
 * Shows the next suggested card in sequence with category context.
 * Uses tileMid background with tileLight left border.
 */
export default function NextConversationCard({ product, progress }: NextConversationCardProps) {
  const navigate = useNavigate();

  const { nextSuggestedCardId, nextSuggestedCategoryId } = progress;

  // Don't render if there's no next card or if active session exists (resume banner takes priority)
  if (!nextSuggestedCardId || progress.activeSession) return null;

  const card = product.cards.find(c => c.id === nextSuggestedCardId);
  const category = product.categories.find(c => c.id === nextSuggestedCategoryId);

  if (!card) return null;

  const tileMid = product.tileMid ?? '#2A2D3A';
  const tileLight = product.tileLight ?? product.accentColor;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.94, y: 3 }}
      transition={{ duration: 0.5, ease: EASE }}
      onClick={() => navigate(`/card/${card.id}`)}
      style={{
        width: '100%',
        backgroundImage: `linear-gradient(160deg, ${tileMid} 0%, ${tileMid} 100%)`,
        borderRadius: '22px',
        border: `1.5px solid rgba(255, 255, 255, 0.30)`,
        borderLeft: `3px solid ${tileLight}`,
        padding: '16px',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginTop: '24px',
        boxShadow: `
          0 12px 32px rgba(0, 0, 0, 0.30),
          inset 0 3px 6px rgba(255, 255, 255, 0.45),
          inset 0 -4px 10px rgba(0, 0, 0, 0.14)
        `,
      }}
    >
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 600,
        color: DRIFTWOOD,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
      }}>
        Nästa samtal
      </span>

      <span style={{
        fontFamily: "'DM Serif Display', var(--font-serif)",
        fontSize: '20px',
        fontWeight: 600,
        color: LANTERN_GLOW,
        lineHeight: 1.3,
      }}>
        {card.title}
      </span>

      {category && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontWeight: 400,
          color: DRIFTWOOD,
        }}>
          Från {category.title}
        </span>
      )}
    </motion.button>
  );
}
