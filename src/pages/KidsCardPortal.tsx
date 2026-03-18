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

function estimateMinutes(promptCount: number): string {
  const lo = promptCount * 3;
  const hi = promptCount * 4;
  return `ca ${lo}–${hi} min`;
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

  if (!product || !category || !card) {
    return (
      <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: DRIFTWOOD, fontSize: '14px' }}>Produkten hittades inte</p>
      </div>
    );
  }

  // Darken the product color for background atmosphere
  const bgDark = product?.tileDeep ?? MIDNIGHT_INK;

  return (
    <div
      style={{
        height: '100vh',
        background: `linear-gradient(180deg, ${bgDark} 0%, ${MIDNIGHT_INK} 60%)`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ═══ Background radial glow — product color atmosphere ═══ */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-20%',
          right: '-20%',
          bottom: '40%',
          background: `radial-gradient(ellipse at 50% 40%, rgba(${tileBgRgb}, 0.30) 0%, transparent 70%)`,
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
          padding: `calc(env(safe-area-inset-top, 0px) + 12px) 16px 8px`,
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

      {/* ═══ Portal Content — fills remaining space ═══ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1,
          minHeight: 0, // allow flex shrink
        }}
      >
        {/* Portal tile wrapper — takes maximum space, text gets the rest */}
        <div
          style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: 0,
          }}
        >
          {/* ═══ Ambient glow behind the portal ═══ */}
          {/* Large color spill */}
          <motion.div
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.06, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: '-60px',
              borderRadius: '50%',
              background: `radial-gradient(ellipse at center, rgba(${tileBgRgb}, 0.55) 0%, rgba(${tileBgRgb}, 0.18) 45%, transparent 72%)`,
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          {/* Warm saffron pulse */}
          <motion.div
            animate={{
              opacity: [0.15, 0.35, 0.15],
              scale: [1.05, 0.95, 1.05],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            style={{
              position: 'absolute',
              inset: '-30px',
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 40% 25%, rgba(${hexToRgb(SAFFRON_FLAME)}, 0.25) 0%, transparent 55%)`,
              filter: 'blur(25px)',
              pointerEvents: 'none',
            }}
          />

          {/* ═══ Portal tile — the "door" ═══ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: 40, scale: 0.90 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.90 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.96 }}
              style={{
                width: '100%',
                maxWidth: '350px',
                height: '100%',
                maxHeight: 'min(480px, 56vh)',
                position: 'relative',
                borderRadius: '22px',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: tileBg,
              }}
              onClick={startSession}
            >
              {/* Ceramic glaze — top-left highlight sweep */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: [
                    'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 25%, transparent 50%)',
                    'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)',
                    `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)`,
                  ].join(', '),
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              />

              {/* Card illustration */}
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
                      objectFit: 'cover',
                      objectPosition: '50% 30%',
                      opacity: 0.92,
                      zIndex: 1,
                      filter: 'saturate(1.05) contrast(1.04)',
                    }}
                  />
                ) : null}
              </PortalCardImage>

              {/* Illustration depth glow — warm radial behind character */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(ellipse at 50% 45%, rgba(${tileBgRgb}, 0.40) 0%, transparent 60%)`,
                  pointerEvents: 'none',
                  zIndex: 2,
                  mixBlendMode: 'soft-light',
                }}
              />

              {/* Ceramic rim — multi-layer inset shadows for 3D bevel */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '22px',
                  boxShadow: [
                    // Top edge highlight — ceramic light catch
                    'inset 0 2px 4px rgba(255, 255, 255, 0.55)',
                    'inset 0 1px 0px rgba(255, 255, 255, 0.70)',
                    // Bottom shadow — depth/weight
                    'inset 0 -3px 8px rgba(0, 0, 0, 0.25)',
                    'inset 0 -1px 2px rgba(0, 0, 0, 0.20)',
                    // Side ambient
                    'inset 3px 0 8px rgba(255, 255, 255, 0.08)',
                    'inset -3px 0 8px rgba(0, 0, 0, 0.08)',
                    // Inner glow
                    `inset 0 0 40px rgba(${tileBgRgb}, 0.15)`,
                  ].join(', '),
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              />

              {/* Border — translucent ceramic edge */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '22px',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  pointerEvents: 'none',
                  zIndex: 6,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Outer elevation shadows — rendered outside overflow:hidden */}
          <div
            style={{
              position: 'absolute',
              inset: '0',
              width: '100%',
              maxWidth: '350px',
              height: '100%',
              maxHeight: 'min(480px, 56vh)',
              margin: 'auto',
              borderRadius: '22px',
              boxShadow: [
                // Color spill glow
                `0 0 80px rgba(${tileBgRgb}, 0.55)`,
                `0 0 160px rgba(${tileBgRgb}, 0.20)`,
                // Elevation
                '0 30px 80px -12px rgba(0, 0, 0, 0.55)',
                '0 12px 32px rgba(0, 0, 0, 0.35)',
                '0 4px 14px rgba(0, 0, 0, 0.25)',
              ].join(', '),
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ═══ Text Cluster Below Portal — compact ═══ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${card.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              textAlign: 'center',
              marginTop: '14px',
              width: '100%',
              maxWidth: '320px',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: LANTERN_GLOW,
                margin: 0,
              }}
            >
              {card.title}
            </h2>

            {card.subtitle && (
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  color: LANTERN_GLOW,
                  opacity: 0.75,
                  marginTop: '6px',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {card.subtitle}
              </p>
            )}

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: DRIFTWOOD,
                marginTop: '6px',
              }}
            >
              {promptCount} frågor · {estimateMinutes(promptCount)}
            </p>

            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontStyle: 'italic',
                color: DRIFTWOOD,
                marginTop: '8px',
              }}
            >
              Tryck på dörren när ni är redo.
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ═══ Navigation Links ═══ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '10px',
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)`,
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