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

function estimateMinutes(_promptCount: number, productSlug?: string): string {
  if (productSlug === 'still-us') return 'ca 10–20 min';
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
  const allCategoryCards = useMemo(
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

  // Reorder: uncompleted cards first (in original sequence), completed cards to back
  const categoryCards = useMemo(() => {
    const uncompleted = allCategoryCards.filter(c => !completedSet.has(c.id));
    const completed = allCategoryCards.filter(c => completedSet.has(c.id));
    return [...uncompleted, ...completed];
  }, [allCategoryCards, completedSet]);

  // Always start at the first card (which is now the first uncompleted)
  const initialCardIndex = 0;

  const [currentIndex, setCurrentIndex] = useState(initialCardIndex);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [browseOpen, setBrowseOpen] = useState(false);
  const card = categoryCards[currentIndex];

  // Portal-open animation state
  const [portalPhase, setPortalPhase] = useState<'idle' | 'phase1' | 'phase2' | 'phase3'>('idle');
  const navigating = useRef(false);

  const isStillUs = productSlug === 'still-us';

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

    if (isStillUs) {
      // ── Still Us: cinematic warm-light burst ──
      // Phase 1 (0–400ms): glow intensifies, card lifts
      setPortalPhase('phase1');
      setTimeout(() => {
        // Phase 2 (400–900ms): radial light floods screen
        setPortalPhase('phase2');
        setTimeout(() => {
          // Phase 3 (900–1200ms): light fades, navigate
          setPortalPhase('phase3');
          setTimeout(() => navigate(`/card/${card.id}`), 350);
        }, 500);
      }, 400);
    } else {
      // ── Kids/other: magical zoom-through ──
      // Phase 1 (0–150ms): card lifts + brightens
      setPortalPhase('phase1');
      setTimeout(() => {
        // Phase 2 (150–650ms): zoom deep into illustration
        setPortalPhase('phase2');
        setTimeout(() => {
          // Phase 3 (650–900ms): white-out then navigate
          setPortalPhase('phase3');
          setTimeout(() => navigate(`/card/${card.id}`), 250);
        }, 500);
      }, 150);
    }
  }, [navigate, card, portalPhase, isStillUs]);

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

  // Show stable loading screen until progress data is ready (prevents reorder glitch)
  if (progress.loading) {
    return (
      <div style={{ height: '100vh', background: product?.backgroundColor ?? MIDNIGHT_INK }} />
    );
  }

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
        background: product?.backgroundColor ?? MIDNIGHT_INK,
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

      {/* ── Still Us: warm light flood overlay ── */}
      {isStillUs && (portalPhase === 'phase2' || portalPhase === 'phase3') && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 45%, rgba(233, 180, 76, ${portalPhase === 'phase3' ? 0.95 : 0.6}) 0%, rgba(180, 120, 40, ${portalPhase === 'phase3' ? 0.85 : 0.3}) 40%, rgba(26, 8, 6, ${portalPhase === 'phase3' ? 0.9 : 0.1}) 100%)`,
            opacity: portalPhase === 'phase3' ? 1 : 0.85,
            transition: 'opacity 350ms ease-in, background 500ms ease-in',
          }}
        />
      )}

      {/* ── Kids: white-out zoom overlay ── */}
      {!isStillUs && portalPhase === 'phase3' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.95) 0%, rgba(${tileBgRgb}, 0.7) 60%, rgba(${tileBgRgb}, 0.9) 100%)`,
            opacity: 1,
            animation: 'fadeIn 250ms ease-in forwards',
          }}
        />
      )}

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
            color: LANTERN_GLOW,
            opacity: 0.7,
          }}
        >
          {category.title}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            opacity: 0.5,
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

          {/* ── Saffron glow frame — intensifies on open ── */}
          <motion.div
            animate={portalPhase !== 'idle'
              ? { opacity: 1, boxShadow: `0 0 60px rgba(233, 180, 76, 0.7), 0 0 120px rgba(233, 180, 76, 0.3)` }
              : { opacity: [0.6, 1, 0.6] }}
            transition={portalPhase !== 'idle'
              ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '22px',
              boxShadow: `0 0 20px rgba(233, 180, 76, 0.35), 0 0 6px rgba(233, 180, 76, 0.15)`,
              border: 'none',
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
                borderRadius: portalPhase === 'phase2' || portalPhase === 'phase3' ? '0px' : '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                // Obsidian Glass surface
                backgroundColor: 'rgba(15, 15, 15, 0.7)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                zIndex: 1,
                ...(isStillUs ? {
                  // Still Us: gentle lift → hold → fade into light
                  transform:
                    portalPhase === 'phase1' ? 'scale(1.02)' :
                    portalPhase === 'phase2' ? 'scale(1.04)' :
                    portalPhase === 'phase3' ? 'scale(1.04)' : undefined,
                  filter:
                    portalPhase === 'phase1' ? 'brightness(1.15) saturate(1.2)' :
                    portalPhase === 'phase2' ? 'brightness(1.6) saturate(0.8)' :
                    portalPhase === 'phase3' ? 'brightness(2.5) saturate(0.3)' : undefined,
                  opacity: portalPhase === 'phase3' ? 0 : 1,
                  transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), filter 500ms ease-out, opacity 350ms ease-in, border-radius 300ms ease',
                } : {
                  // Kids: lift → zoom deep through → vanish
                  transform:
                    portalPhase === 'phase1' ? 'scale(1.04)' :
                    portalPhase === 'phase2' ? 'scale(2.8)' :
                    portalPhase === 'phase3' ? 'scale(4.0)' : undefined,
                  filter:
                    portalPhase === 'phase1' ? 'brightness(1.12)' :
                    portalPhase === 'phase2' ? 'brightness(1.3)' :
                    portalPhase === 'phase3' ? 'brightness(2.0)' : undefined,
                  opacity: portalPhase === 'phase3' ? 0 : 1,
                  transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 400ms ease-out, opacity 250ms ease-in, border-radius 200ms ease',
                }),
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

              {/* Ceramic rim — obsidian glass bevel */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '20px',
                  boxShadow: [
                    'inset 0 2px 6px rgba(255, 255, 255, 0.35)',
                    'inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                    'inset 0 -4px 12px rgba(0, 0, 0, 0.30)',
                    'inset 0 -1px 2px rgba(0, 0, 0, 0.15)',
                  ].join(', '),
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              />

              {/* Ghost border */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  pointerEvents: 'none',
                  zIndex: 6,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Outer elevation — obsidian glass lift with chromatic glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              boxShadow: [
                '0 20px 60px rgba(0, 0, 0, 0.55)',
                '0 8px 24px rgba(0, 0, 0, 0.40)',
                '0 3px 8px rgba(0, 0, 0, 0.25)',
                `0 14px 56px rgba(${tileBgRgb}, 0.22)`,
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
                color: LANTERN_GLOW,
                opacity: 0.55,
                marginTop: '4px',
              }}
            >
              {promptCount} frågor · {estimateMinutes(promptCount, productSlug)}
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
              Tryck på bilden när ni är redo.
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
                color: LANTERN_GLOW,
                opacity: 0.6,
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
                color: LANTERN_GLOW,
                padding: '4px 16px',
                opacity: 0.45,
              }}
          >
            Utforska alla samtal
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
