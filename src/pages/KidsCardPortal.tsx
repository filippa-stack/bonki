/**
 * KidsCardPortal — Full-bleed illustrated card portal.
 *
 * Replaces the Category Page + session start screen for kids products.
 * Shows the next recommended card in the selected category as an
 * interactive "door" the child taps to enter conversation.
 *
 * Route: /product/:productSlug/portal/:categoryId
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { allProducts } from '@/data/products';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import { useProductTheme } from '@/hooks/useProductTheme';
import PortalBrowseSheet from '@/components/PortalBrowseSheet';
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

/* ── Swipe threshold ── */
const SWIPE_THRESHOLD = 50;

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

  // Apply product theme so CSS variables are set for downstream components
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    product?.backgroundColor,
    product?.ctaButtonColor,
    product?.pronounMode,
    product,
  );

  const progress = useKidsProductProgress(product);
  const completedSet = useMemo(
    () => new Set(progress.recentlyCompletedCardIds),
    [progress.recentlyCompletedCardIds],
  );

  // Determine which card to show — first uncompleted, or first if all done
  const initialCardIndex = useMemo(() => {
    if (!categoryCards.length) return 0;
    const firstUncompleted = categoryCards.findIndex(c => !completedSet.has(c.id));
    return firstUncompleted >= 0 ? firstUncompleted : 0;
  }, [categoryCards, completedSet]);

  const [currentIndex, setCurrentIndex] = useState(initialCardIndex);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [browseOpen, setBrowseOpen] = useState(false);
  const card = categoryCards[currentIndex];

  // Portal-open animation state: 'idle' | 'phase1' | 'phase2'
  const [portalPhase, setPortalPhase] = useState<'idle' | 'phase1' | 'phase2'>('idle');
  const navigating = useRef(false);

  const promptCount = card ? getPromptCount(card) : 0;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= categoryCards.length - 1;

  // Prevent duplicate swipe triggers
  const swipeLock = useRef(false);

  // Navigation
  const goBack = useCallback(() => {
    navigate(`/product/${productSlug}`);
  }, [navigate, productSlug]);

  const startSession = useCallback(() => {
    if (!card || navigating.current || portalPhase !== 'idle') return;
    navigating.current = true;

    // Phase 1: scale + brightness (0–200ms)
    setPortalPhase('phase1');

    setTimeout(() => {
      // Phase 2: fade out everything (200–500ms)
      setPortalPhase('phase2');

      setTimeout(() => {
        // Phase 3: navigate
        navigate(`/card/${card.id}`);
      }, 350);
    }, 200);
  }, [navigate, card, portalPhase]);

  const goToIndex = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (!isLast) {
      setDirection(1);
      setCurrentIndex(i => i + 1);
    }
  }, [isLast]);

  const goPrev = useCallback(() => {
    if (!isFirst) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  }, [isFirst]);

  // Swipe handler
  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (swipeLock.current) return;
      const { offset } = info;
      if (Math.abs(offset.x) < SWIPE_THRESHOLD) return;

      swipeLock.current = true;
      setTimeout(() => { swipeLock.current = false; }, 500);

      if (offset.x < -SWIPE_THRESHOLD && !isLast) {
        goNext();
      } else if (offset.x > SWIPE_THRESHOLD && !isFirst) {
        goPrev();
      }
    },
    [isLast, isFirst, goNext, goPrev],
  );

  // Tile background color from product
  const tileBg = product?.tileLight ?? MIDNIGHT_INK;
  const tileBgRgb = hexToRgb(tileBg);

  // Slide animation variants (direction-aware)
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 120 : -120, opacity: 0, scale: 0.92, y: 0 }),
    center: { x: 0, opacity: 1, scale: 1, y: -4 },
    exit: (d: number) => ({ x: d > 0 ? -120 : 120, opacity: 0, scale: 0.92, y: 0 }),
  };

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
        background: MIDNIGHT_INK,
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
          opacity: portalPhase !== 'idle' ? 0 : 1,
          transition: 'opacity 200ms ease-in',
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

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={card.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileTap={portalPhase === 'idle' ? { scale: 0.97, y: 0 } : undefined}
              onClick={startSession}
              drag={portalPhase === 'idle' ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: tileBg,
                zIndex: 1,
                transform: portalPhase === 'phase1' ? 'scale(1.03)' : portalPhase === 'phase2' ? 'scale(1.03)' : undefined,
                filter: portalPhase === 'phase1' ? 'brightness(1.1)' : undefined,
                opacity: portalPhase === 'phase2' ? 0 : 1,
                transition: 'transform 200ms ease-out, filter 200ms ease-out, opacity 300ms ease-in',
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

              {/* Subtle bottom scrim — just enough for title legibility */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '25%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 60%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {/* Card title centered at bottom */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '20px',
                  textAlign: 'center',
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

          {/* Outer elevation — deep multi-layer lift */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              boxShadow: [
                '0 30px 60px -12px rgba(0, 0, 0, 0.55)',
                '0 18px 36px -8px rgba(0, 0, 0, 0.35)',
                '0 8px 16px rgba(0, 0, 0, 0.20)',
                '0 2px 6px rgba(0, 0, 0, 0.15)',
                `0 0 80px -20px rgba(${tileBgRgb}, 0.30)`,
              ].join(', '),
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </div>

        {/* ═══ Compact info below tile ═══ */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`text-${card.id}`}
            custom={direction}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              textAlign: 'center',
              marginTop: '10px',
              flexShrink: 0,
              opacity: portalPhase !== 'idle' ? 0 : 1,
              transition: 'opacity 200ms ease-in',
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
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                fontStyle: 'italic',
                color: SAFFRON_FLAME,
                opacity: 0.8,
                marginTop: '8px',
              }}
            >
              Tryck på dörren när ni är redo.
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ═══ Navigation links ═══ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginTop: '6px',
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)`,
            flexShrink: 0,
            opacity: portalPhase !== 'idle' ? 0 : 1,
            transition: 'opacity 200ms ease-in',
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
          <button
            onClick={() => setBrowseOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: DRIFTWOOD,
              padding: '4px 16px',
              opacity: 0.7,
            }}
          >
            Utforska alla kort
          </button>
        </div>
      </div>

      {/* ═══ Browse Sheet ═══ */}
      <PortalBrowseSheet
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        cards={categoryCards}
        currentCardId={card.id}
        completedCardIds={completedSet}
        tileLight={tileBg}
        onSelectCard={goToIndex}
      />
    </div>
  );
}
