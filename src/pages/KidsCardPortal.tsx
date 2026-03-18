/**
 * KidsCardPortal — Full-bleed illustrated card portal.
 *
 * Replaces the Category Page + session start screen for kids products.
 * Shows the next recommended card in the selected category as an
 * interactive "door" the child taps to enter conversation.
 *
 * Route: /product/:productSlug/portal/:categoryId
 */

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { allProducts } from '@/data/products';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
} from '@/lib/palette';

/* ── Helpers ── */

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return `${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)}`;
}

function estimateMinutes(_promptCount: number): string {
  return 'ca 5–10 min';
}

function getPromptCount(card: { sections?: { prompts?: unknown[] }[] }): number {
  return card.sections?.reduce((sum, s) => sum + (s.prompts?.length ?? 0), 0) ?? 0;
}

/* ── Card Image Loader (wrapper to satisfy hook rules) ── */
function PortalCardImage({ cardId, children }: { cardId: string; children: (src: string | null) => React.ReactNode }) {
  const src = useCardImage(cardId);
  return <>{children(src)}</>;
}

/* ── Main Component ── */

export default function KidsCardPortal() {
  const { productSlug, categoryId } = useParams<{ productSlug: string; categoryId: string }>();
  const navigate = useNavigate();

  // Resolve product + category
  const product = allProducts.find(p => p.slug === productSlug);
  const category = product?.categories.find(c => c.id === categoryId);
  const categoryCards = useMemo(
    () => product?.cards.filter(c => c.categoryId === categoryId) ?? [],
    [product, categoryId],
  );

  const progress = useKidsProductProgress(product);

  // Determine which card to show — first uncompleted, or first if all done
  const initialCardIndex = useMemo(() => {
    if (!categoryCards.length) return 0;
    const completedSet = new Set(progress.recentlyCompletedCardIds);
    const firstUncompleted = categoryCards.findIndex(c => !completedSet.has(c.id));
    return firstUncompleted >= 0 ? firstUncompleted : 0;
  }, [categoryCards, progress.recentlyCompletedCardIds]);

  const [currentIndex, setCurrentIndex] = useState(initialCardIndex);
  const card = categoryCards[currentIndex];

  const promptCount = card ? getPromptCount(card) : 0;
  const isLast = currentIndex >= categoryCards.length - 1;

  // Navigation
  const goBack = useCallback(() => {
    navigate(`/product/${productSlug}`);
  }, [navigate, productSlug]);

  const startSession = useCallback(() => {
    if (!card) return;
    navigate(`/card/${card.id}`);
  }, [navigate, card]);

  const goNext = useCallback(() => {
    if (!isLast) setCurrentIndex(i => i + 1);
  }, [isLast]);

  // Tile background color from product
  const tileBg = product?.tileLight ?? MIDNIGHT_INK;
  const tileBgRgb = hexToRgb(tileBg);
  const bgDark = product?.tileDeep ?? MIDNIGHT_INK;

  if (!product || !category || !card) {
    return (
      <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: DRIFTWOOD, fontSize: '14px' }}>Produkten hittades inte</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        background: `linear-gradient(180deg, ${MIDNIGHT_INK} 0%, ${MIDNIGHT_INK} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-25%',
          right: '-25%',
          bottom: '30%',
          background: `radial-gradient(ellipse at 50% 35%, rgba(${tileBgRgb}, 0.35) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ═══ Top Bar ═══ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `calc(env(safe-area-inset-top, 0px) + 10px) 16px 6px`,
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={goBack}
          aria-label="Tillbaka"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: LANTERN_GLOW, opacity: 0.7, padding: '4px' }}
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: DRIFTWOOD,
          }}
        >
          {category.title}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: DRIFTWOOD,
            minWidth: '28px',
            textAlign: 'right',
          }}
        >
          {currentIndex + 1}/{categoryCards.length}
        </span>
      </div>

      {/* ═══ Main area ═══ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '4px 12px 0',
          position: 'relative',
          zIndex: 1,
          minHeight: 0,
        }}
      >
        {/* ═══ Portal tile — constrained to leave room for copy ═══ */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0, maxHeight: 'calc(100vh - 280px)' }}>

          {/* ── Saffron glow frame (matches recommended tiles) ── */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '24px',
              boxShadow: [
                `0 0 16px rgba(233, 180, 76, 0.45)`,
                `0 0 4px rgba(233, 180, 76, 0.25)`,
              ].join(', '),
              border: `2px solid ${SAFFRON_FLAME}`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: 50, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.92 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
              onClick={startSession}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: tileBg,
                zIndex: 1,
              }}
            >
              {/* Card illustration — full bleed */}
              <PortalCardImage cardId={card.id}>
                {(imageSrc) => imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={card.title}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: '50% 50%',
                      opacity: 0.92,
                      zIndex: 1,
                      filter: 'saturate(1.05) contrast(1.03)',
                    }}
                  />
                ) : null}
              </PortalCardImage>

              {/* Ceramic glaze — highlight sweep */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: [
                    'linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 25%, transparent 50%)',
                    'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 35%, rgba(0,0,0,0.18) 100%)',
                    'radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.10) 0%, transparent 45%)',
                  ].join(', '),
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />

              {/* Bottom scrim for overlaid card title */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '35%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {/* Card title centered in tile */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 4,
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: LANTERN_GLOW,
                    margin: 0,
                    textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  {card.title}
                </h2>
              </div>

              {/* Ceramic rim — multi-layer bevel */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '20px',
                  boxShadow: [
                    'inset 0 2px 4px rgba(255, 255, 255, 0.50)',
                    'inset 0 1px 0px rgba(255, 255, 255, 0.65)',
                    'inset 0 -3px 10px rgba(0, 0, 0, 0.25)',
                    'inset 0 -1px 2px rgba(0, 0, 0, 0.18)',
                    'inset 3px 0 8px rgba(255, 255, 255, 0.06)',
                    'inset -3px 0 8px rgba(0, 0, 0, 0.06)',
                    `inset 0 0 40px rgba(${tileBgRgb}, 0.12)`,
                  ].join(', '),
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              />

              {/* Ceramic border */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '20px',
                  border: '1.5px solid rgba(255, 255, 255, 0.22)',
                  pointerEvents: 'none',
                  zIndex: 6,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Outer elevation shadow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              boxShadow: [
                '0 12px 32px rgba(0, 0, 0, 0.30)',
                '0 4px 12px rgba(0, 0, 0, 0.18)',
              ].join(', '),
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </div>

        {/* ═══ Compact info below tile ═══ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${card.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              textAlign: 'center',
              marginTop: '10px',
              flexShrink: 0,
            }}
          >
            {card.subtitle && (
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  color: LANTERN_GLOW,
                  opacity: 0.7,
                  lineHeight: 1.4,
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  padding: '0 20px',
                }}
              >
                {card.subtitle}
              </p>
            )}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                color: DRIFTWOOD,
                marginTop: '4px',
              }}
            >
              {promptCount} frågor · {estimateMinutes(promptCount)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ═══ Navigation ═══ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '6px',
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)`,
            flexShrink: 0,
          }}
        >
          {!isLast && (
            <button
              onClick={goNext}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: DRIFTWOOD,
                padding: '6px 16px',
              }}
            >
              Nästa kort →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
