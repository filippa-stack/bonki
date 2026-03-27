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
    ctaText = 'Fortsätt →';
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
    ctaText = hasCompletions ? 'Nästa →' : 'Börja →';
    labelColor = DRIFTWOOD;
    onClick = () => navigate(`/product/${product.slug}/portal/${nextSuggestedCategoryId}?card=${nextSuggestedCardId}`);

  // STATE 4: Fallback — no banner
  } else {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        background: 'rgba(42, 45, 58, 0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 253, 248, 0.08)',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Left: text block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: labelColor,
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 500,
          color: LANTERN_GLOW,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {subtitle}
        </span>
      </div>

      {/* Right: CTA */}
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 600,
        color: SAFFRON_FLAME,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {ctaText}
      </span>
    </motion.button>
  );
}
