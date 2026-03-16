import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categories as stillUsCategories } from '@/data/content';
import { motion } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { allProducts } from '@/data/products';
import { useProductTheme } from '@/hooks/useProductTheme';
import { useCardImage } from '@/hooks/useCardImage';
import { useVerdigrisTheme } from '@/components/VerdigrisAtmosphere';
import { useProductAccess } from '@/hooks/useProductAccess';
import { CIRCADIAN_COLORS, CIRCADIAN_COLORS_LIGHT, CIRCADIAN_FILLS, CIRCADIAN_FILLS_HOVER } from '@/components/CircadianMenu';
import Header from '@/components/Header';
import CardStatusBadge from '@/components/CardStatusBadge';
import { KIDS_PRODUCT_IDS } from '@/hooks/useKidsProductProgress';

import mirrorJagIMig from '@/assets/mirror-jag-i-mig.png';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';
import { STILL_US_CREATURES } from '@/lib/stillUsCreatures';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Per-card focal point for object-position when using cover */
const CARD_FOCAL_POINT: Record<string, string> = {
  'jim-besviken': 'center 75%', 'jim-acklad': 'center 35%',
  'jim-avsky': 'center 25%', 'jim-skam': 'center 35%',
  'jim-avundsjuk': 'center 30%', 'jim-svartsjuk': 'center 40%',
  'jim-utanfor': 'center 40%', 'jim-arg': 'center 30%',
  'jim-vild': 'center 30%', 'jim-stolt': 'center 35%',
  'jim-bestamd': 'center 35%', 'jim-karlek': 'center 35%',
  'jim-nyfiken': 'center 30%', 'jim-forvanad': 'center 30%',
  'jim-jag': 'center 35%', 'jim-trygg': 'center 35%',
  'jim-ensam': 'center 35%', 'jim-glad': 'center 30%',
  'jim-radd': 'center 30%', 'jim-ledsen': 'center 35%',
  'jim-stress': 'center 30%',
  'sk-vanskap': 'center 20%',
};

const CARD_IMAGE_OVERRIDE: Record<string, string> = {
  'jim-jag': mirrorJagIMig,
};

/** Midnight Ink — universal dark background */
const MIDNIGHT_INK = '#1A1A2E';
/** Lantern Glow — light text on dark backgrounds */
const LANTERN_GLOW = '#FDF6E3';
/** Driftwood — secondary text */
const DRIFTWOOD = '#6B5E52';
/** Saffron Flame — accent for next/completed */
const SAFFRON = '#E9B44C';

/** Product tile background colors for the new card design */
const PRODUCT_TILE_COLOR: Record<string, string> = {
  jag_i_mig: '#657514',
  jag_med_andra: '#8B2FC6',
  jag_i_varlden: '#2D6E3A',
  vardagskort: '#0E6B99',
  syskonkort: '#247A78',
  sexualitetskort: '#A3434B',
};

export default function Category() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCategoryById, getCardsByCategory } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { optimisticCardIds } = useOptimisticCompletions();

  const [serverCompletedCardIds, setServerCompletedCardIds] = useState<string[]>([]);
  const [serverCompletedWithDates, setServerCompletedWithDates] = useState<{ card_id: string; ended_at: string }[]>([]);
  const [inProgressCardIds, setInProgressCardIds] = useState<string[]>([]);

  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;

    supabase
      .from('couple_sessions')
      .select('card_id, ended_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (!cancelled && data) {
          setServerCompletedCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
          setServerCompletedWithDates(
            data
              .filter(s => s.card_id && s.ended_at)
              .map(s => ({ card_id: s.card_id!, ended_at: s.ended_at! }))
          );
        }
      });

    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'active')
      .then(({ data }) => {
        if (!cancelled && data) {
          setInProgressCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });

    return () => { cancelled = true; };
  }, [space?.id]);

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  const product = useMemo(() => {
    if (!categoryId) return undefined;
    return allProducts.find(p => p.categories.some(c => c.id === categoryId));
  }, [categoryId]);

  const isKidsProduct = !!product && KIDS_PRODUCT_IDS.includes(product.id);

  const isStillUsCategory = useMemo(() => {
    return !!categoryId && stillUsCategories.some(c => c.id === categoryId);
  }, [categoryId]);

  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  const completedCardIds = useMemo(() => {
    if (isKidsProduct) {
      const now = Date.now();
      const seen = new Set<string>();
      const result: string[] = [];
      const sorted = [...serverCompletedWithDates].sort(
        (a, b) => new Date(b.ended_at).getTime() - new Date(a.ended_at).getTime()
      );
      for (const s of sorted) {
        if (seen.has(s.card_id)) continue;
        seen.add(s.card_id);
        const elapsed = now - new Date(s.ended_at).getTime();
        if (elapsed < FOURTEEN_DAYS_MS) {
          result.push(s.card_id);
        }
      }
      optimisticCardIds.forEach(id => {
        if (!result.includes(id)) result.push(id);
      });
      return result;
    }
    const merged = new Set(serverCompletedCardIds);
    optimisticCardIds.forEach(id => merged.add(id));
    return Array.from(merged);
  }, [isKidsProduct, serverCompletedCardIds, serverCompletedWithDates, optimisticCardIds]);

  const backTo = product ? `/product/${product.slug}` : isStillUsCategory ? '/?devState=solo' : '/';

  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    isStillUsCategory ? undefined : '#FAF7F2',
    product?.ctaButtonColor,
    product?.pronounMode,
    product,
  );

  useVerdigrisTheme(isStillUsCategory);

  const circadianColor = categoryId ? CIRCADIAN_COLORS[categoryId] : undefined;

  if (!category) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isStillUsCategory ? 'var(--surface-base)' : MIDNIGHT_INK }}>
        <div className="h-14 border-b border-border" style={{ backgroundColor: 'var(--surface-raised)' }} />
        <div className="px-5 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm" style={{ color: DRIFTWOOD }}>{t('category.not_found')}</p>
        </div>
      </div>
    );
  }

  const allCompleted = cards.length > 0 && cards.every(c => completedCardIds.includes(c.id));

  // ── Still Us: Verdigris-themed category view ──
  if (isStillUsCategory) {
    return (
      <StillUsCategoryView
        category={category}
        cards={cards}
        completedCardIds={completedCardIds}
        inProgressCardIds={inProgressCardIds}
        allCompleted={allCompleted}
        circadianColor={circadianColor}
        backTo={backTo}
        navigate={navigate}
        isReturningUser={completedCardIds.length >= 1}
      />
    );
  }

  // ── Kids product: new snap-scroll card list ──
  if (isKidsProduct && product) {
    return (
      <KidsProductCategoryView
        category={category}
        cards={cards}
        completedCardIds={completedCardIds}
        allCompleted={allCompleted}
        product={product}
        backTo={backTo}
        navigate={navigate}
      />
    );
  }

  // ── Fallback product category view ──
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FAF7F2' }}>
      <Header title={category?.title} showBack backTo={backTo} />
      <div className="px-5 pt-4 pb-24 flex flex-col relative z-[1]">
        {cards.map((card, index) => (
          <div key={card.id} style={{ marginBottom: index === cards.length - 1 ? 0 : '16px' }}>
            <button
              onClick={() => navigate(`/card/${card.id}`)}
              className="w-full text-left rounded-xl p-5"
              style={{ backgroundColor: 'var(--tile-bg)' }}
            >
              <h3 className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Kids Product — Snap-scroll category card list
   Midnight Ink bg, product-colored tiles, saffron glow,
   completion circles, illustration-forward design.
   ═══════════════════════════════════════════════════════════ */

interface KidsProductCategoryViewProps {
  category: { id: string; title: string; entryLine?: string; subtitle?: string };
  cards: { id: string; title: string; subtitle?: string }[];
  completedCardIds: string[];
  allCompleted: boolean;
  product: { id: string; slug: string; freeCardId?: string };
  backTo: string;
  navigate: (path: string) => void;
}

function KidsProductCategoryView({
  category,
  cards,
  completedCardIds,
  allCompleted,
  product,
  backTo,
  navigate,
}: KidsProductCategoryViewProps) {
  const { hasAccess, loading: accessLoading } = useProductAccess(product.id);
  const completedCount = cards.filter(c => completedCardIds.includes(c.id)).length;
  const tileColor = PRODUCT_TILE_COLOR[product.id] ?? '#657514';

  const handleCardTap = (cardId: string) => {
    // Always navigate to card — CardView handles paywall for locked cards
    navigate(`/card/${cardId}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: MIDNIGHT_INK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
          flexShrink: 0,
        }}
      >
        {/* Back arrow */}
        <button
          onClick={() => navigate(backTo)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: LANTERN_GLOW,
            padding: '4px',
            marginBottom: '12px',
          }}
          aria-label="Tillbaka"
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>

        {/* Category name */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'opsz' 20",
            fontSize: '20px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {category.title}
        </h1>

        {/* Progress line */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            color: DRIFTWOOD,
            textAlign: 'center',
            marginTop: '4px',
          }}
        >
          {completedCount} av {cards.length} kort utforskade
        </p>
      </motion.div>

      {/* Snap-scroll card list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cards.map((card, index) => {
            const isCompleted = completedCardIds.includes(card.id);
            const isNextSuggested = !isCompleted && !allCompleted && cards.slice(0, index).every(c => completedCardIds.includes(c.id));

            return (
              <KidsCardTile
                key={card.id}
                card={card}
                index={index}
                isCompleted={isCompleted}
                isNextSuggested={isNextSuggested}
                tileColor={tileColor}
                onTap={() => handleCardTap(card.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Kids Card Tile ─── */

interface KidsCardTileProps {
  card: { id: string; title: string; subtitle?: string };
  index: number;
  isCompleted: boolean;
  isNextSuggested: boolean;
  tileColor: string;
  onTap: () => void;
}

function KidsCardTile({ card, index, isCompleted, isNextSuggested, tileColor, onTap }: KidsCardTileProps) {
  const zipIllustration = useCardImage(card.id);
  const illustration = CARD_IMAGE_OVERRIDE[card.id] ?? zipIllustration;
  const focalPoint = CARD_FOCAL_POINT[card.id] ?? 'center 35%';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE }}
      style={{ scrollSnapAlign: 'center' }}
    >
      <button
        onClick={onTap}
        style={{
          position: 'relative',
          width: '100%',
          height: '75vh',
          maxHeight: '640px',
          minHeight: '420px',
          borderRadius: '22px',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'block',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
          backgroundColor: tileColor,
          border: isNextSuggested
            ? `2.5px solid ${SAFFRON}CC`
            : '1.5px solid rgba(255, 255, 255, 0.30)',
          boxShadow: [
            isNextSuggested ? `0 0 18px 0px ${SAFFRON}50, 0 0 36px -4px ${SAFFRON}30` : '',
            '0 12px 32px rgba(0, 0, 0, 0.30)',
            '0 4px 12px rgba(0, 0, 0, 0.18)',
            '0 1px 3px rgba(0, 0, 0, 0.08)',
            'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
            'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
          ].filter(Boolean).join(', '),
          padding: 0,
          textAlign: 'left',
        }}
      >
        {/* Full-bleed illustration */}
        {illustration && (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: focalPoint,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Completion indicator — 28px saffron circle with checkmark */}
        {isCompleted && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 3,
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: SAFFRON,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} strokeWidth={2} color={MIDNIGHT_INK} />
          </div>
        )}

        {/* Bottom scrim for title legibility */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
            borderRadius: '0 0 22px 22px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Card title */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            zIndex: 2,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'opsz' 28",
              fontSize: '28px',
              fontWeight: 700,
              color: LANTERN_GLOW,
              lineHeight: 1.15,
              margin: 0,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
              letterSpacing: '-0.01em',
            }}
          >
            {card.title}
          </h3>
        </div>
      </button>
    </motion.div>
  );
}


/* ═══════════════════════════════════════════════════════════
   Still Us — Ember-themed Category Detail View
   BG: Ember Night, cards: Ember Mid, text: Lantern Glow / Driftwood
   ═══════════════════════════════════════════════════════════ */

const EMBER_NIGHT = '#2E2233';
const EMBER_MID = '#473454';
const DEEP_SAFFRON = '#D4A03A';

interface StillUsCategoryViewProps {
  category: { id: string; title: string; entryLine?: string; subtitle?: string };
  cards: { id: string; title: string; subtitle?: string }[];
  completedCardIds: string[];
  inProgressCardIds: string[];
  allCompleted: boolean;
  circadianColor?: string;
  backTo: string;
  navigate: (path: string) => void;
  isReturningUser?: boolean;
}

function StillUsCategoryView({
  category,
  cards,
  completedCardIds,
  inProgressCardIds,
  allCompleted,
  backTo,
  navigate,
  isReturningUser = false,
}: StillUsCategoryViewProps) {
  const completedCount = cards.filter(c => completedCardIds.includes(c.id)).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: EMBER_NIGHT }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Back arrow */}
        <button
          onClick={() => navigate(backTo)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: LANTERN_GLOW,
            padding: '4px',
            marginBottom: '12px',
          }}
          aria-label="Tillbaka"
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>

        {/* Category name */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'opsz' 24",
            fontSize: '22px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {category.title}
        </h1>

        {/* Subtitle */}
        {category.entryLine && (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              color: DRIFTWOOD,
              textAlign: 'center',
              marginTop: '6px',
              lineHeight: 1.4,
            }}
          >
            {category.entryLine}
          </p>
        )}

        {/* Progress */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            color: DRIFTWOOD,
            textAlign: 'center',
            marginTop: '6px',
          }}
        >
          {completedCount} av {cards.length} samtal utforskade
        </p>
      </motion.div>

      {/* Card list */}
      <div
        style={{
          padding: '8px 16px',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {cards.map((card, index) => {
          const isCompleted = completedCardIds.includes(card.id);
          const isInProgress = !isCompleted && inProgressCardIds.includes(card.id);
          const isNextSuggested = !isCompleted && !allCompleted && cards.slice(0, index).every(c => completedCardIds.includes(c.id));

          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.5, ease: EASE }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isReturningUser ? `/card/${card.id}` : `/preview/${card.id}`)}
              style={{
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                minHeight: '120px',
                background: EMBER_MID,
                borderRadius: '16px',
                padding: '20px 24px',
                textAlign: 'left',
                cursor: 'pointer',
                border: isNextSuggested && !allCompleted
                  ? `1.5px solid ${DEEP_SAFFRON}`
                  : '1.5px solid rgba(255, 255, 255, 0.30)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: [
                  '0 12px 32px rgba(0, 0, 0, 0.30)',
                  '0 4px 12px rgba(0, 0, 0, 0.18)',
                  '0 1px 3px rgba(0, 0, 0, 0.08)',
                  'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
                  'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
                ].join(', '),
              }}
            >
              {/* Creature illustration — subtle texture for card tiles */}
              {STILL_US_CREATURES[category.id] && (() => {
                const c = STILL_US_CREATURES[category.id];
                return (
                  <img
                    src={c.src}
                    alt=""
                    style={{
                      position: 'absolute',
                      right: '-15%',
                      top: c.tileTop ?? '50%',
                      transform: `translateY(-50%) scale(${c.tileScale ?? 1})`,
                      height: '160%',
                      width: 'auto',
                      objectFit: 'contain',
                      objectPosition: c.objectPosition,
                      opacity: 0.18,
                      pointerEvents: 'none',
                      filter: 'saturate(0.15) brightness(1.2)',
                    }}
                  />
                );
              })()}

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'opsz' 20",
                    fontSize: '20px',
                    fontWeight: 400,
                    color: LANTERN_GLOW,
                    lineHeight: 1.25,
                    display: 'block',
                  }}
                >
                  {card.title}
                </span>
                {card.subtitle && (
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: DRIFTWOOD,
                      lineHeight: 1.4,
                      display: 'block',
                      marginTop: '5px',
                    }}
                  >
                    {card.subtitle}
                  </span>
                )}
              </div>

              {/* Status indicators */}
              <div style={{ flexShrink: 0 }}>
                {isCompleted && (
                  <Check
                    size={24}
                    strokeWidth={2}
                    style={{ color: SAFFRON }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Permission line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ textAlign: 'center', padding: '0 24px 32px' }}
      >
        <p
          className="font-serif"
          style={{
            fontSize: '14px',
            fontStyle: 'italic',
            color: DRIFTWOOD,
            opacity: 0.7,
          }}
        >
          {allCompleted
            ? 'Ni har utforskat alla samtal här.'
            : 'Välj det som känns rätt just nu.'}
        </p>
      </motion.div>
    </div>
  );
}
