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

import { useMemo, useRef, useEffect, useState } from 'react';
import CategoryFilterChips, { ALL_FILTER_KEY } from '@/components/CategoryFilterChips';
import ProductCardTile from '@/components/ProductCardTile';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import { useKidsProductProgress, type KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import NextActionBanner from '@/components/NextActionBanner';
import { ChevronRight } from 'lucide-react';
import {
  MIDNIGHT_INK,
  DEEP_DUSK,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
  BONKI_ORANGE,
} from '@/lib/palette';

/* ── Per-product page background (light, vibrant) ── */
const PAGE_BG: Record<string, string> = {
  jag_i_mig:       '#F2BC97',
  jag_med_andra:   '#E59FCF',
  jag_i_varlden:   '#D8E145',
  vardagskort:     '#A8E5C0',
  syskonkort:      '#E0BFEA',
  sexualitetskort: '#CFA08D',
  still_us:        '#E9C890',
};
const INK = '#2A1F1A';

/* ── Animation tokens ── */
const EASE = [0.4, 0.0, 0.2, 1] as const;
const containerVariants = {
  hidden: {},
  visible: {},
};
const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};
const tileVariants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1 },
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
          background: product.darkTextOnTile
            ? `linear-gradient(to top, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)`
            : `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)`,
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
              color: product.darkTextOnTile ? 'rgba(90,58,31,0.85)' : 'rgba(255,255,255,0.85)',
              lineHeight: 1,
              marginBottom: '4px',
              display: 'block',
              textShadow: product.darkTextOnTile
                ? '0 1px 2px rgba(255,255,255,0.4)'
                : '0 1px 3px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.5)',
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
            color: product.darkTextOnTile ? '#5A3A1F' : '#FFFFFF',
            lineHeight: 1.2,
            display: 'block',
            textShadow: product.darkTextOnTile
              ? '0 1px 2px rgba(255,255,255,0.45)'
              : '0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.5)',
          }}
        >
          {cat.title}
        </span>
        {/* Progress: subtle bar + text */}
        {total > 0 && (
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '44px', height: '5px', borderRadius: '3px',
              backgroundColor: product.darkTextOnTile ? 'rgba(90,58,31,0.25)' : 'rgba(255,255,255,0.25)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{
                width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                height: '100%',
                borderRadius: '3px',
                backgroundColor: product.darkTextOnTile ? '#5A3A1F' : SAFFRON_FLAME,
                opacity: completed > 0 ? 1 : 0,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: product.darkTextOnTile
                  ? '#5A3A1F'
                  : (completed > 0 ? SAFFRON_FLAME : '#FFFFFF'),
                opacity: completed > 0 ? 0.9 : 0.7,
                lineHeight: 1.3,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                textShadow: product.darkTextOnTile
                  ? '0 1px 2px rgba(255,255,255,0.4)'
                  : `0 1px 4px rgba(0,0,0,0.7)`,
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
  const progress = useKidsProductProgress(product);
  const hasRenderedContent = useRef(false);
  const [kontoOpen, setKontoOpen] = useState(false);

  useEffect(() => {
    hasRenderedContent.current = false;
  }, [product.id]);

  // Prefetch hero illustration so it's cached before portal navigation
  useEffect(() => {
    if (product.heroImage) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = product.heroImage;
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }
  }, [product.heroImage]);

  const bg = product.backgroundColor;
  const tileLight = product.tileLight ?? bg;
  const pageBg = PAGE_BG[product.id] ?? bg;
  const useSquareGrid = true;

  // Loading gate — prevent flash while progress resolves
  if (progress.loading && !hasRenderedContent.current) {
    return <div style={{ minHeight: '100vh', backgroundColor: pageBg }} />;
  }

  hasRenderedContent.current = true;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: pageBg }}
    >
      <ProductHomeBackButton color={INK} />
      <KontoIcon onClick={() => setKontoOpen(true)} />
      <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />


      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 36px), clamp(36px, 8vh, 70px))',
          paddingRight: '16px',
          paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
          paddingLeft: '16px',
        }}
      >
        {/* Title zone */}
        <motion.div
          variants={containerVariants}
          initial={false}
          animate="visible"
          style={{ textAlign: 'center', width: '100%' }}
        >
          <motion.div variants={fadeUp}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px, 9.5vw, 50px)',
                fontWeight: 700,
                color: INK,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                fontVariationSettings: "'opsz' 36",
                margin: 0,
              }}
            >
              {product.name}
            </h1>
             <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(17px, 4.6vw, 21px)',
                  fontWeight: 600,
                  color: INK,
                  opacity: 0.7,
                  marginTop: '8px',
                  letterSpacing: '0.03em',
                }}
              >
              {product.cards.length} samtal om {product.tagline.toLowerCase().replace(/\.$/, '')}.
              </p>


            {/* Spacer — pushes content below hero face zone */}
            {!useSquareGrid && <div style={{ height: 'clamp(28px, 7vh, 60px)' }} />}
          </motion.div>
        </motion.div>

        {/* ═══ Sticky header: resume banner + filter chips (no fill, blur only) ═══ */}
        <StickyFilterHeader
          product={product}
          progress={progress}
          tileLight={tileLight}
          pageBg={pageBg}
        />
      </div>
    </div>
  );
}

/* ── Sticky header + grid (separate component to scope filter state) ── */
function StickyFilterHeader({
  product,
  progress,
  tileLight,
  pageBg,
}: {
  product: ProductManifest;
  progress: KidsProductProgress;
  tileLight: string;
  pageBg: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set([ALL_FILTER_KEY]));

  const completedSet = useMemo(
    () => new Set([
      ...progress.recentlyCompletedCardIds,
      ...progress.allTimeCompletedCardIds,
    ]),
    [progress.recentlyCompletedCardIds, progress.allTimeCompletedCardIds],
  );

  const isCardVisible = (categoryId: string) =>
    selected.has(ALL_FILTER_KEY) || selected.has(categoryId);

  const visibleCount = useMemo(
    () => product.cards.filter((c) => isCardVisible(c.categoryId)).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.cards, selected],
  );

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          paddingTop: '6px',
          paddingBottom: '4px',
          marginLeft: '-16px',
          marginRight: '-16px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div style={{ marginBottom: '6px' }}>
          <NextActionBanner product={product} progress={progress} />
        </div>
        <CategoryFilterChips
          categories={product.categories.map((c) => ({ id: c.id, title: c.title }))}
          selected={selected}
          onChange={setSelected}
          accentHex={tileLight}
          totalVisible={visibleCount}
          underlineColor={BONKI_ORANGE}
          selectionMode="single"
        />
      </div>

      {/* Small spacer */}
      <div style={{ height: '8px' }} />

      {/* ═══ Card grid — all cards mount once, filter is opacity-only ═══ */}
      {visibleCount === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          Inga samtal i den här kategorin än.
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          width: '100%',
        }}
      >
        {product.cards.map((card, index) => {
          const visible = isCardVisible(card.categoryId);
          const tileBg = product.tileLight ?? product.backgroundColor;
          return (
            <FilterableCardCell
              key={card.id}
              visible={visible}
              enterDelay={visible ? Math.min(index, 12) * 0.03 : 0}
            >
              <ProductCardTile
                card={card}
                tileBg={tileBg}
                isCompleted={completedSet.has(card.id)}
                productSlug={product.slug}
                productId={product.id}
                positionIndex={index}
                pageBg={pageBg}
              />
            </FilterableCardCell>
          );
        })}
      </div>
    </>
  );
}

/* ── Filterable cell: keeps subtree mounted, animates opacity, then display:none ── */
function FilterableCardCell({
  visible,
  enterDelay,
  children,
}: {
  visible: boolean;
  enterDelay: number;
  children: React.ReactNode;
}) {
  const [domHidden, setDomHidden] = useState(!visible);

  // When becoming visible: clear display:none BEFORE animating in
  useEffect(() => {
    if (visible) setDomHidden(false);
  }, [visible]);

  return (
    <motion.div
      animate={visible ? 'shown' : 'hidden'}
      initial={false}
      variants={{
        shown: { opacity: 1 },
        hidden: { opacity: 0 },
      }}
      transition={{
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1],
        delay: visible ? enterDelay : 0,
      }}
      onAnimationComplete={(definition) => {
        if (definition === 'hidden') setDomHidden(true);
      }}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      style={{
        display: domHidden && !visible ? 'none' : 'block',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {children}
    </motion.div>
  );
}
