/**
 * KidsCardPortal — Full-bleed illustrated card portal.
 *
 * Replaces the Category Page + session start screen for kids products.
 * Shows the next recommended card in the selected category as an
 * interactive "door" the child taps to enter conversation.
 *
 * Route: /product/:productSlug/portal/:categoryId
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import FreeCardBadge from '@/components/FreeCardBadge';
import PaywallBottomSheet from '@/components/PaywallBottomSheet';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useDevState } from '@/contexts/DevStateContext';
import { isDemoMode } from '@/lib/demoMode';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { allProducts } from '@/data/products';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import { useProductTheme } from '@/hooks/useProductTheme';
import { useProductAccess } from '@/hooks/useProductAccess';
import { supabase } from '@/integrations/supabase/client';
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
  const [searchParams] = useSearchParams();
  const devState = useDevState();
  const bypassPaywall = devState === 'browse' || isDemoMode();

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
  const activeSet = useMemo(
    () => new Set(progress.activeCardIds),
    [progress.activeCardIds],
  );

  // Reorder: uncompleted cards first (in original sequence), completed cards to back
  const categoryCards = useMemo(() => {
    const uncompleted = allCategoryCards.filter(c => !completedSet.has(c.id));
    const completed = allCategoryCards.filter(c => completedSet.has(c.id));
    return [...uncompleted, ...completed];
  }, [allCategoryCards, completedSet]);

  const targetCardId = searchParams.get('card');
  const initialCardIndex = useMemo(() => {
    if (!targetCardId) return 0;
    const targetIndex = categoryCards.findIndex((candidate) => candidate.id === targetCardId);
    return targetIndex >= 0 ? targetIndex : 0;
  }, [categoryCards, targetCardId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    setCurrentIndex(initialCardIndex);
  }, [initialCardIndex, targetCardId, categoryId]);

  const [direction, setDirection] = useState<1 | -1>(1);
  const [browseOpen, setBrowseOpen] = useState(false);
  const card = categoryCards[currentIndex];

  // Portal-open animation state
  const [portalPhase, setPortalPhase] = useState<'idle' | 'phase1' | 'phase2' | 'phase3'>('idle');
  const navigating = useRef(false);

  const isStillUs = productSlug === 'still-us';

  const { hasAccess: productIsPurchased } = useProductAccess(product?.id ?? '');
  const [priceSek, setPriceSek] = useState<number | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Fetch price for paywall
  useEffect(() => {
    if (!product?.id) return;
    supabase
      .from('products')
      .select('price_sek')
      .eq('id', product.id)
      .single()
      .then(({ data }) => setPriceSek(data?.price_sek ?? 195));
  }, [product?.id]);

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

    // Paywall intercept: non-free card + not purchased (skip in browse/demo mode)
    if (product && card.id !== product.freeCardId && !productIsPurchased && !bypassPaywall) {
      setPaywallOpen(true);
      return;
    }

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
  }, [navigate, card, portalPhase, isStillUs, product, productIsPurchased]);

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

  // Tile background colors from product
  const tileLight = product?.tileLight ?? MIDNIGHT_INK;
  const tileDark = product?.backgroundColor ?? MIDNIGHT_INK;
  const tileBgRgb = hexToRgb(tileLight);

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
      {/* Background — product color already fills viewport */}

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
        <div style={{ width: '28px' }} />
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
        <div style={{ flex: 1, position: 'relative', minHeight: 0, maxHeight: 'calc(100vh - 340px)' }}>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={card.id}
              custom={direction}
              variants={slideVariants}
              initial={false}
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={portalPhase === 'idle' ? { scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' } : undefined}
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
                backgroundColor: tileDark,
                padding: '10px 10px 16px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1,
                ...(isStillUs ? {
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
              {/* Inner illustration frame */}
              <div
                style={{
                  flex: 1,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: tileLight,
                  minHeight: 0,
                }}
              >
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
                        opacity: 1,
                        zIndex: 1,
                      }}
                    />
                  ) : null}
                </PortalCardImage>

                {/* Completion / in-progress indicator */}
                {completedSet.has(card.id) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: tileDark,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 7,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Check size={12} strokeWidth={2.5} color={LANTERN_GLOW} />
                  </div>
                )}
                {/* GRATIS badge for free card */}
                {product?.freeCardId === card.id && !completedSet.has(card.id) && (
                  <FreeCardBadge />
                )}
                {!completedSet.has(card.id) && activeSet.has(card.id) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: tileDark,
                      zIndex: 7,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }}
                  />
                )}
              </div>

              {/* Title below inner frame */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: LANTERN_GLOW,
                    textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                    margin: 0,
                  }}
                >
                  {card.title}
                </h2>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═══ Compact info below tile ═══ */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`text-${card.id}`}
            custom={direction}
            initial={false}
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
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: LANTERN_GLOW,
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
                fontSize: '15px',
                fontWeight: 600,
                color: LANTERN_GLOW,
                opacity: 0.85,
                marginTop: '5px',
              }}
            >
              {promptCount} frågor · {estimateMinutes(promptCount, productSlug)}
            </p>
            {/* ── Start session button ── */}
            <button
              onClick={startSession}
              style={{
                display: 'inline-block',
                marginTop: '14px',
                padding: '10px 32px',
                borderRadius: '24px',
                border: 'none',
                background: SAFFRON_FLAME,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 600,
                color: '#1a1a1a',
                letterSpacing: '0.3px',
                boxShadow: `0 4px 16px ${SAFFRON_FLAME}55`,
              }}
            >
              Starta samtal
            </button>
          </motion.div>
        </AnimatePresence>

        {/* ═══ Navigation controls ═══ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 72px)`,
            flexShrink: 0,
            opacity: portalPhase !== 'idle' ? 0 : 1,
            transition: 'opacity 200ms ease-in',
          }}
        >
          {/* Prev / Next arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={goPrev}
              disabled={isFirst}
              aria-label="Föregående samtal"
              style={{
                background: isFirst ? 'none' : `${LANTERN_GLOW}15`,
                border: 'none',
                borderRadius: '50%',
                cursor: isFirst ? 'default' : 'pointer',
                color: LANTERN_GLOW,
                opacity: isFirst ? 0.2 : 0.8,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 200ms, background 200ms',
              }}
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                color: LANTERN_GLOW,
                opacity: 0.6,
                minWidth: '48px',
                textAlign: 'center',
              }}
            >
              Samtal {currentIndex + 1} av {categoryCards.length}
            </span>
            <button
              onClick={goNext}
              disabled={isLast}
              aria-label="Nästa samtal"
              style={{
                background: isLast ? 'none' : `${LANTERN_GLOW}15`,
                border: 'none',
                borderRadius: '50%',
                cursor: isLast ? 'default' : 'pointer',
                color: LANTERN_GLOW,
                opacity: isLast ? 0.2 : 0.8,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 200ms, background 200ms',
              }}
            >
              <ChevronRight size={22} strokeWidth={2} />
            </button>
          </div>

          {/* Browse all */}
          <button
            onClick={() => setBrowseOpen(true)}
            style={{
              background: `${LANTERN_GLOW}18`,
              border: `1px solid ${LANTERN_GLOW}35`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: LANTERN_GLOW,
              padding: '8px 22px',
              opacity: 0.85,
            }}
          >
            Utforska alla samtal ↓
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
        activeCardIds={activeSet}
        tileLight={tileLight}
        onSelectCard={goToIndex}
      />

      {/* ═══ Paywall Bottom Sheet ═══ */}
      {product && card && (
        <PaywallBottomSheet
          open={paywallOpen}
          onDismiss={() => setPaywallOpen(false)}
          product={product}
          tappedCardName={card.title}
          tappedCardId={card.id}
          priceSek={priceSek}
          freeCardCompleted={product.freeCardId ? completedSet.has(product.freeCardId) : true}
          onNavigateToFreeCard={product.freeCardId ? () => {
            const freeCard = product.cards.find(c => c.id === product.freeCardId);
            const catId = freeCard?.categoryId;
            if (catId) {
              navigate(`/product/${product.slug}/portal/${catId}?card=${product.freeCardId}`);
            } else {
              navigate(`/card/${product.freeCardId}`);
            }
          } : undefined}
        />
      )}
    </div>
  );
}
