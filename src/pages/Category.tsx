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
import { CIRCADIAN_COLORS } from '@/components/CircadianMenu';
import Header from '@/components/Header';


import mirrorJagIMig from '@/assets/mirror-jag-i-mig.png';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Per-card opacity overrides for illustrations.
 */
const CARD_ILLUSTRATION_OPACITY: Record<string, number> = {
  'jim-arg': 0.07, 'jim-vild': 0.08, 'jim-skam': 0.07,
  'jim-avundsjuk': 0.07, 'jim-svartsjuk': 0.08, 'jim-avsky': 0.08, 'jim-acklad': 0.08,
  'jim-radd': 0.14, 'jim-glad': 0.14, 'jim-trygg': 0.14, 'jim-nyfiken': 0.14,
  'jim-jag': 0.18,
  'jiv-frihet': 0.09, 'jiv-karlek': 0.09, 'jiv-vanskap': 0.09,
  'jiv-mobbning': 0.09, 'jiv-aktivism': 0.09,
  'jiv-identitet': 0.14, 'jiv-roller': 0.14,
  'jma-stopp': 0.09, 'jma-konflikt': 0.09, 'jma-skuld': 0.09, 'jma-skam': 0.09,
  'sex-pornografi': 0.08, 'sex-sexuella-overgrepp': 0.08, 'sex-sex-som-hot': 0.08,
  'sk-konflikt': 0.09, 'sk-forlora-ett-syskon': 0.09,
};

const CARD_IMAGE_OVERRIDE: Record<string, string> = {
  'jim-jag': mirrorJagIMig,
};

const CARD_ILLUSTRATION_SCALE: Record<string, number> = {
  'jim-stolt': 1.10, 'jim-bestamd': 1.25, 'jim-karlek': 1.14,
  'jim-nyfiken': 1.05, 'jim-forvanad': 1.00, 'jim-jag': 1.05,
  'jim-trygg': 1.08, 'jim-ensam': 1.02, 'jim-glad': 1.04,
  'jim-radd': 1.04, 'jim-arg': 0.92, 'jim-vild': 0.94,
  'jim-skam': 0.90, 'jim-avundsjuk': 0.90, 'jim-svartsjuk': 0.92,
  'jim-avsky': 0.92, 'jim-acklad': 0.92, 'jim-besviken': 1.00,
  'jim-utanfor': 0.96, 'jim-ledsen': 1.00, 'jim-stress': 0.96,
};

const CARD_ILLUSTRATION_NUDGE: Record<string, { x: number; y: number }> = {
  'jim-arg': { x: 0, y: -4 }, 'jim-vild': { x: 0, y: -3 },
  'jim-skam': { x: 0, y: -3 }, 'jim-avundsjuk': { x: 0, y: -3 },
  'jim-svartsjuk': { x: 0, y: -2 }, 'jim-avsky': { x: 0, y: -3 },
  'jim-acklad': { x: 0, y: -2 }, 'jim-stolt': { x: 2, y: 0 },
  'jim-bestamd': { x: 0, y: 0 }, 'jim-karlek': { x: 0, y: 0 },
  'jim-nyfiken': { x: 0, y: 0 }, 'jim-forvanad': { x: 0, y: 0 },
  'jim-trygg': { x: 0, y: 0 }, 'jim-glad': { x: 0, y: 0 },
  'jim-radd': { x: 0, y: 0 }, 'jim-ensam': { x: 0, y: 0 },
  'jim-jag': { x: -4, y: 0 }, 'jim-besviken': { x: 0, y: 0 },
  'jim-utanfor': { x: 0, y: -1 }, 'jim-ledsen': { x: 0, y: 0 },
  'jim-stress': { x: 0, y: -1 },
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
  const HERITAGE_GOLD = '#DA9D1D';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      {/* Background illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute', top: '5%', left: '-42%',
          width: '135%', height: '125%',
          zIndex: 0, pointerEvents: 'none',
        }}
      >
        <img
          src={stillUsIllustration}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left top', opacity: 0.30 }}
        />
      </motion.div>

      {/* Scrim gradient behind tile zone — separates illustration from content */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '35%', left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, transparent 0%, hsla(194, 28%, 12%, 0.45) 25%, hsla(194, 28%, 12%, 0.65) 100%)',
          zIndex: 0, pointerEvents: 'none',
        }}
      />

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
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
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
              color,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              textShadow: '0 1px 8px hsla(194, 28%, 8%, 0.4)',
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
              color: 'var(--text-primary)',
              opacity: 0.85,
              maxWidth: '80%',
              marginLeft: 'auto', marginRight: 'auto',
              marginBottom: '40px',
              textWrap: 'balance',
              textShadow: '0 1px 6px hsla(194, 28%, 8%, 0.35)',
            } as React.CSSProperties}
          >
            {category.entryLine}
          </motion.p>
        )}

        {/* Card tiles — glassmorphism */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', paddingRight: '20px' }}>
          {cards.map((card, index) => {
            const isCompleted = completedCardIds.includes(card.id);
            const isInProgress = !isCompleted && inProgressCardIds.includes(card.id);

            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.07, duration: 0.55, ease: EASE }}
                onClick={() => navigate(`/preview/${card.id}`)}
                whileTap={{ scale: 0.985 }}
                className="w-full text-left"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '20px 20px',
                  background: isCompleted
                    ? `hsla(194, 28%, 18%, 0.55)`
                    : `hsla(194, 28%, 20%, 0.60)`,
                  backdropFilter: 'blur(20px) saturate(1.2)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
                  border: isInProgress
                    ? `1px solid ${color}`
                    : `1px solid hsla(194, 28%, 50%, 0.25)`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  boxShadow: isInProgress
                    ? `0 0 20px -4px ${color}40, 0 4px 16px -4px hsla(194, 28%, 10%, 0.25)`
                    : '0 2px 12px -2px hsla(194, 28%, 8%, 0.20)',
                  transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `hsla(194, 28%, 22%, 0.70)`;
                  el.style.borderColor = color;
                  el.style.boxShadow = `0 0 24px -4px ${color}50, 0 4px 20px -4px hsla(194, 28%, 10%, 0.30)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = isCompleted ? `hsla(194, 28%, 18%, 0.55)` : `hsla(194, 28%, 20%, 0.60)`;
                  el.style.borderColor = isInProgress ? color : `hsla(194, 28%, 50%, 0.25)`;
                  el.style.boxShadow = isInProgress
                    ? `0 0 20px -4px ${color}40, 0 4px 16px -4px hsla(194, 28%, 10%, 0.25)`
                    : '0 2px 12px -2px hsla(194, 28%, 8%, 0.20)';
                }}
              >
                {/* Accent bar */}
                <div
                  style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: '3px', backgroundColor: color,
                    borderRadius: '14px 0 0 14px',
                    opacity: isCompleted ? 0.4 : 0.8,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0, paddingLeft: '8px' }}>
                  <h3
                    style={{
                      fontFamily: "'DM Serif Display', var(--font-serif)",
                      fontSize: '19px',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      opacity: isCompleted ? 0.6 : 1,
                      lineHeight: 1.3,
                      textShadow: '0 1px 3px hsla(194, 28%, 8%, 0.25)',
                    }}
                  >
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12.5px',
                        fontWeight: 400,
                        color: 'var(--text-primary)',
                        opacity: isCompleted ? 0.40 : 0.55,
                        lineHeight: 1.45,
                        marginTop: '4px',
                      }}
                    >
                      {card.subtitle}
                    </p>
                  )}
                </div>

                {/* Status indicator — small, quiet */}
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
                      flexShrink: 0,
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
                      flexShrink: 0,
                      animation: 'saffron-pulse 2.0s ease-in-out infinite',
                    }}
                  />
                )}
              </motion.button>
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
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '14px',
              color: 'var(--text-primary)',
              opacity: 0.70,
              lineHeight: 1.5,
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
}

function CardEntry({ card, index, isCompleted = false, isInProgress = false, onNavigate, isLast = false, styles }: CardEntryProps) {
  const zipIllustration = useCardImage(card.id);
  const illustration = CARD_IMAGE_OVERRIDE[card.id] ?? zipIllustration;
  const illustrationOpacity = CARD_ILLUSTRATION_OPACITY[card.id] ?? 0.12;
  const illustrationScale = CARD_ILLUSTRATION_SCALE[card.id] ?? 1.0;
  const nudge = CARD_ILLUSTRATION_NUDGE[card.id] ?? { x: 0, y: 0 };
  const size = Math.round(72 * illustrationScale);

  const cardBg = styles?.cardBg ?? '#FFFFFF';
  const titleColor = styles?.cardTitleColor ?? 'var(--text-primary)';
  const subtitleColor = '#8A8078';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE }}
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
          padding: '24px 20px',
          background: isCompleted
            ? `linear-gradient(180deg, ${cardBg}CC 0%, ${cardBg}AA 100%)`
            : `linear-gradient(180deg, ${cardBg} 0%, ${cardBg}E8 100%)`,
          border: 'none',
          borderRadius: '12px',
          boxShadow: isCompleted
            ? '0px 1px 3px rgba(44, 36, 32, 0.04), 0px 4px 12px -4px rgba(44, 36, 32, 0.04)'
            : isInProgress
            ? '0px 3px 10px rgba(44, 36, 32, 0.12), 0px 10px 32px -8px rgba(44, 36, 32, 0.10)'
            : '0px 2px 6px rgba(44, 36, 32, 0.08), 0px 8px 24px -8px rgba(44, 36, 32, 0.06)',
          transition: 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease-out',
          minHeight: '100px',
        }}
        onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
        onPointerUp={(e) => { e.currentTarget.style.transform = ''; }}
        onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        onPointerEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0px 4px 12px rgba(44, 36, 32, 0.10), 0px 12px 36px -8px rgba(44, 36, 32, 0.08)';
        }}
      >
        {illustration && (
          <img
            src={illustration} alt="" aria-hidden="true" draggable={false}
            className="pointer-events-none select-none absolute"
            style={{
              right: `${16 - nudge.x}px`, top: `calc(50% + ${nudge.y}px)`,
              transform: 'translateY(-50%)',
              height: `${size}px`, width: `${size}px`,
              objectFit: 'contain', objectPosition: 'center',
              opacity: illustrationOpacity,
            }}
          />
        )}

        {isCompleted && (
          <span className="absolute" style={{ top: '10px', right: '14px', fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.04em', color: titleColor, opacity: 0.6, fontWeight: 500 }}>
            Utforskad
          </span>
        )}

        <div className="flex items-center relative z-[1]">
          {isInProgress && (
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: titleColor, marginRight: '12px', flexShrink: 0, animation: 'saffron-pulse 2.0s ease-in-out infinite' }} />
          )}
          <div className="flex-1 min-w-0" style={{ paddingRight: illustration ? '20%' : '0' }}>
            <h3 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: '20px', fontWeight: 400, color: titleColor, opacity: isCompleted ? 0.60 : 1, lineHeight: 1.3, textAlign: 'left' }}>
              {card.title}
            </h3>
            {card.subtitle && (
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: subtitleColor, opacity: isCompleted ? 0.45 : 0.75, lineHeight: 1.4, marginTop: '6px', textAlign: 'left' }}>
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}