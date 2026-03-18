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
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
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

/* ── Helpers ── */
function getTileColor(product: ProductManifest, index: number): string {
  const depths = [product.tileLight, product.tileMid, product.tileDeep].filter(Boolean) as string[];
  if (depths.length === 0) return product.backgroundColor;
  return depths[index % depths.length];
}

function isLightTile(index: number): boolean {
  // First tile (Tile Light) gets dark text; rest get light text
  return index === 0;
}

export default function KidsProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  const bg = product.backgroundColor;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: bg }}>
      <ProductHomeBackButton color={LANTERN_GLOW} />

      {/* ═══ Zone 1: Identity Header (≤20vh) ═══ */}
      <div style={{ position: 'relative', height: '20vh', maxHeight: '180px', overflow: 'hidden' }}>
        {/* Hero illustration — cropped top ~60% */}
        {product.heroImage && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={product.heroImage}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-5%',
              width: '110%',
              height: '140%',
              objectFit: 'cover',
              objectPosition: '50% 15%',
              pointerEvents: 'none',
            }}
          />
        )}
        {/* Bottom scrim for text readability */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80%',
            background: `linear-gradient(to top, ${bg} 0%, ${bg}F0 30%, transparent 100%)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Product name + tagline — directly below header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1, marginTop: '-8px' }}
      >
        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {product.name}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            color: DRIFTWOOD,
            marginTop: '4px',
            margin: 0,
          }}
        >
          {product.tagline}
        </motion.p>
      </motion.div>

      {/* ═══ Zone 2: Resume Pill (conditional) ═══ */}
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
              width: 'calc(100% - 32px)',
              margin: '12px 16px 0',
              padding: '16px',
              background: DEEP_DUSK,
              borderRadius: '12px',
              border: 'none',
              borderLeft: `3px solid ${product.tileLight ?? DEEP_SAFFRON}`,
              cursor: 'pointer',
              textAlign: 'left',
              position: 'relative',
              zIndex: 1,
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

      {/* ═══ Zone 3: Category Selection ═══ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          padding: '0 16px',
          marginTop: '24px',
          position: 'relative',
          zIndex: 1,
          paddingBottom: '100px',
        }}
      >
        {/* Section header */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: DRIFTWOOD,
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Välj ett ämne
        </motion.p>

        {/* Category tiles — single column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {product.categories.map((cat, index) => {
            const tileBg = getTileColor(product, index);
            const isLight = isLightTile(index);
            const textColor = isLight ? MIDNIGHT_INK : LANTERN_GLOW;
            const catProgress = progress.categoryProgress[cat.id];
            const completed = catProgress?.completed ?? 0;
            const total = catProgress?.total ?? cat.cardCount ?? 0;
            const hasUncompleted = completed < total;

            // First category with uncompleted cards gets saffron left border
            const isRecommended = hasUncompleted && product.categories
              .slice(0, index)
              .every(prev => {
                const p = progress.categoryProgress[prev.id];
                return p && p.completed >= p.total;
              });

            return (
              <motion.button
                key={cat.id}
                variants={fadeUp}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  width: '100%',
                  height: '100px',
                  background: tileBg,
                  borderRadius: '14px',
                  border: 'none',
                  borderLeft: isRecommended ? `2px solid ${SAFFRON_FLAME}` : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: textColor,
                    lineHeight: 1.2,
                  }}
                >
                  {cat.title}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: textColor,
                    opacity: 0.7,
                  }}
                >
                  {completed} av {total} kort utforskade
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
