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

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import { useKidsProductProgress, type KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import NextActionBanner from '@/components/NextActionBanner';
import { ChevronRight } from 'lucide-react';
import {
  MIDNIGHT_INK,
  DEEP_DUSK,
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

function getTileColor(product: ProductManifest, _index: number, _isSquareGrid = false): string {
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
  { scale: 1.15, objectPosition: '50% 15%', opacity: 1 },
  { scale: 1.15, objectPosition: '50% 20%', opacity: 1 },
  { scale: 1.1,  objectPosition: '50% 55%', opacity: 1 },
  { scale: 1.1,  objectPosition: '50% 22%', opacity: 1 },
  { scale: 1.1,  objectPosition: '50% 20%', opacity: 1 },
];

/** Square-grid tiles get high-impact illustration treatment (like library tiles) */
const SQUARE_TILE_ILLUSTRATION_STYLES = [
  { scale: 1.05, objectPosition: '50% 30%', opacity: 1 },
  { scale: 1.05, objectPosition: '50% 25%', opacity: 1 },
  { scale: 1.1,  objectPosition: '50% 15%', opacity: 1 },
  { scale: 1.05, objectPosition: '50% 30%', opacity: 1 },
  { scale: 1.05, objectPosition: '50% 30%', opacity: 1 },
];

/** Per-product hero image vertical position — default is '50% 55%' */
const HERO_OBJECT_POSITION: Record<string, string> = {
  jag_i_varlden: '50% 35%',
  jag_i_mig: '50% 18%',
  jag_med_andra: '50% 30%',
  vardagskort: '50% 20%',
  syskonkort: '50% 25%',
  sexualitetskort: '50% 25%',
  still_us: '50% 40%',
};

const HERO_TOP_OFFSET: Record<string, string> = {
  jag_i_varlden: '-20vh',
  jag_i_mig: '-14vh',
  jag_med_andra: '-12vh',
  vardagskort: '-14vh',
  syskonkort: '-12vh',
  sexualitetskort: '-10vh',
  still_us: '-8vh',
};

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
}) {
  const navigate = useNavigate();
  const styles = squareTile ? SQUARE_TILE_ILLUSTRATION_STYLES : TILE_ILLUSTRATION_STYLES;
  const style = styles[Math.min(index, styles.length - 1)];
  const shieldRgb = hexToRgb(tileBg);

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
        ...(fillHeight ? { height: '100%' } : squareTile ? { aspectRatio: wideSpan ? '5 / 4' : '2 / 3' } : { minHeight: compactHeight ? '120px' : '140px' }),

        borderRadius: squareTile ? '38px' : '22px',
        cursor: isLocked ? 'default' : 'pointer',
        textAlign: 'left',
        backgroundColor: tileBg,
        opacity: isLocked ? 0.6 : 1,
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
        padding: 0,
        transition: 'opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
      }}
    >

      {/* Text overlay — bold text shadow only, no overlay */}
      {/* (Layer number now inline with title at bottom) */}

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
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
            }}
          />
        </div>
      )}


      {/* Bottom scrim for text readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65%',
          background: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)`,
          borderRadius: 'inherit',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Text overlay — bold text shadow only, no overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: squareTile ? '10px 14px' : '12px 16px',
          zIndex: 3,
        }}
      >
        {showLayerNumber && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1,
              marginBottom: '4px',
              display: 'block',
              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.5)',
              letterSpacing: '0.04em',
            }}
          >
            {index + 1}.
          </span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 24",
            fontSize: '24px',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1.2,
            display: 'block',
            textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.5)',
          }}
        >
          {cat.title}
        </span>
        {/* Progress: subtle bar + text */}
        {total > 0 && (
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '44px', height: '5px', borderRadius: '3px',
              backgroundColor: 'rgba(255,255,255,0.25)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{
                width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                height: '100%',
                borderRadius: '3px',
                backgroundColor: SAFFRON_FLAME,
                opacity: completed > 0 ? 1 : 0,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: completed > 0 ? SAFFRON_FLAME : '#FFFFFF',
                opacity: completed > 0 ? 0.9 : 0.7,
                lineHeight: 1.3,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                textShadow: `0 1px 4px rgba(0,0,0,0.7)`,
              }}
            >
              {completed}/{total} samtal
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
  
  const useSquareGrid = true; // 2×2 grid for all products





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


      {/* ── Hero illustration — large, atmospheric, bleeds off top ── */}
      {product.heroImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            top: HERO_TOP_OFFSET[product.id] ?? '-10vh',
            left: '-5vw',
            right: '-5vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          {product.id === 'vardagskort' ? (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '12%',
                left: '-35%',
                width: '120%',
                height: 'auto',
                opacity: 0.38,
                pointerEvents: 'none',
              }}
            />
          ) : product.id === 'jag_i_mig' ? (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '12%',
                left: '-35%',
                width: '120%',
                height: 'auto',
                opacity: 0.38,
                pointerEvents: 'none',
              }}
            />
          ) : product.id === 'jag_med_andra' ? (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-5%',
                right: '-30%',
                width: '110%',
                height: 'auto',
                opacity: 0.38,
                pointerEvents: 'none',
              }}
            />
          ) : product.id === 'jag_i_varlden' ? (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '15%',
                right: '-30%',
                width: '110%',
                height: 'auto',
                opacity: 0.38,
                pointerEvents: 'none',
              }}
            />
          ) : product.id === 'syskonkort' ? (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-5%',
                left: '-25%',
                width: '110%',
                height: 'auto',
                opacity: 0.38,
                pointerEvents: 'none',
              }}
            />
          ) : product.id === 'sexualitetskort' ? (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-5%',
                left: '-20%',
                width: '110%',
                height: 'auto',
                opacity: 0.38,
                pointerEvents: 'none',
              }}
            />
          ) : product.id === 'still_us' ? (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '5%',
                left: '-15%',
                width: '110%',
                height: 'auto',
                opacity: 0.38,
                pointerEvents: 'none',
              }}
            />
          ) : (
            <img
              src={product.heroImage}
              alt=""
              aria-hidden="true"
              style={{
                width: '1080px',
                height: '1350px',
                objectFit: 'cover',
                objectPosition: HERO_OBJECT_POSITION[product.id] ?? '50% 55%',
                opacity: 0.38,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          )}
          {/* Multi-stop scrim: product color blend — skip for Vardag */}
          {product.id !== 'vardagskort' && product.id !== 'jag_i_mig' && product.id !== 'jag_med_andra' && product.id !== 'jag_i_varlden' && product.id !== 'syskonkort' && product.id !== 'sexualitetskort' && product.id !== 'still_us' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90%',
                background: `linear-gradient(to top, ${bg}F0 0%, ${bg}E0 15%, ${bg}C0 35%, ${bg}80 55%, ${bg}40 70%, transparent 100%)`,
                pointerEvents: 'none',
              }}
            />
          )}
        </motion.div>
      )}

      {/* ── Top scrim for header text readability ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28vh',
          background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'clamp(32px, 10vh, 90px)',
          paddingRight: '16px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
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
             <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(15px, 4.2vw, 19px)',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: LANTERN_GLOW,
                  marginTop: '8px',
                  letterSpacing: '0.03em',
                  textShadow: [
                    `0 1px 3px rgba(0,0,0,0.9)`,
                    `0 2px 8px rgba(0,0,0,0.7)`,
                    `0 0 24px ${bg}`,
                    `0 0 48px ${bg}`,
                    `0 0 72px ${bg}`,
                  ].join(', '),
                }}
              >
                {product.tagline}
              </p>



            {/* Spacer — pushes content below hero face zone */}
            {!useSquareGrid && <div style={{ height: 'clamp(48px, 12vh, 100px)' }} />}

            {/* ═══ Next Action Banner (persistent) ═══ */}
            <NextActionBanner product={product} progress={progress} />
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
            display: 'grid',
            ...(useSquareGrid
              ? {
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }
              : { gridTemplateColumns: '1fr', gap: '12px' }),
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
                />
              </div>
            );
          })}
        </motion.div>


      </div>
    </div>
  );
}
