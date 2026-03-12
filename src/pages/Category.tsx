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
  // Jag i mig — softened to avoid overpowering illustrations
  'jim-tryggheten-inuti': '#A8AD45',
  'jim-kanslorna-jag-bar': '#F2E8CF',
  'jim-nar-det-gor-ont': '#7A8A52',
  'jim-jag-som-helhet': '#E9EDC9',
};

/** Category-specific card title colors (matching homescreen tile text) */
const CATEGORY_TITLE_COLOR: Record<string, string> = {
  'jim-tryggheten-inuti': '#FFFDF5',
  'jim-kanslorna-jag-bar': '#4A4820',
  'jim-nar-det-gor-ont': '#FFFDF5',
  'jim-jag-som-helhet': '#6B6530',
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
  const [inProgressCardIds, setInProgressCardIds] = useState<string[]>([]);

  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;

    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (!cancelled && data) {
          setServerCompletedCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });

    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .in('status', ['active', 'abandoned', 'in_progress'])
      .then(({ data }) => {
        if (!cancelled && data) {
          setInProgressCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });

    return () => { cancelled = true; };
  }, [space?.id]);

  const completedCardIds = useMemo(() => {
    const merged = new Set(serverCompletedCardIds);
    optimisticCardIds.forEach(id => merged.add(id));
    return Array.from(merged);
  }, [serverCompletedCardIds, optimisticCardIds]);

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const cards = categoryId ? getCardsByCategory(categoryId) : [];

  // Determine product for back-navigation and theming
  const product = useMemo(() => {
    if (!categoryId) return undefined;
    return allProducts.find(p => p.categories.some(c => c.id === categoryId));
  }, [categoryId]);

  // Still Us categories live in content.ts, not in allProducts
  const isStillUsCategory = useMemo(() => {
    return !!categoryId && stillUsCategories.some(c => c.id === categoryId);
  }, [categoryId]);

  const backTo = product ? `/product/${product.slug}` : isStillUsCategory ? '/?devState=solo' : '/';
  const styles = product ? PRODUCT_STYLES[product.id] : undefined;

  // Apply product theme for non-Still Us products
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    isStillUsCategory ? undefined : '#FAF7F2',
    product?.ctaButtonColor,
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

        {cards.map((card, index) => (
          <CardEntry
            key={card.id}
            card={card}
            index={index}
            isCompleted={completedCardIds.includes(card.id)}
            isInProgress={!completedCardIds.includes(card.id) && inProgressCardIds.includes(card.id)}
            onNavigate={() => navigate(`/card/${card.id}`)}
            isLast={index === cards.length - 1}
            styles={styles}
            categoryBg={categoryId ? CATEGORY_CARD_BG[categoryId] : undefined}
          />
        ))}

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
}: StillUsCategoryViewProps) {
  const color = circadianColor || '#A2B5A9';
  const colorLight = CIRCADIAN_COLORS_LIGHT[category.id] || color;
  const HERITAGE_GOLD = '#DA9D1D';

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
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
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

        {/* Card tiles — glassmorphism */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', paddingLeft: '16px', paddingRight: '20px', position: 'relative' }}>
          {cards.map((card, index) => {
            const isCompleted = completedCardIds.includes(card.id);
            const isInProgress = !isCompleted && inProgressCardIds.includes(card.id);
            const fillDefault = CIRCADIAN_FILLS[category.id] || 'rgba(162, 181, 169, 0.28)';
            const fillHover = CIRCADIAN_FILLS_HOVER[category.id] || 'rgba(162, 181, 169, 0.42)';
            const borderDefault = `1px solid ${color}73`;
            const borderGlow = `1px solid ${color}`;
            const isLast = index === cards.length - 1;

            return (
              <div key={card.id} style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
                {/* Sequence spine — number + connecting line */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '20px',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {/* Number */}
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: colorLight,
                      opacity: isCompleted ? 0.30 : 0.50,
                      lineHeight: 1,
                      paddingTop: '18px',
                    }}
                  >
                    {index + 1}
                  </span>
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        width: '1px',
                        background: `linear-gradient(180deg, ${color}30 0%, transparent 100%)`,
                        marginTop: '8px',
                      }}
                    />
                  )}
                </div>

                {/* Tile */}
                <motion.button
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.07, duration: 0.55, ease: EASE }}
                  onClick={() => navigate(`/preview/${card.id}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.985 }}
                  className="text-left"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '0',
                    padding: '0',
                    background: fillDefault,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: isInProgress ? borderGlow : borderDefault,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: isInProgress
                      ? `0 0 16px -2px ${color}35, 0 0 32px -6px ${color}20`
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = fillHover;
                    el.style.border = borderGlow;
                    el.style.boxShadow = `0 0 24px -4px ${color}50, 0 0 48px -8px ${color}30`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = fillDefault;
                    el.style.border = isInProgress ? borderGlow : borderDefault;
                    el.style.boxShadow = isInProgress
                      ? `0 0 16px -2px ${color}35, 0 0 32px -6px ${color}20`
                      : 'none';
                  }}
                >
                  {/* Thick accent bar */}
                  <div
                    style={{
                      width: '4px',
                      alignSelf: 'stretch',
                      backgroundColor: color,
                      flexShrink: 0,
                      borderRadius: '14px 0 0 14px',
                    }}
                  />

                  {/* Card content */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '18px',
                          fontWeight: 500,
                          lineHeight: 1.3,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {card.title}
                      </h3>
                      {card.subtitle && (
                        <p
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 400,
                            color: colorLight,
                            opacity: 1,
                            lineHeight: 1.45,
                            marginTop: '3px',
                          }}
                        >
                          {card.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div style={{ flexShrink: 0 }}>
                      {isCompleted && (
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '9px',
                            fontWeight: 500,
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase' as const,
                            color: HERITAGE_GOLD,
                            opacity: 0.55,
                          }}
                        >
                          Utforskad
                        </span>
                      )}
                      {isInProgress && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: '6px', height: '6px',
                            borderRadius: '50%',
                            backgroundColor: HERITAGE_GOLD,
                            opacity: 0.7,
                            animation: 'saffron-pulse 2.0s ease-in-out infinite',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>

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
  onNavigate: () => void;
  isLast?: boolean;
  styles?: typeof PRODUCT_STYLES[string];
  categoryBg?: string;
}

function CardEntry({ card, index, isCompleted = false, isInProgress = false, onNavigate, isLast = false, styles, categoryBg }: CardEntryProps) {
  const zipIllustration = useCardImage(card.id);
  const illustration = CARD_IMAGE_OVERRIDE[card.id] ?? zipIllustration;

  const titleColor = CATEGORY_TITLE_COLOR[card.id.replace(/-[^-]+$/, '-' + card.id.split('-').slice(0, 2).join('-'))]
    ?? styles?.cardTitleColor ?? 'var(--text-primary)';
  const focalPoint = CARD_FOCAL_POINT[card.id] ?? 'center 35%';

  // Derive category ID from card ID for color lookup
  const categoryId = Object.keys(CATEGORY_CARD_BG).find(catId =>
    card.id.startsWith(catId.replace(/^jim-/, 'jim-').split('-').slice(0, 2).join('-'))
  );
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
          background: categoryBg
            ? `linear-gradient(170deg, rgba(255,255,255,0.25) 0%, ${categoryBg}e6 35%, ${categoryBg}d4 100%)`
            : `linear-gradient(170deg, rgba(255,255,255,0.3) 0%, ${styles?.cardBg || '#FFFFFF'}e6 35%, ${styles?.cardBg || '#FFFFFF'}cc 100%)`,
          backdropFilter: 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          border: categoryBg
            ? '1.5px solid rgba(255,255,255,0.4)'
            : '1.5px solid rgba(255,255,255,0.6)',
          borderRadius: '22px',
          boxShadow: [
            `0 8px 28px rgba(44, 36, 32, 0.10)`,
            `0 2px 8px rgba(44, 36, 32, 0.06)`,
            `inset 0 2px 1px rgba(255,255,255,0.5)`,
            `inset 0 -3px 6px rgba(0,0,0,0.04)`,
          ].join(', '),
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

        {/* Completion / in-progress markers — top-right, subtle */}
        {isCompleted && (
          <div
            style={{
              position: 'absolute', top: '14px', right: '16px', zIndex: 2,
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '5px 10px 5px 8px',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#6B7A3A" strokeWidth="1.5" opacity="0.6" />
              <path d="M4 7l2.2 2.2 3.8-3.8" stroke="#6B7A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '10px',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: '#6B7A3A', fontWeight: 600, opacity: 0.8,
            }}>
              Utforskad
            </span>
          </div>
        )}
        {isInProgress && (
          <div
            style={{
              position: 'absolute', top: '14px', right: '16px', zIndex: 2,
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '5px 10px 5px 8px',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{
              display: 'inline-block', width: '8px', height: '8px',
              borderRadius: '50%', backgroundColor: '#8A9A10',
              animation: 'saffron-pulse 2.0s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '10px',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: '#6B7A3A', fontWeight: 600, opacity: 0.8,
            }}>
              Påbörjad
            </span>
          </div>
        )}

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
              textShadow: cardTitleColor === '#FFFDF5'
                ? '0 1px 2px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.35), 0 0 24px rgba(0,0,0,0.2)'
                : '0 1px 2px rgba(255,255,255,0.8), 0 0 12px rgba(255,255,255,0.4)',
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
