/**
 * UnifiedResumeBanner — Platform-level resume card shown on all product home screens.
 *
 * Displays when a paused/active session exists for this product.
 * Consistent styling: Deep Dusk background, product accent left border,
 * card name + step progress info + creature illustration.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { buildDynamicSteps } from '@/components/StepProgressIndicator';
import {
  DEEP_DUSK,
  DEEP_SAFFRON,
  LANTERN_GLOW,
  DRIFTWOOD,
} from '@/lib/palette';
import { STILL_US_CREATURES } from '@/lib/stillUsCreatures';

/* ── Types ── */

interface UnifiedResumeBannerProps {
  /** Product manifest — used to look up card title */
  product?: ProductManifest;
  /** Product accent color for the left border (hex) */
  accentColor: string;
  /** For kids products: pass the progress object from useKidsProductProgress */
  kidsProgress?: KidsProductProgress;
  /** For Still Us: the component reads from NormalizedSessionContext internally */
  isStillUs?: boolean;
  /** For Still Us: pass the card lookup function */
  getCardById?: (id: string) => any;
}

export default function UnifiedResumeBanner({
  product,
  accentColor,
  kidsProgress,
  isStillUs = false,
  getCardById,
}: UnifiedResumeBannerProps) {
  const navigate = useNavigate();
  const normalizedSession = useNormalizedSessionContext();

  // ── Resolve session data ──
  let cardId: string | null = null;
  let cardTitle: string | null = null;
  let categoryId: string | null = null;
  let progressLabel = '';

  if (isStillUs) {
    // Still Us: use normalized session
    if (!normalizedSession.sessionId || !normalizedSession.cardId) return null;
    cardId = normalizedSession.cardId;
    const card = getCardById?.(cardId);
    if (!card) return null;
    cardTitle = card.title;
    categoryId = card.categoryId ?? normalizedSession.categoryId ?? null;

    // Build step label
    const stepIndex = normalizedSession.currentStepIndex ?? 0;
    const effectiveSteps = card.sections?.map((s: { type: string }) => s.type) ?? [];
    const dynSteps = buildDynamicSteps(effectiveSteps, true);
    const step = dynSteps[stepIndex];
    if (step) {
      // Count prompts in current section
      const section = card.sections?.[stepIndex];
      const promptCount = section?.prompts?.length ?? 0;
      progressLabel = promptCount > 1
        ? `${step.label.toUpperCase()} · Fråga 1 av ${promptCount}`
        : step.label.toUpperCase();
    }
  } else if (kidsProgress) {
    // Kids products: use kidsProgress
    if (kidsProgress.loading || !kidsProgress.activeSession) return null;
    cardId = kidsProgress.activeSession.cardId;
    const card = product?.cards.find(c => c.id === cardId);
    if (!card) return null;
    cardTitle = card.title;

    // Kids progress: all use flattened single-step
    const totalPrompts = card.sections?.reduce(
      (sum, s) => sum + (s.prompts?.length ?? 0), 0
    ) ?? 0;
    progressLabel = totalPrompts > 1
      ? `FRÅGOR · ${kidsProgress.activeSession.currentStepIndex + 1} av ${totalPrompts}`
      : 'FRÅGOR';
  } else {
    return null;
  }

  const creature = categoryId ? STILL_US_CREATURES[categoryId] : null;

  return (
    <motion.button
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/card/${cardId}`, { state: { resumed: true } })}
      style={{
        width: '100%',
        marginTop: '24px',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        background: DEEP_DUSK,
        borderLeft: `3px solid ${isStillUs ? DEEP_SAFFRON : accentColor}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
      }}
    >
      {/* Creature illustration */}
      {creature && (
        <img
          src={creature.src}
          alt=""
          style={{
            position: 'absolute',
            right: creature.tileRight ?? '0%',
            top: '50%',
            transform: 'translateY(-50%)',
            height: creature.tileHeight ?? '140%',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: creature.objectPosition,
            opacity: 0.10,
            pointerEvents: 'none',
            filter: 'saturate(0.3) brightness(1.1)',
          }}
        />
      )}

      {/* Line 1: Label */}
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: DRIFTWOOD,
        position: 'relative',
        zIndex: 1,
      }}>
        Fortsätt ert samtal
      </span>

      {/* Line 2: Card name */}
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: '18px',
        fontWeight: 500,
        color: LANTERN_GLOW,
        lineHeight: 1.3,
        position: 'relative',
        zIndex: 1,
      }}>
        {cardTitle}
      </span>

      {/* Line 3: Progress */}
      {progressLabel && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: DRIFTWOOD,
          position: 'relative',
          zIndex: 1,
        }}>
          {progressLabel}
        </span>
      )}
    </motion.button>
  );
}
