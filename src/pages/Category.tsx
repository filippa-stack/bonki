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
import Header from '@/components/Header';

import bonkiLogo from '@/assets/bonki-logo.png';
import mirrorJagIMig from '@/assets/mirror-jag-i-mig.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Per-card opacity overrides for illustrations.
 * Baseline is 0.12. Dense/dark illustrations get lower values,
 * light/sparse ones get higher values — targeting uniform visual weight.
 */
const CARD_ILLUSTRATION_OPACITY: Record<string, number> = {
  // JIM — dark ink-heavy illustrations
  'jim-arg': 0.07,
  'jim-vild': 0.08,
  'jim-skam': 0.07,
  'jim-avundsjuk': 0.07,
  'jim-svartsjuk': 0.08,
  'jim-avsky': 0.08,
  'jim-acklad': 0.08,
  // JIM — lighter/sparser
  'jim-radd': 0.14,
  'jim-glad': 0.14,
  'jim-trygg': 0.14,
  'jim-nyfiken': 0.14,
  // JIM — special
  'jim-jag': 0.18,
  // JIV — dense multi-color illustrations
  'jiv-frihet': 0.09,
  'jiv-karlek': 0.09,
  'jiv-vanskap': 0.09,
  'jiv-mobbning': 0.09,
  'jiv-aktivism': 0.09,
  // JIV — light/sparse
  'jiv-identitet': 0.14,
  'jiv-roller': 0.14,
  // JMA — dense character illustrations
  'jma-stopp': 0.09,
  'jma-konflikt': 0.09,
  'jma-skuld': 0.09,
  'jma-skam': 0.09,
  // SEX — dense illustrations
  'sex-pornografi': 0.08,
  'sex-sexuella-overgrepp': 0.08,
  'sex-sex-som-hot': 0.08,
  // SK — dense illustrations
  'sk-konflikt': 0.09,
  'sk-forlora-ett-syskon': 0.09,
};

/**
 * Per-card image source overrides — use a specific imported asset
 * instead of the zip-extracted illustration.
 */
const CARD_IMAGE_OVERRIDE: Record<string, string> = {
  'jim-jag': mirrorJagIMig,
};

/**
 * Per-card visual scale multiplier for illustration thumbnails.
 * Baseline is 1.0 (72×72). Illustrations with lots of negative space
 * or small focal points get scaled up; dense/large ones get scaled down.
 * Goal: uniform *perceived* size across all tiles.
 */
const CARD_ILLUSTRATION_SCALE: Record<string, number> = {
  // JIM — calibrated for uniform perceived size across all tiles
  'jim-stolt': 1.10,
  'jim-bestamd': 1.25,
  'jim-karlek': 1.14,
  'jim-nyfiken': 1.05,
  'jim-forvanad': 1.00,
  'jim-jag': 1.05,
  'jim-trygg': 1.08,
  'jim-ensam': 1.02,
  'jim-glad': 1.04,
  'jim-radd': 1.04,
  'jim-arg': 0.92,
  'jim-vild': 0.94,
  'jim-skam': 0.90,
  'jim-avundsjuk': 0.90,
  'jim-svartsjuk': 0.92,
  'jim-avsky': 0.92,
  'jim-acklad': 0.92,
  'jim-besviken': 1.00,
  'jim-utanfor': 0.96,
  'jim-ledsen': 1.00,
  'jim-stress': 0.96,
};

/**
 * Per-card positional nudge (px) to optically harmonise illustration placement.
 * x: positive = further right, negative = further left
 * y: positive = further down, negative = further up
 * Calibrated so every illustration sits at the same optical anchor point
 * relative to the text block, regardless of the illustration's internal
 * composition or weight distribution.
 */
const CARD_ILLUSTRATION_NUDGE: Record<string, { x: number; y: number }> = {
  // JIM — dense/bottom-heavy → pull up, keep flush right
  'jim-arg': { x: 0, y: -4 },
  'jim-vild': { x: 0, y: -3 },
  'jim-skam': { x: 0, y: -3 },
  'jim-avundsjuk': { x: 0, y: -3 },
  'jim-svartsjuk': { x: 0, y: -2 },
  'jim-avsky': { x: 0, y: -3 },
  'jim-acklad': { x: 0, y: -2 },
  // JIM — medium weight, mostly centered already
  'jim-stolt': { x: 2, y: 0 },
  'jim-bestamd': { x: 0, y: 0 },
  'jim-karlek': { x: 0, y: 0 },
  'jim-nyfiken': { x: 0, y: 0 },
  'jim-forvanad': { x: 0, y: 0 },
  'jim-trygg': { x: 0, y: 0 },
  'jim-glad': { x: 0, y: 0 },
  'jim-radd': { x: 0, y: 0 },
  'jim-ensam': { x: 0, y: 0 },
  // JIM — narrow/light → nudge slightly left for optical margin
  'jim-jag': { x: -4, y: 0 },
  'jim-besviken': { x: 0, y: 0 },
  'jim-utanfor': { x: 0, y: -1 },
  'jim-ledsen': { x: 0, y: 0 },
  'jim-stress': { x: 0, y: -1 },
};

/** Product-specific design tokens for card listings */
const PRODUCT_STYLES: Record<string, {
  cardBg: string;
  cardTitleColor: string;
}> = {
  jag_i_mig: {
    cardBg: '#F8F3E4',
    cardTitleColor: '#8A9A10',
  },
  jag_med_andra: {
    cardBg: '#F8F0F6',
    cardTitleColor: '#9825D6',
  },
  jag_i_varlden: {
    cardBg: '#E8F2EA',
    cardTitleColor: '#3D7A45',
  },
  sexualitetskort: {
    cardBg: '#F8EEF2',
    cardTitleColor: '#B5646E',
  },
  vardagskort: {
    cardBg: '#E8F2F2',
    cardTitleColor: '#0F6B99',
  },
  syskonkort: {
    cardBg: '#ECF0F6',
    cardTitleColor: '#0F4E99',
  },
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
  const backTo = product ? `/product/${product.slug}` : '/';
  const styles = product ? PRODUCT_STYLES[product.id] : undefined;

  // Apply product theme
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    '#FAF7F2', // Warm linen page background
    product?.ctaButtonColor,
  );

  if (!category) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="h-14 border-b border-border" style={{ backgroundColor: 'var(--surface-raised)' }} />
        <div className="px-5 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('category.not_found')}</p>
        </div>
      </div>
    );
  }

  const allCompleted = cards.length > 0 && cards.every(c => completedCardIds.includes(c.id));

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FAF7F2' }}>
      <Header title={category?.title} titleColor={styles?.cardTitleColor} showBack backTo={backTo} />

      {/* BONKI logo watermark behind the card list */}
      <div
        className="pointer-events-none select-none"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          opacity: 0.045,
        }}
      >
        <img
          src={bonkiLogo}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            width: '50vw',
            maxWidth: '280px',
            objectFit: 'contain',
          }}
        />
      </div>

      <div className="px-5 pt-4 pb-24 flex flex-col relative z-[1]">
        {/* Editorial entry line */}
        {category.entryLine && (
          <motion.p
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              marginTop: '32px',
              marginBottom: '52px',
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(22px, 5.8vw, 28px)',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 1.35,
              color: styles?.cardTitleColor ?? 'var(--accent-text)',
              textWrap: 'balance',
              hyphens: 'auto',
              display: 'block',
              maxWidth: '85%',
              marginLeft: 'auto',
              marginRight: 'auto',
              letterSpacing: '-0.015em',
            } as React.CSSProperties}
          >
            {category.entryLine}
          </motion.p>
        )}

        {/* Card list */}
        {cards.map((card, index) => {
          const isCompleted = completedCardIds.includes(card.id);
          const isInProgress = !isCompleted && inProgressCardIds.includes(card.id);
          return (
            <CardEntry
              key={card.id}
              card={card}
              index={index}
              isCompleted={isCompleted}
              isInProgress={isInProgress}
              onNavigate={() => {
                // Still Us cards go to preview screen first; product cards go directly to session
                const isStillUs = !product || product.id === 'still_us';
                navigate(isStillUs ? `/preview/${card.id}` : `/card/${card.id}`);
              }}
              isLast={index === cards.length - 1}
              styles={styles}
            />
          );
        })}

        {/* Bottom anchor */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'normal',
            fontSize: '14px',
            color: styles?.cardTitleColor ?? 'var(--accent-saffron)',
            opacity: 0.55,
            lineHeight: 1.5,
          }}>
            {allCompleted
              ? 'Ni har utforskat alla samtal här. Välkomna tillbaka när som helst.'
              : 'Välj det som känns rätt just nu.'}
          </p>
          <button
            onClick={() => navigate(backTo)}
            className="transition-opacity hover:opacity-70"
            style={{
              color: 'var(--color-text-tertiary)',
              opacity: 0.40,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '16px',
              padding: '8px',
            }}
            aria-label="Tillbaka"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Card Entry (premium tile with illustration) ─── */

interface CardEntryProps {
  card: {
    id: string;
    title: string;
    subtitle?: string;
  };
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
        onPointerDown={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'scale(0.99)';
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.transform = '';
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
        onPointerEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow =
            '0px 4px 12px rgba(44, 36, 32, 0.10), 0px 12px 36px -8px rgba(44, 36, 32, 0.08)';
        }}
      >
        {/* Card illustration watermark — right side */}
        {illustration && (
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none select-none absolute"
            style={{
              right: `${16 - nudge.x}px`,
              top: `calc(50% + ${nudge.y}px)`,
              transform: 'translateY(-50%)',
              height: `${size}px`,
              width: `${size}px`,
              objectFit: 'contain',
              objectPosition: 'center',
              opacity: illustrationOpacity,
            }}
          />
        )}

        {/* Completion status — top right */}
        {isCompleted && (
          <span
            className="absolute"
            style={{
              top: '10px',
              right: '14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: titleColor,
              opacity: 0.6,
              fontWeight: 500,
            }}
          >
            Utforskad
          </span>
        )}

        <div className="flex items-center relative z-[1]">
          {/* In-progress dot — left edge */}
          {isInProgress && (
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: titleColor,
                marginRight: '12px',
                flexShrink: 0,
                animation: 'saffron-pulse 2.0s ease-in-out infinite',
              }}
            />
          )}

          <div className="flex-1 min-w-0" style={{ paddingRight: illustration ? '20%' : '0' }}>
            <h3
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: '20px',
                fontWeight: 400,
                color: titleColor,
                opacity: isCompleted ? 0.60 : 1,
                lineHeight: 1.3,
                textAlign: 'left',
              }}
            >
              {card.title}
            </h3>
            {card.subtitle && (
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'normal',
                  fontSize: '14px',
                  color: subtitleColor,
                  opacity: isCompleted ? 0.45 : 0.75,
                  lineHeight: 1.4,
                  marginTop: '6px',
                  textAlign: 'left',
                }}
              >
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}