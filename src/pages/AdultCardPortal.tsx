/**
 * AdultCardPortal — Vårt Vi (still_us) card portal.
 *
 * Three-zone editorial composition matching AdultProductHome:
 *   1) Atmospheric header — eyebrow (category), serif title, italic subtitle
 *   2) Card preview — large two-zone tile (illustration + title strip),
 *      anchored to the card's distributed color from product home
 *   3) Action — time estimate, completion mark, pill CTA, text prev/next
 *
 * Route: /product/still-us/portal/:categoryId
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { allProducts } from '@/data/products';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import { useProductTheme } from '@/hooks/useProductTheme';
import { useProductAccess } from '@/hooks/useProductAccess';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useDevState } from '@/contexts/DevStateContext';
import { isDemoMode } from '@/lib/demoMode';
import { supabase } from '@/integrations/supabase/client';
import PaywallBottomSheet from '@/components/PaywallBottomSheet';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import {
  LANTERN_GLOW,
  CORNFLOWER,
  DEEP_DUSK_BG,
  MIDNIGHT_INK,
  DUSTY_ROSE,
  STORM_GREY,
  SAGE,
  WARM_GOLD,
  SAFFRON_FLAME,
} from '@/lib/palette';
import { getPortalCopy } from '@/data/stillUsPortalCopy';
import { CARD_SEQUENCE, bareIdFromSlug } from '@/data/stillUsSequence';

/** Map a manifest card id (e.g. 'su-mock-3') to the bare id used by
 *  stillUsPortalCopy (e.g. 'expressing-needs'). */
function resolveBareCardId(cardId: string): string {
  const m = cardId.match(/^su-mock-(\d+)$/);
  if (m) {
    const seq = CARD_SEQUENCE[Number(m[1])];
    if (seq) return bareIdFromSlug(seq.cardId);
  }
  return bareIdFromSlug(cardId);
}

const ADULT_ANCHOR_COLORS = [
  CORNFLOWER, MIDNIGHT_INK, DUSTY_ROSE, WARM_GOLD, STORM_GREY, SAGE,
];

/** Mirror of AdultProductHome distribution to keep the per-card anchor color
 *  consistent between product home tile and portal preview. */
function distributeColors(cardIds: string[], overrides: Record<string, string | undefined>): string[] {
  const result = cardIds.map((id, i) => overrides[id] ?? ADULT_ANCHOR_COLORS[i % ADULT_ANCHOR_COLORS.length]);
  for (let i = 1; i < result.length; i++) {
    if (overrides[cardIds[i]]) continue;
    if (result[i] === result[i - 1]) {
      const start = (ADULT_ANCHOR_COLORS.indexOf(result[i]) + 1) % ADULT_ANCHOR_COLORS.length;
      for (let off = 0; off < ADULT_ANCHOR_COLORS.length; off++) {
        const candidate = ADULT_ANCHOR_COLORS[(start + off) % ADULT_ANCHOR_COLORS.length];
        if (candidate !== result[i - 1]) { result[i] = candidate; break; }
      }
    }
  }
  return result;
}

function PortalCardImage({ cardId, children }: { cardId: string; children: (src: string | null) => React.ReactNode }) {
  const src = useCardImage(cardId);
  return <>{children(src)}</>;
}

export default function AdultCardPortal() {
  const { productSlug, categoryId } = useParams<{ productSlug: string; categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const devState = useDevState();
  const bypassPaywall = devState === 'browse' || isDemoMode();

  const product = allProducts.find(p => p.slug === productSlug);
  const category = product?.categories.find(c => c.id === categoryId);

  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    DEEP_DUSK_BG,
    product?.ctaButtonColor,
    product?.pronounMode,
    product,
    location.key,
  );
  usePageBackground(DEEP_DUSK_BG);

  const progress = useKidsProductProgress(product);
  const [kontoOpen, setKontoOpen] = useState(false);
  const hasRenderedContent = useRef(false);

  const completedSet = useMemo(
    () => new Set([
      ...progress.recentlyCompletedCardIds,
      ...progress.allTimeCompletedCardIds,
    ]),
    [progress.recentlyCompletedCardIds, progress.allTimeCompletedCardIds],
  );

  // Resolve per-card anchor color (matches product home order)
  const allCards = product?.cards ?? [];
  const cardColors = useMemo(() => {
    const overrides: Record<string, string | undefined> = {};
    allCards.forEach(c => { overrides[c.id] = c.cardColor; });
    return distributeColors(allCards.map(c => c.id), overrides);
  }, [allCards]);
  const cardColorById = useMemo(() => {
    const m: Record<string, string> = {};
    allCards.forEach((c, i) => { m[c.id] = cardColors[i]; });
    return m;
  }, [allCards, cardColors]);

  const allCategoryCards = useMemo(
    () => allCards.filter(c => c.categoryId === categoryId),
    [allCards, categoryId],
  );

  const categoryCards = useMemo(() => {
    const uncompleted = allCategoryCards.filter(c => !completedSet.has(c.id));
    const completed = allCategoryCards.filter(c => completedSet.has(c.id));
    return [...uncompleted, ...completed];
  }, [allCategoryCards, completedSet]);

  const targetCardId = searchParams.get('card');
  const initialIndex = useMemo(() => {
    if (!targetCardId) return 0;
    const idx = categoryCards.findIndex(c => c.id === targetCardId);
    return idx >= 0 ? idx : 0;
  }, [categoryCards, targetCardId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  useEffect(() => { setCurrentIndex(initialIndex); }, [initialIndex, categoryId]);

  const card = categoryCards[currentIndex];
  const cardColor = card ? (cardColorById[card.id] ?? CORNFLOWER) : CORNFLOWER;
  const titleZoneBg = `color-mix(in srgb, ${cardColor} 88%, #000000)`;
  const accentLine = `color-mix(in srgb, ${WARM_GOLD} 60%, transparent)`;

  const { hasAccess: productIsPurchased } = useProductAccess(product?.id ?? '');
  const [priceSek, setPriceSek] = useState<number | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    supabase.from('products').select('price_sek').eq('id', product.id).single()
      .then(({ data }) => setPriceSek(data?.price_sek ?? 249));
  }, [product?.id]);

  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= categoryCards.length - 1;
  const isCompleted = !!card && completedSet.has(card.id);

  const goBack = useCallback(() => navigate(`/product/${productSlug}`), [navigate, productSlug]);
  const goPrev = useCallback(() => { if (!isFirst) setCurrentIndex(i => i - 1); }, [isFirst]);
  const goNext = useCallback(() => { if (!isLast) setCurrentIndex(i => i + 1); }, [isLast]);

  const startSession = useCallback(() => {
    if (!card) return;
    if (product && !productIsPurchased && !bypassPaywall) {
      setPaywallOpen(true);
      return;
    }
    navigate(`/card/${card.id}`);
  }, [card, navigate, product, productIsPurchased, bypassPaywall]);

  const ctaLabel = useMemo(() => {
    if (isCompleted) return 'Gör om samtalet';
    return 'Starta samtal';
  }, [isCompleted]);

  if (progress.loading && !hasRenderedContent.current) {
    return <div style={{ height: '100vh', background: DEEP_DUSK_BG }} />;
  }
  if (!product || !category || !card) {
    return (
      <div style={{ minHeight: '100vh', background: DEEP_DUSK_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(253, 246, 227, 0.7)', fontSize: '14px' }}>Samtalet hittades inte</p>
      </div>
    );
  }
  hasRenderedContent.current = true;

  const ctaBg = `color-mix(in srgb, ${cardColor} 30%, rgba(255,255,255,0.06))`;
  const ctaBorder = `1px solid color-mix(in srgb, ${cardColor} 50%, transparent)`;

  return (
    <div data-sensitive style={{
      minHeight: '100vh',
      background: DEEP_DUSK_BG,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Atmospheric cool glow — matches product home */}
      <div style={{
        position: 'absolute',
        top: '-8vh', left: '50%', transform: 'translateX(-50%)',
        width: '160vw', height: '60vh',
        background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${CORNFLOWER}30 0%, #1B2A6B22 45%, transparent 100%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <ProductHomeBackButton color={LANTERN_GLOW} />
      <KontoIcon onClick={() => setKontoOpen(true)} />
      <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />

      {/* ── Scroll region ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 60px), clamp(60px, 11vh, 90px))',
        paddingLeft: '20px', paddingRight: '20px',
        paddingBottom: 'calc(132px + env(safe-area-inset-bottom, 0px))',
      }}>
        {/* ── Zone 1: Header ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: LANTERN_GLOW,
            opacity: 0.65,
            marginBottom: '12px',
          }}>
            {category.title}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 7.5vw, 38px)',
            fontWeight: 700,
            color: LANTERN_GLOW,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            margin: 0,
            textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${cardColor}44`,
            fontVariationSettings: "'opsz' 36",
          }}>
            {card.title}
          </h1>
          {(() => {
            const copy = product?.slug === 'still-us' ? getPortalCopy(card.id) : undefined;
            const subtitleText = copy?.subtitle ?? card.subtitle;
            return subtitleText ? (
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontStyle: 'italic',
                fontWeight: 500,
                color: LANTERN_GLOW,
                opacity: 0.85,
                marginTop: '8px',
                letterSpacing: '0.01em',
                lineHeight: 1.4,
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              }}>
                {subtitleText}
              </p>
            ) : null;
          })()}
        </div>

        {/* ── Preparation paragraph ── */}
        {product?.slug === 'still-us' && (() => {
          const copy = getPortalCopy(card.id);
          return copy?.preparation ? (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 400,
              color: LANTERN_GLOW,
              opacity: 0.72,
              margin: '36px auto',
              lineHeight: 1.55,
              maxWidth: '520px',
              textAlign: 'left',
            }}>
              {copy.preparation}
            </p>
          ) : null;
        })()}

        {/* ── Zone 2: Card preview (purely visual) ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: '12px',
        }}>
          <button
            type="button"
            onClick={startSession}
            aria-label={`${ctaLabel}: ${card.title}`}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: '80%',
              maxWidth: '320px',
              aspectRatio: '3 / 4',
              borderRadius: '22px',
              overflow: 'hidden',
              backgroundColor: cardColor,
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20)',
              padding: 0,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Illustration zone — fills the tile */}
            <div style={{ position: 'relative', flex: '1 1 auto', backgroundColor: cardColor, overflow: 'hidden' }}>
              <PortalCardImage cardId={card.id}>
                {(src) => src ? (
                  <img src={src} alt="" aria-hidden="true" style={{
                    width: '100%', height: '100%', objectFit: 'contain', padding: '8px', display: 'block',
                  }} />
                ) : null}
              </PortalCardImage>

              {isCompleted && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="22" height="22" viewBox="0 0 18 18" fill="none"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                    <path d="M3.5 9.5 L7.5 13.5 L14.5 5.5"
                      stroke={SAFFRON_FLAME} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '8px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Saffron accent line — closing visual element */}
            <div style={{ height: '1px', width: '100%', backgroundColor: accentLine, flexShrink: 0 }} />
          </button>
        </div>

        {/* ── Zone 3: Completion + sequence nav ── */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {isCompleted && (
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '14px',
              color: SAFFRON_FLAME,
            }}>
              ✓ Klart
            </div>
          )}

          {/* Text-only sequence nav */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            width: '100%',
            maxWidth: '420px',
            marginTop: '6px',
          }}>
            <button
              onClick={goPrev}
              disabled={isFirst}
              aria-label="Föregående samtal"
              style={{
                background: 'none', border: 'none', textAlign: 'left',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                letterSpacing: '0.04em',
                color: LANTERN_GLOW,
                opacity: isFirst ? 0.35 : 0.65,
                cursor: isFirst ? 'default' : 'pointer',
                padding: '12px 4px',
                minHeight: '44px',
              }}
            >
              Föregående
            </button>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: LANTERN_GLOW,
              opacity: 0.45,
              padding: '0 12px',
              whiteSpace: 'nowrap',
            }}>
              {currentIndex + 1} av {categoryCards.length}
            </span>
            <button
              onClick={goNext}
              disabled={isLast}
              aria-label="Nästa samtal"
              style={{
                background: 'none', border: 'none', textAlign: 'right',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                letterSpacing: '0.04em',
                color: LANTERN_GLOW,
                opacity: isLast ? 0.35 : 0.65,
                cursor: isLast ? 'default' : 'pointer',
                padding: '12px 4px',
                minHeight: '44px',
              }}
            >
              Nästa
            </button>
          </div>
        </div>
      </div>

      {/* ── Sticky CTA bar ── */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        zIndex: 20,
        padding: `16px 20px calc(16px + env(safe-area-inset-bottom, 0px))`,
        background: `linear-gradient(to top, ${DEEP_DUSK_BG} 0%, color-mix(in srgb, ${DEEP_DUSK_BG} 92%, transparent) 60%, transparent 100%)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <button
          onClick={startSession}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '420px',
            height: '56px',
            borderRadius: '999px',
            backgroundColor: ctaBg,
            border: ctaBorder,
            color: LANTERN_GLOW,
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {ctaLabel}
        </button>
      </div>

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
