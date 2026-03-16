import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { LANTERN_GLOW } from '@/lib/palette';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const READABLE_SECONDARY = '#998F82';

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
 * "Nästa samtal" card — solid tileMid background on the workspace zone.
 */
export default function NextConversationCard({ product, progress }: NextConversationCardProps) {
  const navigate = useNavigate();

  const { nextSuggestedCardId, nextSuggestedCategoryId } = progress;
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
        backgroundColor: tileMid,
        borderRadius: '16px',
        border: `1px solid ${hexToRgba(tileLight, 0.30)}`,
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
        color: `${LANTERN_GLOW}B3`,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
      }}>
        Nästa samtal
      </span>

      <span style={{
        fontFamily: "'DM Serif Display', var(--font-serif)",
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
          color: READABLE_SECONDARY,
        }}>
          Från {category.title}
        </span>
      )}
    </motion.button>
  );
}
