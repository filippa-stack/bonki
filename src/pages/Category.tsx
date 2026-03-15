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
    const isFreeCard = cardId === product.freeCardId;
    if (isFreeCard || hasAccess) {
      navigate(`/card/${cardId}`);
    } else {
      navigate(`/product/${product.slug}/purchase`);
    }
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
            fontFamily: "'DM Serif Display', var(--font-serif)",
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
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'block',
          background: tileColor,
          border: isNextSuggested ? `2px solid ${SAFFRON}` : 'none',
          boxShadow: isNextSuggested
            ? `0 0 12px rgba(233, 180, 76, 0.3)`
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
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
            borderRadius: '0 0 16px 16px',
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
              fontFamily: "'DM Serif Display', var(--font-serif)",
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
   Still Us — Verdigris-themed Category View
   ═══════════════════════════════════════════════════════════ */

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
  circadianColor,
  backTo,
  navigate,
  isReturningUser = false,
}: StillUsCategoryViewProps) {
  const color = circadianColor || '#A2B5A9';
  const colorLight = CIRCADIAN_COLORS_LIGHT[category.id] || color;
  const HERITAGE_GOLD = '#DA9D1D';
  const STILL_US_SAFFRON = '#DA9D1D';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      {/* Background illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute', top: '-8%', left: '-25%',
          width: '150%', height: '110%',
          zIndex: 0, pointerEvents: 'none',
        }}
      >
        <img
          src={stillUsIllustration}
          alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center top', opacity: 0.30,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 78%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 78%)',
          }}
        />
      </motion.div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        onClick={() => navigate(backTo)}
        style={{
          position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', left: '16px',
          zIndex: 10, background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', opacity: 0.6,
          padding: '8px',
        }}
        aria-label="Tillbaka"
      >
        <ChevronLeft size={22} strokeWidth={1.5} />
      </motion.button>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Category title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ textAlign: 'center', paddingLeft: '10vw', paddingRight: '10vw', marginBottom: '8px' }}
        >
          <h1
            style={{
              fontFamily: "'DM Serif Display', var(--font-serif)",
              fontSize: 'clamp(28px, 8vw, 38px)',
              fontWeight: 700,
              color: colorLight,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              textShadow: `0 0 20px ${color}80, 0 1px 8px hsla(194, 28%, 8%, 0.4)`,
            }}
          >
            {category.title}
          </h1>
        </motion.div>

        {/* Entry line */}
        {category.entryLine && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              lineHeight: 1.45,
              color: colorLight,
              opacity: 0.95,
              maxWidth: '80%',
              marginLeft: 'auto', marginRight: 'auto',
              marginBottom: '40px',
              textWrap: 'balance',
              textShadow: `0 0 14px ${color}60, 0 1px 6px hsla(194, 28%, 8%, 0.35)`,
            } as React.CSSProperties}
          >
            {category.entryLine}
          </motion.p>
        )}

        {/* Ceremony separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
          style={{
            width: '28px', height: '2px', borderRadius: '1px',
            background: 'var(--accent-saffron, #DA9D1D)',
            opacity: 0.45, margin: '0 auto 28px', transformOrigin: 'center',
          }}
        />

        {/* Card tiles */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } } }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          {cards.map((card, index) => {
            const isCompleted = completedCardIds.includes(card.id);
            const isInProgress = !isCompleted && inProgressCardIds.includes(card.id);
            const isNextSuggested = !isCompleted && cards.slice(0, index).every(c => completedCardIds.includes(c.id));
            const tileFill = CIRCADIAN_FILLS[category.id] || 'rgba(162, 181, 169, 0.62)';
            const tileText = CIRCADIAN_COLORS_LIGHT[category.id] || '#D0DDD5';
            const tileColor = CIRCADIAN_COLORS[category.id] || '#A2B5A9';

            return (
              <motion.button
                key={card.id}
                variants={{
                  hidden: { opacity: 0, y: 22, scale: 0.94 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={() => navigate(isReturningUser ? `/card/${card.id}` : `/preview/${card.id}`)}
                style={{
                  position: 'relative',
                  width: '100%',
                  background: tileFill,
                  backdropFilter: 'blur(24px) saturate(1.3)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                  borderRadius: '24px',
                  padding: '28px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: isNextSuggested && !allCompleted
                    ? `2px solid ${STILL_US_SAFFRON}88`
                    : `1px solid rgba(255, 255, 255, 0.15)`,
                  boxShadow: [
                    isNextSuggested && !allCompleted ? `0 0 20px 0px ${STILL_US_SAFFRON}40, 0 0 40px -4px ${STILL_US_SAFFRON}25` : '',
                    '0 10px 28px rgba(0, 0, 0, 0.25)',
                    '0 4px 10px rgba(0, 0, 0, 0.15)',
                    '0 1px 3px rgba(0, 0, 0, 0.1)',
                    'inset 0 1.5px 0 rgba(255, 255, 255, 0.25)',
                    `inset 0 -3px 8px ${tileColor}25`,
                  ].filter(Boolean).join(', '),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0',
                  overflow: 'hidden',
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: "'DM Serif Display', var(--font-serif)",
                      fontSize: 'clamp(19px, 5vw, 22px)',
                      fontWeight: 400,
                      color: '#F5EFE6',
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
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#F5EFE6',
                        opacity: 0.75,
                        lineHeight: 1.4,
                        display: 'block',
                        marginTop: '5px',
                      }}
                    >
                      {card.subtitle}
                    </span>
                  )}
                </div>

                <div style={{ flexShrink: 0 }}>
                  {isCompleted && <CardStatusBadge variant="completed" mode="dark" />}
                  {isInProgress && <CardStatusBadge variant="inProgress" mode="dark" />}
                  {isNextSuggested && !allCompleted && <CardStatusBadge variant="next" mode="dark" />}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Bottom sign-off */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ marginTop: '40px', textAlign: 'center', paddingLeft: '24px', paddingRight: '24px' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--text-primary)',
              opacity: 0.60,
              lineHeight: 1.55,
              textShadow: '0 1px 4px hsla(194, 28%, 8%, 0.30)',
            }}
          >
            {allCompleted
              ? 'Ni har utforskat alla samtal här. Välkomna tillbaka när som helst.'
              : 'Välj det som känns rätt just nu.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
