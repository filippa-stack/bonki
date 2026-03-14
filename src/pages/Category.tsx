import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categories as stillUsCategories } from '@/data/content';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
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
import { CIRCADIAN_COLORS, CIRCADIAN_COLORS_LIGHT, CIRCADIAN_FILLS, CIRCADIAN_FILLS_HOVER } from '@/components/CircadianMenu';
import Header from '@/components/Header';
import CardStatusBadge from '@/components/CardStatusBadge';
import { KIDS_PRODUCT_IDS } from '@/hooks/useKidsProductProgress';


import mirrorJagIMig from '@/assets/mirror-jag-i-mig.png';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Per-card opacity overrides for illustrations.
 */
const CARD_ILLUSTRATION_OPACITY: Record<string, number> = {
  'jim-arg': 0.14, 'jim-vild': 0.15, 'jim-skam': 0.14,
  'jim-avundsjuk': 0.14, 'jim-svartsjuk': 0.15, 'jim-avsky': 0.15, 'jim-acklad': 0.15,
  'jim-radd': 0.22, 'jim-glad': 0.22, 'jim-trygg': 0.22, 'jim-nyfiken': 0.22,
  'jim-jag': 0.25,
  'jiv-frihet': 0.16, 'jiv-karlek': 0.16, 'jiv-vanskap': 0.16,
  'jiv-mobbning': 0.16, 'jiv-aktivism': 0.16,
  'jiv-identitet': 0.22, 'jiv-roller': 0.22,
  'jma-stopp': 0.16, 'jma-konflikt': 0.16, 'jma-skuld': 0.16, 'jma-skam': 0.16,
  'sex-pornografi': 0.15, 'sex-sexuella-overgrepp': 0.15, 'sex-sex-som-hot': 0.15,
  'sk-konflikt': 0.16, 'sk-forlora-ett-syskon': 0.16,
};

const CARD_IMAGE_OVERRIDE: Record<string, string> = {
  'jim-jag': mirrorJagIMig,
};

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

/** Product-specific design tokens for card listings */
const PRODUCT_STYLES: Record<string, {
  cardBg: string;
  cardTitleColor: string;
}> = {
  jag_i_mig: { cardBg: '#F8F3E4', cardTitleColor: '#8A9A10' },
  jag_med_andra: { cardBg: '#F8F0F6', cardTitleColor: '#9825D6' },
  jag_i_varlden: { cardBg: '#E8F2EA', cardTitleColor: '#3D7A45' },
  sexualitetskort: { cardBg: '#F8EEF2', cardTitleColor: '#B5646E' },
  vardagskort: { cardBg: '#E8F2F2', cardTitleColor: '#0F6B99' },
  syskonkort: { cardBg: '#ECF0F6', cardTitleColor: '#0F4E99' },
};

/** Category-specific tile background colors (matching product homescreen tiles) */
const CATEGORY_CARD_BG: Record<string, string> = {
  // Jag i mig
  'jim-mina-kanslor': '#D9E0A3',
  'jim-starka-kanslor': '#A8AD82',
  'jim-stora-kanslor': '#8E944F',
  // Jag med andra
  'jma-att-hora-till': '#F9EBEE',
  'jma-nar-vi-jamfor-oss': '#F5DDE4',
  'jma-nar-det-skaver': '#EED0DB',
  'jma-att-sta-stadig': '#CDBABF',
  'jma-vi-i-varlden': '#AC98A0',
  // Jag i världen
  'jiv-min-vardag': '#CDE6D2',
  'jiv-vem-jag-ar': '#F7F2ED',
  'jiv-jag-och-andra': '#E5D5C8',
  'jiv-jag-i-samhallet': '#BDD3C3',
  'jiv-det-stora-sammanhanget': '#8B948D',
  // Sexualitet
  'sex-min-identitet': '#F9F2F5',
  'sex-normer-och-paverkan': '#EBC9C9',
  'sex-relation-och-ansvar': '#D19898',
  'sex-skydd-och-makt': '#A66D6D',
  // Vardag
  'vk-min-dag': '#E6F4F4',
  'vk-var-rytm': '#D4E9EC',
  'vk-vi-hemma': '#B8D8E0',
  'vk-utanfor-hemmet': '#9CBFC9',
  // Syskon
  'sk-vi-blev-syskon': '#E8F3F5',
  'sk-vi-ar-olika': '#F5E9D3',
  'sk-nar-det-skaver': '#D4E2E0',
  'sk-nar-livet-forandras': '#C2D1D9',
};

/** Category-specific card title colors (matching homescreen tile text) */
const CATEGORY_TITLE_COLOR: Record<string, string> = {
  // Jag i mig
  'jim-mina-kanslor': '#3E4124',
  'jim-starka-kanslor': '#3E4124',
  'jim-stora-kanslor': '#3E4124',
  // Jag med andra
  'jma-att-hora-till': '#9825D6',
  'jma-nar-vi-jamfor-oss': '#9825D6',
  'jma-nar-det-skaver': '#9825D6',
  'jma-att-sta-stadig': '#5A189A',
  'jma-vi-i-varlden': '#3A0A5C',
  // Jag i världen
  'jiv-min-vardag': '#3E4A40',
  'jiv-vem-jag-ar': '#3E4A40',
  'jiv-jag-och-andra': '#3E4A40',
  'jiv-jag-i-samhallet': '#3E4A40',
  'jiv-det-stora-sammanhanget': '#F5F2ED',
  // Sexualitet
  'sex-min-identitet': '#6B3A3F',
  'sex-normer-och-paverkan': '#5A2A30',
  'sex-relation-och-ansvar': '#3A1E1E',
  'sex-skydd-och-makt': '#FAFAF0',
  // Vardag
  'vk-min-dag': '#073B54',
  'vk-var-rytm': '#073B54',
  'vk-vi-hemma': '#073B54',
  'vk-utanfor-hemmet': '#073B54',
  // Syskon
  'sk-vi-blev-syskon': '#274C5E',
  'sk-vi-ar-olika': '#3A2E1A',
  'sk-nar-det-skaver': '#274C5E',
  'sk-nar-livet-forandras': '#274C5E',
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

  // Determine product for back-navigation and theming
  const product = useMemo(() => {
    if (!categoryId) return undefined;
    return allProducts.find(p => p.categories.some(c => c.id === categoryId));
  }, [categoryId]);

  // Determine if this is a kids product category (uses 14-day expiry)
  const isKidsProduct = !!product && KIDS_PRODUCT_IDS.includes(product.id);

  // Still Us categories live in content.ts, not in allProducts
  const isStillUsCategory = useMemo(() => {
    return !!categoryId && stillUsCategories.some(c => c.id === categoryId);
  }, [categoryId]);

  // For kids products: apply 14-day expiry to completions
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
  const styles = product ? PRODUCT_STYLES[product.id] : undefined;

  // Apply product theme for non-Still Us products
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    isStillUsCategory ? undefined : '#FAF7F2',
    product?.ctaButtonColor,
    product?.pronounMode,
  );

  // Apply Verdigris theme for Still Us categories
  useVerdigrisTheme(isStillUsCategory);

  // Get circadian color for Still Us category
  const circadianColor = categoryId ? CIRCADIAN_COLORS[categoryId] : undefined;

  if (!category) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isStillUsCategory ? 'var(--surface-base)' : '#FAF7F2' }}>
        <div className="h-14 border-b border-border" style={{ backgroundColor: 'var(--surface-raised)' }} />
        <div className="px-5 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('category.not_found')}</p>
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

  // ── Product category view (non-Still Us) ──
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FAF7F2' }}>
      <Header title={category?.title} titleColor={styles?.cardTitleColor} showBack backTo={backTo} />


      <div className="px-5 pt-4 pb-24 flex flex-col relative z-[1]">
        {category.entryLine && (
          <motion.p
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              marginTop: '32px', marginBottom: '52px',
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 5.8vw, 28px)',
              fontWeight: 400, lineHeight: 1.35,
              color: styles?.cardTitleColor ?? 'var(--accent-text)',
              textWrap: 'balance', hyphens: 'auto',
              maxWidth: '85%', marginLeft: 'auto', marginRight: 'auto',
              letterSpacing: '-0.015em',
            } as React.CSSProperties}
          >
            {category.entryLine}
          </motion.p>
        )}

        {cards.map((card, index) => {
          const isCompleted = completedCardIds.includes(card.id);
          const isNextSuggested = !isCompleted && cards.slice(0, index).every(c => completedCardIds.includes(c.id));
          return (
            <CardEntry
              key={card.id}
              card={card}
              index={index}
              isCompleted={isCompleted}
              isInProgress={!isCompleted && inProgressCardIds.includes(card.id)}
              isNextSuggested={isNextSuggested && !allCompleted}
              onNavigate={() => navigate(`/card/${card.id}`)}
              isLast={index === cards.length - 1}
              styles={styles}
              categoryBg={categoryId ? CATEGORY_CARD_BG[categoryId] : undefined}
              categoryId={categoryId}
            />
          );
        })}

        <div style={{ marginTop: '40px', textAlign: 'center', paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: styles?.cardTitleColor ?? 'var(--accent-saffron)', opacity: 0.55, lineHeight: 1.5 }}>
            {allCompleted ? 'Ni har utforskat alla samtal här. Välkomna tillbaka när som helst.' : 'Välj det som känns rätt just nu.'}
          </p>
          <button
            onClick={() => navigate(backTo)}
            className="transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-tertiary)', opacity: 0.40, background: 'none', border: 'none', cursor: 'pointer', marginTop: '16px', padding: '8px' }}
            aria-label="Tillbaka"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Still Us — Verdigris-themed Category View
   Matches homescreen quality: dark canvas, glassmorphism,
   illustration background, editorial typography.
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
  /** User has completed at least 1 session — skip CardPreview */
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
  const SAFFRON = '#DA9D1D';

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

        {/* Card tiles — large vertical memory cards */}
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
                    ? `2px solid ${SAFFRON}88`
                    : `1px solid rgba(255, 255, 255, 0.15)`,
                  boxShadow: [
                    isNextSuggested && !allCompleted ? `0 0 20px 0px ${SAFFRON}40, 0 0 40px -4px ${SAFFRON}25` : '',
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
                {/* Text content */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>

                {/* Text content */}
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

                {/* Status */}
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

/* ─── Card Entry (product tiles — non-Still Us) ─── */

interface CardEntryProps {
  card: { id: string; title: string; subtitle?: string };
  index: number;
  isCompleted?: boolean;
  isInProgress?: boolean;
  isNextSuggested?: boolean;
  onNavigate: () => void;
  isLast?: boolean;
  styles?: typeof PRODUCT_STYLES[string];
  categoryBg?: string;
  categoryId?: string;
}

function CardEntry({ card, index, isCompleted = false, isInProgress = false, isNextSuggested = false, onNavigate, isLast = false, styles, categoryBg, categoryId }: CardEntryProps) {
  const zipIllustration = useCardImage(card.id);
  const illustration = CARD_IMAGE_OVERRIDE[card.id] ?? zipIllustration;

  const focalPoint = CARD_FOCAL_POINT[card.id] ?? 'center 35%';
  const catTitleColor = categoryId ? CATEGORY_TITLE_COLOR[categoryId] : undefined;
  const cardTitleColor = catTitleColor ?? '#FAF7F2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: EASE }}
      style={{ marginBottom: isLast ? '0' : '16px' }}
    >
      <div
        onClick={onNavigate}
        role="button"
        tabIndex={0}
        aria-label={card.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(); }
        }}
        className="w-full cursor-pointer group relative overflow-hidden"
        style={{
          padding: '0',
          background: categoryBg || styles?.cardBg || '#FFFFFF',
          border: isNextSuggested ? '1.5px solid rgba(218, 157, 29, 0.55)' : '1.5px solid rgba(255,255,255,0.35)',
          borderRadius: '22px',
          boxShadow: [
            isNextSuggested ? '0 0 20px -4px rgba(218, 157, 29, 0.25)' : '',
            '0 8px 28px rgba(44, 36, 32, 0.10)',
            '0 2px 8px rgba(44, 36, 32, 0.06)',
            'inset 0 1px 0 rgba(255,255,255,0.4)',
          ].filter(Boolean).join(', '),
          transition: 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease-out',
          height: '280px',
          position: 'relative',
        }}
        onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.985)'; }}
        onPointerUp={(e) => { e.currentTarget.style.transform = ''; }}
        onPointerLeave={(e) => { e.currentTarget.style.transform = ''; }}
        onPointerEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
          e.currentTarget.style.boxShadow = [
            '0 12px 36px rgba(44, 36, 32, 0.14)',
            '0 4px 12px rgba(44, 36, 32, 0.08)',
            'inset 0 2px 1px rgba(255,255,255,0.5)',
            'inset 0 -3px 6px rgba(0,0,0,0.04)',
          ].join(', ');
        }}
      >
        {/* Full-bleed illustration — never blur or dim completed cards */}
        {illustration && (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none select-none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: focalPoint,
              opacity: 1,
            }}
          />
        )}

        {/* Status badge — unified across all products */}
        <div style={{ position: 'absolute', top: '14px', right: '16px', zIndex: 2 }}>
          {isCompleted && <CardStatusBadge variant="completed" mode="light" />}
          {isInProgress && !isCompleted && <CardStatusBadge variant="inProgress" mode="light" />}
          {isNextSuggested && !isCompleted && !isInProgress && <CardStatusBadge variant="next" mode="light" />}
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '55%',
            zIndex: 1,
            pointerEvents: 'none',
            background: (cardTitleColor === '#FAFAF0' || cardTitleColor === '#FFFDF5')
              ? 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.22) 50%, transparent 100%)'
              : 'linear-gradient(to top, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            borderRadius: '0 0 22px 22px',
          }}
        />

        {/* Title — uses category-matching color */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
            padding: '0 24px 20px',
          }}
        >
          <h3
            style={{
              fontFamily: "'DM Serif Display', var(--font-serif)",
              fontSize: '32px', fontWeight: 700,
              color: cardTitleColor,
              lineHeight: 1.1,
              textShadow: (cardTitleColor === '#FAFAF0' || cardTitleColor === '#FFFDF5')
                ? '0 1px 2px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)'
                : '0 1px 2px rgba(255,255,255,0.6), 0 0 8px rgba(255,255,255,0.3)',
              letterSpacing: '-0.01em',
            }}
          >
            {card.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
