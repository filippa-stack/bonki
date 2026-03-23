/**
 * KidsProductHome — Shared product home for ALL 6 kids products + Still Us.
 *
 * Replaces JagIMigProductHome, JagMedAndraProductHome, etc.
 * All product-specific values come from the ProductManifest.
 *
 * Layout per spec:
 *  1. Identity header (≤20% viewport): cropped hero + name + tagline
 *  2. Resume pill (conditional): Deep Dusk card for active session
 *  3. Category tiles: single-column, full-width, tile-depth colors
 *     WITH ceramic glow, illustration from first card per category
 *  4. Still Us only: intro session entry in hero zone
 */

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import { useKidsProductProgress, type KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { ChevronRight, Play } from 'lucide-react';
import {
  MIDNIGHT_INK,
  DEEP_DUSK,
  DEEP_SAFFRON,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
} from '@/lib/palette';

/* ── Animation tokens ── */
const EASE = [0.4, 0.0, 0.2, 1] as const;
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

/* ── Helpers ── */

/** Vardag uses brighter, more distinct tile colors — no murky deep tones */
const VARDAG_TILE_COLORS = ['#3C4A30', '#3E4C32', '#3C4A30', '#3E4C32'];

function getTileColor(product: ProductManifest, index: number, isSquareGrid = false): string {
  if (isSquareGrid && product.id === 'vardagskort') {
    return VARDAG_TILE_COLORS[index] ?? VARDAG_TILE_COLORS[0];
  }
  // Use tileLight for all tiles to keep brightness uniform — tileMid/tileDeep darken too aggressively
  const light = product.tileLight ?? product.backgroundColor;
  return light;
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

/** Per-tile illustration calibration — opacity decreases with depth */
const TILE_ILLUSTRATION_STYLES = [
  { scale: 1.15, objectPosition: '50% 15%', opacity: 0.75 },
  { scale: 1.15, objectPosition: '50% 20%', opacity: 0.70 },
  { scale: 1.1,  objectPosition: '50% 55%', opacity: 0.65 },
  { scale: 1.1,  objectPosition: '50% 22%', opacity: 0.60 },
  { scale: 1.1,  objectPosition: '50% 20%', opacity: 0.55 },
];

/** Square-grid tiles get high-impact illustration treatment (like library tiles) */
const SQUARE_TILE_ILLUSTRATION_STYLES = [
  { scale: 1.05, objectPosition: '50% 30%', opacity: 0.88 },
  { scale: 1.05, objectPosition: '50% 25%', opacity: 0.85 },
  { scale: 1.45, objectPosition: '50% 50%', opacity: 0.90 },
  { scale: 1.05, objectPosition: '50% 30%', opacity: 0.90 },
  { scale: 1.05, objectPosition: '50% 30%', opacity: 0.88 },
];

/** Per-product hero image vertical position — default is '50% 55%' */
const HERO_OBJECT_POSITION: Record<string, string> = {
  jag_i_varlden: '50% 35%',
};

const HERO_TOP_OFFSET: Record<string, string> = {
  jag_i_varlden: '-20vh',
};

/** Products that hide the hero illustration entirely */
const HIDE_HERO_PRODUCTS = new Set(['syskonkort']);

/* ── First uncompleted card per category hook ── */
function useFirstCardImages(product: ProductManifest, progress: KidsProductProgress) {
  const completedSet = useMemo(
    () => new Set(progress.recentlyCompletedCardIds),
    [progress.recentlyCompletedCardIds],
  );

  const firstCardIds = useMemo(
    () => product.categories.map(cat => {
      const catCards = product.cards.filter(c => c.categoryId === cat.id);
      const next = catCards.find(c => !completedSet.has(c.id));
      return (next ?? catCards[0])?.id ?? '';
    }),
    [product, completedSet],
  );

  // useCardImage must be called at top level, so we use up to 6 slots
  const img0 = useCardImage(firstCardIds[0] || '');
  const img1 = useCardImage(firstCardIds[1] || '');
  const img2 = useCardImage(firstCardIds[2] || '');
  const img3 = useCardImage(firstCardIds[3] || '');
  const img4 = useCardImage(firstCardIds[4] || '');
  const img5 = useCardImage(firstCardIds[5] || '');

  return useMemo(() => {
    const all = [img0, img1, img2, img3, img4, img5];
    return firstCardIds.map((_, i) => all[i] ?? undefined);
  }, [img0, img1, img2, img3, img4, img5, firstCardIds]);
}

/* ── Category Tile (ceramic treatment) ── */
function CategoryTile({
  cat,
  product,
  index,
  tileBg,
  tileImage,
  completed,
  total,
  isRecommended,
  isLocked = false,
  showLayerNumber = false,
  compactHeight = false,
  squareTile = false,
  wideSpan = false,
  fillHeight = false,
  glassTile = false,
  glassGlowColor,
  enlargeTiles = false,
}: {
  cat: { id: string; title: string; subtitle?: string };
  product: ProductManifest;
  index: number;
  tileBg: string;
  tileImage?: string;
  completed: number;
  total: number;
  isRecommended: boolean;
  isLocked?: boolean;
  showLayerNumber?: boolean;
  compactHeight?: boolean;
  squareTile?: boolean;
  wideSpan?: boolean;
  fillHeight?: boolean;
  glassTile?: boolean;
  glassGlowColor?: string;
  enlargeTiles?: boolean;
}) {
  const navigate = useNavigate();
  const styles = squareTile ? SQUARE_TILE_ILLUSTRATION_STYLES : TILE_ILLUSTRATION_STYLES;
  const style = styles[Math.min(index, styles.length - 1)];
  const shieldRgb = hexToRgb(tileBg);

    // Derive chromatic glow from tile background color
    const glowRgb = hexToRgb(tileBg);
    const chromaticGlow = glassGlowColor || `rgba(${glowRgb}, 0.22)`;

    return (
    <motion.button
      variants={tileVariants}
      whileHover={isLocked ? {} : { scale: 1.02, y: -2 }}
      whileTap={isLocked ? {} : { scale: 0.96, y: 2 }}
      onClick={() => !isLocked && navigate(`/product/${product.slug}/portal/${cat.id}`)}
      aria-label={`${cat.title}: ${completed} av ${total} utforskade`}
      aria-disabled={isLocked}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        ...(fillHeight ? { height: '100%' } : squareTile ? { aspectRatio: wideSpan ? '2 / 1' : (enlargeTiles ? '3 / 4' : '2 / 3') } : { minHeight: compactHeight ? '120px' : '140px' }),

        borderRadius: squareTile ? '28px' : '22px',
        cursor: isLocked ? 'default' : 'pointer',
        textAlign: 'left',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 35%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.10) 100%)',
        backgroundColor: 'rgba(15, 15, 15, 0.7)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        opacity: isLocked ? 0.6 : 1,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: [
          // Outer ceramic lift — dramatic depth stack
          '0 20px 60px rgba(0, 0, 0, 0.55)',
          '0 8px 24px rgba(0, 0, 0, 0.40)',
          '0 3px 8px rgba(0, 0, 0, 0.25)',
          // Chromatic glow underneath — product color bleed
          `0 14px 56px ${chromaticGlow}`,
          // Inner ceramic bevel — bright top edge
          'inset 0 2px 6px rgba(255, 255, 255, 0.35)',
          'inset 0 1px 1px rgba(255, 255, 255, 0.45)',
          // Inner depth — dark bottom edge for 3D lift
          'inset 0 -4px 12px rgba(0, 0, 0, 0.30)',
          'inset 0 -1px 2px rgba(0, 0, 0, 0.15)',
        ].join(', '),
        padding: 0,
        transition: 'opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* Layer number badge */}
      {showLayerNumber && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '12px',
            zIndex: 4,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: isLocked ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.22)',
            border: isLocked ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 700,
              color: isLocked ? 'rgba(255,255,255,0.45)' : LANTERN_GLOW,
              lineHeight: 1,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {index + 1}
          </span>
        </div>
      )}

      {/* Tile illustration layer */}
      {tileImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            transform: `scale(${style.scale})`,
            transformOrigin: 'center center',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <img
            src={tileImage}
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: style.objectPosition,
              opacity: style.opacity,
              filter: squareTile
                ? `saturate(1.35) brightness(1.2) drop-shadow(0 6px 16px rgba(0,0,0,0.5))`
                : `saturate(1.2) brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.4))`,
            }}
          />
        </div>
      )}

      {/* Chromatic inner glow — atmospheric warmth from product color */}
      {(
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `radial-gradient(ellipse 90% 80% at 50% 40%, ${chromaticGlow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Gradient shield for text readability — dark obsidian base */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: squareTile ? '60%' : '75%',
          background: 'linear-gradient(to top, rgba(10, 6, 2, 0.88) 0%, rgba(10, 6, 2, 0.72) 25%, rgba(10, 6, 2, 0.35) 55%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: squareTile ? '12px 14px' : '14px 16px',
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 17",
            fontSize: squareTile ? '16px' : '18px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            lineHeight: 1.2,
            display: 'block',
            textShadow: `0 1px 6px rgba(0,0,0,0.7), 0 0 16px rgba(${shieldRgb}, 0.8)`,
          }}
        >
          {cat.title}
        </span>
        {/* Progress: subtle bar + text */}
        {total > 0 && (
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px', height: '4px', borderRadius: '2px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{
                width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                height: '100%',
                borderRadius: '2px',
                backgroundColor: SAFFRON_FLAME,
                opacity: completed > 0 ? 1 : 0,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span
              style={{
                fontSize: squareTile ? '12px' : '13px',
                fontWeight: 600,
                color: completed > 0 ? SAFFRON_FLAME : LANTERN_GLOW,
                opacity: completed > 0 ? 0.9 : 0.45,
                lineHeight: 1.3,
                letterSpacing: '0.03em',
                textShadow: `0 1px 4px rgba(0,0,0,0.6)`,
              }}
            >
              {completed} av {total}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

/* ── Main Component ── */

export default function KidsProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const { space } = useCoupleSpaceContext();
  const progress = useKidsProductProgress(product);
  const tileImages = useFirstCardImages(product, progress);

  const bg = product.backgroundColor;
  const tileLight = product.tileLight ?? bg;
  const isSU = product.slug === 'still-us';
  const isVardag = product.id === 'vardagskort';
  const isSyskon = product.id === 'syskonkort';
  const useSquareGrid = true; // 2×2 grid for all products

  // ── Intro session completion state (Still Us only) ──
  const [introCompleted, setIntroCompleted] = useState(false);
  useEffect(() => {
    if (!isSU || !space?.id) return;
    let cancelled = false;
    supabase
      .from('couple_sessions')
      .select('id')
      .eq('couple_space_id', space.id)
      .eq('card_id', 'su-intro')
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setIntroCompleted(true);
      });
    return () => { cancelled = true; };
  }, [isSU, space?.id]);

  // Chromatic glow colors for Still Us glass tiles
  const SU_GLOW_COLORS: Record<string, string> = {
    'su-mock-vardagen':    'rgba(255, 140, 30, 0.25)',   // deep orange
    'su-mock-tillsammans': 'rgba(80, 220, 190, 0.22)',   // mint-teal
    'su-mock-grunden':     'rgba(255, 80, 160, 0.22)',   // neon-pink
    'su-mock-riktningen':  'rgba(50, 200, 120, 0.22)',   // emerald-green
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: bg }}>
      <ProductHomeBackButton color={LANTERN_GLOW} />

      {/* ── Atmospheric radial glow behind hero ── */}
      <div
        style={{
          position: 'absolute',
          top: '-8vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '160vw',
          height: '60vh',
          background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${tileLight}35 0%, ${tileLight}15 45%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Ghost glow — product-tinted atmospheric warmth behind title ── */}
      {isVardag && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '10vh',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120vw',
            height: '300px',
            background: 'radial-gradient(ellipse 55% 60% at 50% 40%, hsla(92, 40%, 60%, 0.14) 0%, hsla(92, 40%, 60%, 0.05) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* ── Hero illustration — large, atmospheric, bleeds off top ── */}
      {product.heroImage && !HIDE_HERO_PRODUCTS.has(product.id) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            top: HERO_TOP_OFFSET[product.id] ?? '-10vh',
            left: '-5vw',
            right: '-5vw',
            height: '65vh',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <img
            src={product.heroImage}
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: HERO_OBJECT_POSITION[product.id] ?? '50% 55%',
              filter: 'saturate(1.2) brightness(1.1)',
            }}
          />
          {/* Multi-stop scrim: product color blend */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '65%',
              background: `linear-gradient(to top, ${bg} 0%, ${bg}C0 12%, ${bg}70 30%, ${tileLight}25 50%, transparent 100%)`,
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}

      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: HIDE_HERO_PRODUCTS.has(product.id) ? 'clamp(24px, 6vh, 56px)' : 'clamp(32px, 10vh, 90px)',
          paddingRight: '16px',
          paddingBottom: '0px',
          paddingLeft: '16px',
        }}
      >
        {/* Title zone */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: 'center', width: '100%' }}
        >
          <motion.div variants={fadeUp}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px, 9.5vw, 50px)',
                fontWeight: 700,
                color: LANTERN_GLOW,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${bg}, 0 0 120px ${bg}`,
                fontVariationSettings: "'opsz' 36",
                margin: 0,
              }}
            >
              {product.name}
            </h1>
            <span
                className="font-serif"
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(14px, 4vw, 18px)',
                  fontWeight: 500,
                  color: LANTERN_GLOW,
                  marginTop: '10px',
                  padding: '5px 18px',
                  borderRadius: '20px',
                  background: `rgba(${hexToRgb(bg)}, 0.78)`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  letterSpacing: '0.02em',
                }}
              >
                {product.tagline}
              </span>


            {/* ── Still Us: Intro session — glass pill CTA or placeholder ── */}
            {isSU && (
              <motion.div
                variants={fadeUp}
                style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '24px', marginBottom: '8px', minHeight: '44px' }}
              >
                {!introCompleted ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    localStorage.setItem('bonki-last-active-product', product.slug);
                    navigate('/card/su-intro');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 26px',
                    background: 'rgba(18, 16, 12, 0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1.5px solid ${SAFFRON_FLAME}55`,
                    borderRadius: '100px',
                    cursor: 'pointer',
                    boxShadow: `0 4px 20px rgba(0,0,0,0.35), 0 0 24px ${SAFFRON_FLAME}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Play size={12} color={SAFFRON_FLAME} fill={SAFFRON_FLAME} strokeWidth={0} style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: LANTERN_GLOW,
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Börja här: <span style={{ opacity: 0.7 }}>Ert första samtal</span>
                  </span>
                </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    onClick={() => navigate('/card/su-intro?from=archive')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 16px',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: DRIFTWOOD,
                      letterSpacing: '0.02em',
                    }}>
                      Ert första samtal
                    </span>
                    <span style={{ fontSize: '10px', color: DRIFTWOOD, opacity: 0.5 }}>✓</span>
                  </motion.button>
                )}
              </motion.div>
            )}
            {/* Spacer — pushes content below hero face zone */}
            {!useSquareGrid && <div style={{ height: 'clamp(48px, 12vh, 100px)' }} />}

            {/* ═══ Resume Pill (conditional) ═══ */}
            {!progress.loading && progress.activeSession && progress.activeSession.cardId !== 'su-intro' && (() => {
              const card = product.cards.find(c => c.id === progress.activeSession!.cardId);
              if (!card) return null;
              const accentColor = product.tileLight ?? DEEP_SAFFRON;
              return (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                  onClick={() => navigate(`/card/${card.id}`, { state: { resumed: true } })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '16px 18px',
                    background: 'rgba(18, 16, 12, 0.55)',
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                    borderRadius: '16px',
                    border: `1px solid rgba(255, 255, 255, 0.06)`,
                    borderLeft: `3px solid ${accentColor}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 16px ${accentColor}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: DRIFTWOOD,
                      marginBottom: '3px',
                    }}>
                      Fortsätt där ni slutade
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: LANTERN_GLOW,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {card.title}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: DEEP_SAFFRON,
                      opacity: 0.7,
                      flexShrink: 0,
                      marginLeft: '12px',
                    }}
                  >
                    Fortsätt →
                  </span>
                </motion.button>
              );
            })()}
          </motion.div>
        </motion.div>

        {/* Small spacer before grid */}
        {useSquareGrid && <div style={{ flex: 1 }} />}
        {useSquareGrid && <div style={{ height: '8px' }} />}

        {/* Removed "Välj ett ämne" header — tiles speak for themselves */}

        {/* ═══ Category tiles ═══ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: useSquareGrid ? 'grid' : 'flex',
            ...(useSquareGrid
              ? {
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }
              : { flexDirection: 'column' as const, gap: '12px' }),
            width: '100%',
            marginBottom: '10vh',
          }}
        >
          {product.categories.map((cat, index) => {
            const tileBg = getTileColor(product, index, useSquareGrid);
            const catProgress = progress.categoryProgress[cat.id];
            const completed = catProgress?.completed ?? 0;
            const total = catProgress?.total ?? cat.cardCount ?? 0;
            const hasUncompleted = completed < total;

            // For sequential products: all preceding layers must be complete
            const allPrecedingComplete = product.categories
              .slice(0, index)
              .every(prev => {
                const p = progress.categoryProgress[prev.id];
                return p && p.completed >= p.total;
              });

            const isRecommended = hasUncompleted && allPrecedingComplete;

            // No lock — paid users get full access, numbering communicates order
            const isLocked = false;

            const isLastOdd = useSquareGrid && product.categories.length % 2 === 1 && index === product.categories.length - 1;

            return (
              <div
                key={cat.id}
                style={{
                  ...(isLastOdd ? { gridColumn: '1 / -1' } : {}),
                  
                }}
              >
                <CategoryTile
                  cat={cat}
                  product={product}
                  index={index}
                  tileBg={tileBg}
                  tileImage={tileImages[index]}
                  completed={completed}
                  total={total}
                  isRecommended={isRecommended}
                  isLocked={isLocked}
                  showLayerNumber={isSU}
                  compactHeight={false}
                  squareTile={useSquareGrid}
                  wideSpan={isLastOdd}
                  fillHeight={false}
                  glassTile={isSU}
                  glassGlowColor={isSU ? SU_GLOW_COLORS[cat.id] : undefined}
                  enlargeTiles={isSyskon}
                />
              </div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}
