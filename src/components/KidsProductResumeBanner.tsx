/**
 * KidsProductResumeBanner — Glassmorphism resume card for kids product home screens.
 *
 * Shows topic title and navigates directly back into the session on tap.
 * All kids products use a single-step session (all prompts flattened).
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';

interface KidsProductResumeBannerProps {
  product: ProductManifest;
  progress: KidsProductProgress;
  accentColor: string;
}

export default function KidsProductResumeBanner({ product, progress, accentColor }: KidsProductResumeBannerProps) {
  const navigate = useNavigate();

  if (progress.loading || !progress.activeSession) return null;

  const { cardId } = progress.activeSession;
  const card = product.cards.find(c => c.id === cardId);
  if (!card) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/card/${cardId}`, { state: { resumed: true } })}
      style={{
        width: '100%',
        marginTop: '20px',
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        border: '1px solid rgba(218, 157, 29, 0.45)',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        boxShadow: '0 0 16px -4px rgba(218, 157, 29, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.20)',
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: '17px',
          fontWeight: 500,
          color: accentColor,
          lineHeight: 1.3,
        }}
      >
        {card.title}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#DA9D1D',
          opacity: 0.9,
        }}
      >
        Fortsätt →
      </span>
    </motion.button>
  );
}
