import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import type { ProductManifest } from '@/types/product';

interface ProductResumeBannerProps {
  product: ProductManifest;
  accentColor: string;
}

/**
 * Shows "Fortsätt med {cardTitle} →" when there's an active session
 * belonging to this product. Matches Still Us resume link design.
 */
export default function ProductResumeBanner({ product, accentColor }: ProductResumeBannerProps) {
  const navigate = useNavigate();
  const { sessionId, cardId, loading } = useNormalizedSessionContext();

  if (loading || !sessionId || !cardId) return null;

  const card = product.cards.find(c => c.id === cardId);
  if (!card) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      style={{ marginTop: '14px' }}
    >
      <button
        onClick={() => navigate(`/card/${cardId}`, { state: { resumed: true } })}
        className="font-serif"
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: accentColor,
          opacity: 1,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationColor: `${accentColor}4D`,
          textUnderlineOffset: '3px',
          padding: 0,
          letterSpacing: '0.01em',
        }}
      >
        Fortsätt med {card.title} →
      </button>
    </motion.div>
  );
}
