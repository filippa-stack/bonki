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

import { usePageBackground } from '@/hooks/usePageBackground';

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
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import KidsTileFrame from '@/components/KidsTileFrame';
import { getCalmInterior } from '@/lib/productTileVariants';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
  productDarkText,
  productAccentColor,
} from '@/lib/palette';

/* ── Helpers ── */

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return `${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)}`;
}

function estimateMinutes(_promptCount: number, productSlug?: string): string {
  switch (productSlug) {
    case 'jag-i-mig':       return 'ca 2–4 min';
    case 'vardagskort':      return 'ca 3–5 min';
    case 'syskonkort':       return 'ca 4–7 min';
    case 'jag-med-andra':    return 'ca 5–8 min';
    case 'jag-i-varlden':    return 'ca 8–15 min';
    case 'sexualitetskort':  return 'ca 10–20 min';
    case 'still-us':         return 'ca 10–20 min';
    default:                 return 'ca 5–10 min';
  }
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
  const location = useLocation();
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
  // forceKey ensures CSS vars are reapplied when navigating back from a session
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    product?.backgroundColor,
    product?.ctaButtonColor,
    product?.pronounMode,
    product,
    location.key,
  );

  usePageBackground(product?.backgroundColor ?? MIDNIGHT_INK);
  const progress = useKidsProductProgress(product);
  const hasRenderedContent = useRef(false);

  useEffect(() => {
    hasRenderedContent.current = false;
  }, [categoryId]);
  const completedSet = useMemo(
    () => new Set(progress.recentlyCompletedCardIds),
    [progress.recentlyCompletedCardIds],
  );
  const allTimeSet = useMemo(
    () => new Set(progress.allTimeCompletedCardIds),
    [progress.allTimeCompletedCardIds],
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const card = categoryCards[currentIndex];

  // Smart cache detection — skip fade if image already cached
  useEffect(() => {
    if (!card?.id) return;
    const testImg = new Image();
    testImg.src = `/card-images/${card.id}.webp`;
    if (testImg.complete) {
      setImageLoaded(true);
    } else {
      setImageLoaded(false);
    }
  }, [card?.id]);

  // Preload adjacent card images for flicker-free swiping
  useEffect(() => {
    const preload = (id: string | undefined) => {
      if (!id) return;
      const img = new Image();
      img.src = `/card-images/${id}.webp`;
    };
    const prevCard = categoryCards[currentIndex - 1];
    const nextCard = categoryCards[currentIndex + 1];
    if (prevCard) preload(prevCard.id);
    if (nextCard) preload(nextCard.id);
  }, [currentIndex, categoryCards]);

  // Portal-open animation state
  const [portalPhase, setPortalPhase] = useState<'idle' | 'phase1' | 'phase2' | 'phase3'>('idle');
  const navigating = useRef(false);

  const isStillUs = productSlug === 'still-us';
  const [kontoOpen, setKontoOpen] = useState(false);

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
      .then(({ data }) => setPriceSek(data?.price_sek ?? 199));
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
    if (product && !productIsPurchased && !bypassPaywall) {
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

  const fromBrowse = useRef(false);

  const goToIndex = useCallback((index: number) => {
    fromBrowse.current = true;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  useEffect(() => { fromBrowse.current = false; }, [card?.id]);

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
  if (progress.loading && !hasRenderedContent.current) {
    return (
      <div style={{ height: '100vh', background: product?.backgroundColor ?? MIDNIGHT_INK }} />
    );
  }

  if (!product || !category || !card) {
    return (
      <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(253, 246, 227, 0.7)', fontSize: '14px' }}>Produkten hittades inte</p>
      </div>
    );
  }

  hasRenderedContent.current = true;

  const isFreeCard = false;

  return (
    <div data-sensitive
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

      {(() => {
        const accent = productAccentColor[product.id] ?? tileLight;
        const darkText = productDarkText[product.id] ?? MIDNIGHT_INK;
        const calmInterior = getCalmInterior(product.id, tileLight);
        const completed = allTimeSet.has(card.id);
        const active = activeSet.has(card.id);
        const isLocked = !productIsPurchased && !bypassPaywall;
        const ctaLabel = isLocked
          ? `Lås upp alla ${product.cards.length} samtal`
          : completed
          ? 'Gör om samtalet'
          : active
          ? 'Fortsätt samtal'
          : 'Starta samtal';
        const ctaBg = isLocked
          ? 'rgba(255,255,255,0.04)'
          : `color-mix(in srgb, ${accent} 40%, rgba(255,255,255,0.06))`;
        const ctaBorder = isLocked
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid color-mix(in srgb, ${accent} 60%, transparent)`;
        const timeStr = estimateMinutes(promptCount, productSlug)
          .replace(/^ca\s+/, 'CA ')
          .replace(/min$/, 'MIN')
          .toUpperCase();

        return (
          <>
            {/* ═══ Top Bar ═══ */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `calc(env(safe-area-inset-top, 0px) + 16px) 18px 8px`,
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
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: LANTERN_GLOW,
                  opacity: 0.65,
                  padding: '11px',
                  margin: '-11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '44px',
                  minHeight: '44px',
                }}
              >
                <ChevronLeft size={22} strokeWidth={1.5} />
              </button>
              <KontoIcon onClick={() => setKontoOpen(true)} />
            </div>

            {/* ═══ Scrollable editorial body ═══ */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingBottom: 8,
                opacity: portalPhase !== 'idle' ? 0 : 1,
                transition: 'opacity 200ms ease-in',
              }}
            >
              {/* Eyebrow — category */}
              <div
                style={{
                  fontFamily: 'var(--font-body, var(--font-sans))',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: LANTERN_GLOW,
                  opacity: 0.55,
                  textAlign: 'center',
                  padding: '8px 24px 8px',
                }}
              >
                {category.title}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-serif, var(--font-display))',
                  fontSize: 28,
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color: LANTERN_GLOW,
                  margin: 0,
                  textAlign: 'center',
                  padding: '0 24px 6px',
                }}
              >
                {card.title}
              </h1>

              {/* Italic serif subtitle */}
              {card.subtitle && (
                <p
                  style={{
                    fontFamily: 'var(--font-serif, var(--font-display))',
                    fontStyle: 'italic',
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: LANTERN_GLOW,
                    opacity: 0.85,
                    margin: 0,
                    textAlign: 'center',
                    padding: '0 24px 18px',
                  }}
                >
                  {card.subtitle}
                </p>
              )}

              {/* Framing paragraph */}
              {card.description && (
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    fontWeight: 400,
                    lineHeight: 1.55,
                    color: LANTERN_GLOW,
                    opacity: 0.85,
                    maxWidth: 320,
                    margin: '0 auto',
                    textAlign: 'center',
                    padding: '0 36px 22px',
                  }}
                >
                  {card.description}
                </p>
              )}

              {/* Card preview tile */}
              <div
                style={{
                  width: 'min(75vw, 320px)',
                  padding: '4px 0 14px',
                }}
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={card.id}
                    custom={direction}
                    variants={slideVariants}
                    initial={fromBrowse.current ? 'center' : 'enter'}
                    animate="center"
                    exit={fromBrowse.current ? 'center' : 'exit'}
                    transition={{ duration: fromBrowse.current ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                    drag={portalPhase === 'idle' ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={handleDragEnd}
                    onClick={startSession}
                    style={{
                      cursor: 'pointer',
                      transform:
                        portalPhase === 'phase1' ? 'scale(1.04)' :
                        portalPhase === 'phase2' ? 'scale(2.4)' :
                        portalPhase === 'phase3' ? 'scale(3.6)' : undefined,
                      filter:
                        portalPhase === 'phase1' ? 'brightness(1.12)' :
                        portalPhase === 'phase2' ? 'brightness(1.3)' :
                        portalPhase === 'phase3' ? 'brightness(2.0)' : undefined,
                      opacity: portalPhase === 'phase3' ? 0 : 1,
                      transition: portalPhase !== 'idle'
                        ? 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 400ms ease-out, opacity 250ms ease-in'
                        : undefined,
                    }}
                  >
                    <KidsTileFrame
                      frame={tileLight}
                      interior={calmInterior}
                      darkText={darkText}
                      title={card.title}
                      stripFraction={0.20}
                      completed={completed}
                    >
                      <PortalCardImage cardId={card.id}>
                        {(imageSrc) => imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={card.title}
                            decoding="sync"
                            onLoad={() => setImageLoaded(true)}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              opacity: imageLoaded ? 1 : 0,
                              transition: 'opacity 300ms ease-in',
                            }}
                          />
                        ) : null}
                      </PortalCardImage>
                    </KidsTileFrame>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Time estimate */}
              {timeStr && (
                <div
                  style={{
                    fontFamily: 'var(--font-body, var(--font-sans))',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: LANTERN_GLOW,
                    opacity: 0.65,
                    textAlign: 'center',
                    padding: '4px 24px 6px',
                  }}
                >
                  {timeStr}
                </div>
              )}

              {/* Completion indicator */}
              {completed && (
                <div
                  style={{
                    fontFamily: 'var(--font-serif, var(--font-display))',
                    fontStyle: 'italic',
                    fontSize: 13,
                    fontWeight: 400,
                    color: SAFFRON_FLAME,
                    textAlign: 'center',
                    padding: '0 24px 10px',
                  }}
                >
                  ✓ Klart
                </div>
              )}
            </div>

            {/* ═══ Sticky bottom CTA + sequence nav ═══ */}
            <div
              style={{
                flexShrink: 0,
                padding: `0 24px calc(env(safe-area-inset-bottom, 0px) + 72px)`,
                opacity: portalPhase !== 'idle' ? 0 : 1,
                transition: 'opacity 200ms ease-in',
                position: 'relative',
                zIndex: 5,
              }}
            >
              <button
                onClick={startSession}
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 420,
                  margin: '0 auto',
                  height: 56,
                  borderRadius: 28,
                  border: ctaBorder,
                  background: ctaBg,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: LANTERN_GLOW,
                  letterSpacing: '0.01em',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {ctaLabel}
              </button>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 420,
                  margin: '4px auto 0',
                }}
              >
                <button
                  onClick={goPrev}
                  disabled={isFirst}
                  aria-label="Föregående samtal"
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontFamily: 'var(--font-display)',
                    fontSize: 13,
                    fontWeight: 400,
                    color: LANTERN_GLOW,
                    opacity: isFirst ? 0.35 : 0.65,
                    cursor: isFirst ? 'default' : 'pointer',
                    padding: '12px 4px',
                    minHeight: 44,
                  }}
                >
                  ‹ Föregående
                </button>
                <span
                  style={{
                    fontFamily: 'var(--font-body, var(--font-sans))',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: LANTERN_GLOW,
                    opacity: 0.45,
                    padding: '0 12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentIndex + 1} AV {categoryCards.length}
                </span>
                <button
                  onClick={goNext}
                  disabled={isLast}
                  aria-label="Nästa samtal"
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'right',
                    fontFamily: 'var(--font-display)',
                    fontSize: 13,
                    fontWeight: 400,
                    color: LANTERN_GLOW,
                    opacity: isLast ? 0.35 : 0.65,
                    cursor: isLast ? 'default' : 'pointer',
                    padding: '12px 4px',
                    minHeight: 44,
                  }}
                >
                  Nästa ›
                </button>
              </div>
            </div>

            <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />
          </>
        );
      })()}

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
