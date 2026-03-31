/**
 * NextActionBanner — persistent glass pill that always shows the user's one next action.
 *
 * Four states:
 *   1. Active session → "Fortsätt ert samtal"
 *   2. All cards done → cross-product recommendation
 *   3. Next suggested card → "Nästa samtal" / "Börja här"
 *   4. Fallback → hidden
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { getNextProductRecommendation } from '@/lib/productRecommendations';
import {
  SAFFRON_FLAME,
  LANTERN_GLOW,
  DRIFTWOOD,
} from '@/lib/palette';

interface NextActionBannerProps {
  product: ProductManifest;
  progress: KidsProductProgress;
  completedProductSlugs?: Set<string>;
}

export default function NextActionBanner({
  product,
  progress,
  completedProductSlugs,
}: NextActionBannerProps) {
  const navigate = useNavigate();

  // Don't render while loading
  if (progress.loading) return null;

  const { activeSession, nextSuggestedCardId, nextSuggestedCategoryId, recentlyCompletedCardIds } = progress;

  const totalCards = product.cards.length;
  const completedCount = recentlyCompletedCardIds.length;
  const allDone = completedCount >= totalCards && !activeSession;

  let label: string;
  let subtitle: string;
  let ctaText: string;
  let labelColor: string;
  let onClick: () => void;

  // STATE 1: Active session — resume it
  if (activeSession) {
    const card = product.cards.find(c => c.id === activeSession.cardId);
    if (!card) return null;
    label = 'Fortsätt ert samtal';
    subtitle = card.title;
    ctaText = 'Öppna →';
    labelColor = LANTERN_GLOW;
    onClick = () => navigate(`/card/${card.id}`, { state: { resumed: true } });

  // STATE 2: All cards done — cross-product recommendation
  } else if (allDone) {
    if (!completedProductSlugs) return null;
    const recommendation = getNextProductRecommendation(product.slug, completedProductSlugs);
    if (!recommendation) return null;
    label = 'Ert nästa steg';
    subtitle = recommendation.displayName;
    ctaText = 'Utforska →';
    labelColor = DRIFTWOOD;
    onClick = () => navigate(`/product/${recommendation.slug}`);

  // STATE 3: Has next suggested card within this product
  } else if (nextSuggestedCardId && nextSuggestedCategoryId) {
    const card = product.cards.find(c => c.id === nextSuggestedCardId);
    if (!card) return null;
    const hasCompletions = completedCount > 0;
    label = hasCompletions ? 'Nästa samtal' : 'Börja här';
    subtitle = card.title;
    ctaText = 'Öppna →';
    labelColor = LANTERN_GLOW;
    onClick = () => navigate(`/product/${product.slug}/portal/${nextSuggestedCategoryId}?card=${nextSuggestedCardId}`);

  // STATE 4: Fallback — no banner
  } else {
    return null;
  }

  const accentColor = product.tileLight ?? SAFFRON_FLAME;
  const EASE = [0.4, 0.0, 0.2, 1] as const;

  return (
    <motion.button
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '88%',
        maxWidth: '340px',
        margin: '0 auto',
        padding: '12px 20px',
        background: `${accentColor}55`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '40px',
        border: `1px solid ${accentColor}40`,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: '3px',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 600,
          color: LANTERN_GLOW,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {subtitle}
        </p>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: '#FFFFFF',
          flexShrink: 0,
          marginLeft: '12px',
          textShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
      >
        {ctaText}
      </span>
    </motion.button>
  );
}
