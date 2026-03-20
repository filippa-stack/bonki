/**
 * KidsProductHome — Shared product home for ALL 6 kids products.
 *
 * Replaces JagIMigProductHome, JagMedAndraProductHome, etc.
 * All product-specific values come from the ProductManifest.
 *
 * Layout per spec:
 *  1. Identity header (≤20% viewport): cropped hero + name + tagline
 *  2. Resume pill (conditional): Deep Dusk card for active session
 *  3. Category tiles: single-column, full-width, tile-depth colors
 *     WITH ceramic glow, illustration from first card per category
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
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
  { scale: 1.1, objectPosition: '50% 20%', opacity: 0.88 },
  { scale: 1.1, objectPosition: '50% 15%', opacity: 0.85 },
  { scale: 1.15, objectPosition: '50% 25%', opacity: 0.90 },
  { scale: 1.15, objectPosition: '50% 20%', opacity: 0.90 },
];

/* ── First card per category hook ── */
function useFirstCardImages(product: ProductManifest) {
  const firstCardIds = useMemo(
    () => product.categories.map(cat => {
      const firstCard = product.cards.find(c => c.categoryId === cat.id);
      return firstCard?.id ?? '';
    }),
    [product],
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
}) {
  const navigate = useNavigate();
  const isFirst = index === 0;
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
        ...(squareTile ? { aspectRatio: '3 / 4' } : { minHeight: compactHeight ? '120px' : '140px' }),

        borderRadius: squareTile ? '28px' : '22px',
        cursor: isLocked ? 'default' : 'pointer',
        textAlign: 'left',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
        backgroundColor: tileBg,
        opacity: isLocked ? 0.6 : 1,
        border: isFirst && !isLocked
          ? `2px solid ${SAFFRON_FLAME}`
          : isRecommended && !isLocked
            ? `2px solid ${SAFFRON_FLAME}88`
            : '1.5px solid rgba(255, 255, 255, 0.25)',
        boxShadow: isLocked
          ? '0 4px 12px rgba(0, 0, 0, 0.18), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
          : isFirst
            ? [
                '0 0 16px rgba(233, 180, 76, 0.45)',
                '0 0 4px rgba(233, 180, 76, 0.25)',
                '0 12px 32px rgba(0, 0, 0, 0.30)',
                '0 4px 12px rgba(0, 0, 0, 0.18)',
                'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
                'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
              ].join(', ')
            : [
                '0 12px 32px rgba(0, 0, 0, 0.30)',
                '0 4px 12px rgba(0, 0, 0, 0.18)',
                '0 1px 3px rgba(0, 0, 0, 0.08)',
                'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
                'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
              ].join(', '),
        padding: 0,
        transition: 'opacity 0.3s ease',
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
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: isLocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 700,
              color: isLocked ? 'rgba(255,255,255,0.4)' : LANTERN_GLOW,
              lineHeight: 1,
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

      {/* Inner glow for square tiles — atmospheric warmth behind illustration */}
      {squareTile && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `radial-gradient(ellipse 80% 70% at 50% 30%, rgba(${shieldRgb}, 0.15) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Gradient shield for text readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: squareTile ? '60%' : '75%',
          background: squareTile
            ? `linear-gradient(to top, rgba(${shieldRgb}, 1) 0%, rgba(${shieldRgb}, 0.95) 20%, rgba(${shieldRgb}, 0.7) 40%, rgba(${shieldRgb}, 0.2) 65%, transparent 100%)`
            : `linear-gradient(to top, rgba(${shieldRgb}, 1) 0%, rgba(${shieldRgb}, 0.97) 25%, rgba(${shieldRgb}, 0.85) 45%, rgba(${shieldRgb}, 0.45) 70%, transparent 100%)`,
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
        <span
          style={{
            fontSize: squareTile ? '11px' : '12px',
            fontWeight: 600,
            color: completed > 0 ? SAFFRON_FLAME : LANTERN_GLOW,
            opacity: completed > 0 ? 0.9 : 0.5,
            lineHeight: 1.3,
            marginTop: '3px',
            display: 'block',
            letterSpacing: '0.02em',
            textShadow: `0 1px 4px rgba(0,0,0,0.5)`,
          }}
        >
          {completed} av {total} kort utforskade
        </span>
      </div>
    </motion.button>
  );
}

/* ── Main Component ── */

export default function KidsProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);
  const tileImages = useFirstCardImages(product);

  const bg = product.backgroundColor;
  const tileLight = product.tileLight ?? bg;
  const isSU = product.slug === 'still-us-mock';
  const isVardag = product.id === 'vardagskort';
  const useSquareGrid = isVardag; // 2×2 memory card layout

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

      {/* ── Hero illustration — large, atmospheric, bleeds off top (skip for Still Us) ── */}
      {product.heroImage && !isSU && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            top: '-10vh',
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
              objectPosition: '50% 12%',
              filter: 'saturate(1.2) brightness(1.1)',
            }}
          />
          {/* Multi-stop scrim: product color blend — much lighter for Vardag */}
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
          paddingTop: isSU ? 'clamp(24px, 6vh, 56px)' : 'clamp(32px, 10vh, 90px)',
          paddingRight: '5vw',
          paddingBottom: '80px',
          paddingLeft: '5vw',
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
            {isSU ? (
              <p
                className="font-serif"
                style={{
                  fontSize: 'clamp(14px, 4vw, 18px)',
                  fontWeight: 500,
                  color: DRIFTWOOD,
                  opacity: 0.95,
                  marginTop: '6px',
                  textShadow: `0 2px 24px rgba(0,0,0,1), 0 0 60px ${bg}, 0 0 120px ${bg}`,
                }}
              >
                {product.tagline}
              </p>
            ) : (
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
            )}

            {/* Spacer — pushes content below hero face zone */}
            {!useSquareGrid && <div style={{ height: isSU ? 'clamp(12px, 2vh, 24px)' : 'clamp(48px, 12vh, 100px)' }} />}

            {/* ═══ Resume Pill (conditional) ═══ */}
            {!progress.loading && progress.activeSession && (() => {
              const card = product.cards.find(c => c.id === progress.activeSession!.cardId);
              if (!card) return null;
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
                    padding: '16px',
                    background: DEEP_DUSK,
                    borderRadius: '12px',
                    border: 'none',
                    borderLeft: `3px solid ${product.tileLight ?? DEEP_SAFFRON}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: LANTERN_GLOW,
                      lineHeight: 1.3,
                    }}
                  >
                    {card.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      color: DEEP_SAFFRON,
                      flexShrink: 0,
                      marginLeft: '12px',
                    }}
                  >
                    Fortsätt
                  </span>
                </motion.button>
              );
            })()}
          </motion.div>
        </motion.div>

        {/* Flex spacer — pushes grid to bottom for square-grid layouts */}
        {useSquareGrid && <div style={{ flex: 1, minHeight: '12px' }} />}

        {/* Removed "Välj ett ämne" header — tiles speak for themselves */}

        {/* ═══ Category tiles ═══ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: useSquareGrid ? 'grid' : 'flex',
            ...(useSquareGrid
              ? { gridTemplateColumns: '1fr 1fr', gap: '8px' }
              : { flexDirection: 'column' as const, gap: isSU ? '10px' : '12px' }),
            width: '100%',
            marginTop: isSU ? '16px' : undefined,
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

            return (
              <CategoryTile
                key={cat.id}
                cat={cat}
                product={product}
                index={index}
                tileBg={tileBg}
                tileImage={isSU && index === 2 ? undefined : tileImages[index]}
                completed={completed}
                total={total}
                isRecommended={isRecommended}
                isLocked={isLocked}
                showLayerNumber={isSU}
                compactHeight={isSU}
                squareTile={useSquareGrid}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
