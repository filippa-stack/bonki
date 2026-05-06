/**
 * AdultProductHome — adult-product home (used only for Vårt Vi / still_us).
 *
 * Distinct register from KidsProductHome: deep dusk background, cornflower-
 * anchored color world, two-zone framed-portrait card tiles distributed
 * across a six-color anchor palette. Reuses CategoryFilterChips,
 * NextActionBanner, and progress hooks unchanged.
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import CategoryFilterChips, { ALL_FILTER_KEY } from '@/components/CategoryFilterChips';
import AdultProductCardTile from '@/components/AdultProductCardTile';
import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import { useKidsProductProgress, type KidsProductProgress } from '@/hooks/useKidsProductProgress';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import NextActionBanner from '@/components/NextActionBanner';
import {
  LANTERN_GLOW,
  CORNFLOWER,
  DEEP_DUSK_BG,
  MIDNIGHT_INK,
  DUSTY_ROSE,
  STORM_GREY,
  SAGE,
  WARM_GOLD,
} from '@/lib/palette';

const ADULT_ANCHOR_COLORS = [
  CORNFLOWER,
  MIDNIGHT_INK,
  DUSTY_ROSE,
  WARM_GOLD,
  STORM_GREY,
  SAGE,
];

/** Deterministic distribution: cycle through anchors, then swap any
 * adjacent collisions with the next non-conflicting anchor. */
function distributeColors(cardIds: string[], overrides: Record<string, string | undefined>): string[] {
  const result: string[] = cardIds.map((id, i) => overrides[id] ?? ADULT_ANCHOR_COLORS[i % ADULT_ANCHOR_COLORS.length]);
  for (let i = 1; i < result.length; i++) {
    if (overrides[cardIds[i]]) continue;
    if (result[i] === result[i - 1]) {
      // pick next anchor that doesn't equal previous
      const start = (ADULT_ANCHOR_COLORS.indexOf(result[i]) + 1) % ADULT_ANCHOR_COLORS.length;
      for (let off = 0; off < ADULT_ANCHOR_COLORS.length; off++) {
        const candidate = ADULT_ANCHOR_COLORS[(start + off) % ADULT_ANCHOR_COLORS.length];
        if (candidate !== result[i - 1]) {
          result[i] = candidate;
          break;
        }
      }
    }
  }
  return result;
}

export default function AdultProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);
  const hasRenderedContent = useRef(false);
  const [kontoOpen, setKontoOpen] = useState(false);

  useEffect(() => {
    hasRenderedContent.current = false;
  }, [product.id]);

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

  const bg = DEEP_DUSK_BG;
  const accent = CORNFLOWER;

  // Override product.tileLight to cornflower for chips + banner
  const adultProduct = useMemo<ProductManifest>(
    () => ({ ...product, tileLight: CORNFLOWER }),
    [product],
  );

  if (progress.loading && !hasRenderedContent.current) {
    return <div style={{ minHeight: '100vh', backgroundColor: bg }} />;
  }
  hasRenderedContent.current = true;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: bg }}>
      <ProductHomeBackButton color={LANTERN_GLOW} />
      <KontoIcon onClick={() => setKontoOpen(true)} />
      <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />

      {/* Atmospheric cool glow — evening sky */}
      <div
        style={{
          position: 'absolute',
          top: '-8vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '160vw',
          height: '60vh',
          background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${CORNFLOWER}30 0%, #1B2A6B22 45%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Hero illustration */}
      {product.heroImage && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            top: '-8vh',
            left: '-5vw',
            right: '-5vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Subtle backlight behind figures */}
          <div
            style={{
              position: 'absolute',
              top: '5%',
              left: '-5%',
              width: '70%',
              height: '60%',
              background:
                'radial-gradient(ellipse at 30% 35%, rgba(100,149,237,0.30), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
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
              opacity: 0.42,
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}

      {/* Top scrim */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28vh',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 20px), clamp(24px, 5.5vh, 52px))',
          paddingRight: '16px',
          paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
          paddingLeft: '16px',
        }}
      >
        {/* Title zone */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(34px, 9.5vw, 50px)',
              fontWeight: 700,
              color: LANTERN_GLOW,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${CORNFLOWER}66, 0 0 120px ${CORNFLOWER}44`,
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
              fontWeight: 500,
              fontStyle: 'italic',
              color: LANTERN_GLOW,
              opacity: 0.85,
              marginTop: '8px',
              letterSpacing: '0.03em',
              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)',
            }}
          >
            {product.cards.length} samtal om {product.tagline.toLowerCase().replace(/\.$/, '')}.
          </p>
          <div style={{ height: 'clamp(28px, 7vh, 60px)' }} />
        </div>

        <StickyFilterHeader product={adultProduct} progress={progress} accent={accent} />
      </div>
    </div>
  );
}

function StickyFilterHeader({
  product,
  progress,
  accent,
}: {
  product: ProductManifest;
  progress: KidsProductProgress;
  accent: string;
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

  const cardColors = useMemo(() => {
    const overrides: Record<string, string | undefined> = {};
    product.cards.forEach((c) => { overrides[c.id] = c.cardColor; });
    return distributeColors(product.cards.map((c) => c.id), overrides);
  }, [product.cards]);

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
          accentHex={accent}
          totalVisible={visibleCount}
          underlineColor={WARM_GOLD}
        />
      </div>

      <div style={{ height: '8px' }} />

      {visibleCount === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontStyle: 'italic',
            color: LANTERN_GLOW,
            opacity: 0.7,
          }}
        >
          Inga samtal i den här kategorin än.
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          width: '100%',
        }}
      >
        {product.cards.map((card, index) => {
          const visible = isCardVisible(card.categoryId);
          return (
            <FilterableCardCell
              key={card.id}
              visible={visible}
              enterDelay={visible ? Math.min(index, 12) * 0.03 : 0}
            >
              <AdultProductCardTile
                card={card}
                cardColor={cardColors[index]}
                isCompleted={completedSet.has(card.id)}
                productSlug={product.slug}
              />
            </FilterableCardCell>
          );
        })}
      </div>
    </>
  );
}

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
        minWidth: 0,
        width: '100%',
      }}
    >
      {children}
    </motion.div>
  );
}
