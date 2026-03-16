/**
 * CategoryTileGrid — Illustration-backed category tiles for kids product home screens.
 * 2-column grid, portrait aspect ratio, gradient shield over creature image, progress dots.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const SAFFRON = '#E9B44C';
const LANTERN = '#FDF6E3';
const SUBTITLE_COLOR = '#998F82';

/** Per-tile crop/opacity values for the creature illustration */
const TILE_CREATURE_STYLES = [
  { scale: 1.3, objectPosition: '25% 15%', opacity: 0.95 },
  { scale: 1.15, objectPosition: '75% 20%', opacity: 0.8 },
  { scale: 1.8, objectPosition: '50% 10%', opacity: 0.6 },
  { scale: 0.65, objectPosition: '50% 55%', opacity: 0.35 },
  { scale: 0.85, objectPosition: '80% 40%', opacity: 0.2 },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

export interface TileConfig {
  id: string;
  bg: string;
  sub: string;
}

interface CategoryTileGridProps {
  product: ProductManifest;
  progress: KidsProductProgress;
  tiles: TileConfig[];
  creatureImage?: string;
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function CategoryTile({
  tile,
  product,
  progress,
  index,
  total,
  isOddLast,
  creatureImage,
}: {
  tile: TileConfig;
  product: ProductManifest;
  progress: KidsProductProgress;
  index: number;
  total: number;
  isOddLast: boolean;
  creatureImage?: string;
}) {
  const navigate = useNavigate();
  const cat = product.categories.find((c) => c.id === tile.id);
  if (!cat) return null;

  const catProgress = progress.categoryProgress[cat.id];
  const isFirst = index === 0;
  const isDeep = index >= total - 2 && total > 2;
  const nameOpacity = isDeep ? 0.85 : 1;
  const subOpacity = isDeep ? 0.7 : 1;
  const dotDimOpacities = [0.25, 0.2, 0.15, 0.1, 0.06];
  const dotDimOpacity = dotDimOpacities[Math.min(index, dotDimOpacities.length - 1)];

  const shieldRgb = hexToRgb(tile.bg);

  const completed = catProgress?.completed ?? 0;
  const totalCards = catProgress?.total ?? 0;

  const ariaLabel = `${cat.title}: ${tile.sub}. ${completed} av ${totalCards} utforskade.`;

  const creatureStyle = TILE_CREATURE_STYLES[Math.min(index, TILE_CREATURE_STYLES.length - 1)];

  return (
    <motion.button
      variants={tileVariants}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96, y: 2 }}
      onClick={() => navigate(`/category/${cat.id}`)}
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        backgroundColor: tile.bg,
        border: 'none',
        borderLeft: isFirst ? `3px solid ${SAFFRON}` : 'none',
        padding: 0,
        ...(isOddLast
          ? { gridColumn: '1 / -1', height: '170px' }
          : { aspectRatio: '0.7' }),
      }}
    >
      {/* Creature illustration layer (z-index 1) */}
      {creatureImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            transform: `scale(${creatureStyle.scale})`,
            transformOrigin: 'center center',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <img
            src={creatureImage}
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: creatureStyle.objectPosition,
              opacity: creatureStyle.opacity,
            }}
          />
        </div>
      )}

      {/* Gradient shield (z-index 2) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '55%',
          background: `linear-gradient(to top, rgba(${shieldRgb}, 0.97) 0%, rgba(${shieldRgb}, 0.88) 25%, rgba(${shieldRgb}, 0.45) 60%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Text overlay (z-index 3) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px',
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 17",
            fontSize: '17px',
            fontWeight: 600,
            color: LANTERN,
            opacity: nameOpacity,
            lineHeight: 1.2,
            display: 'block',
          }}
        >
          {cat.title}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 400,
            color: SUBTITLE_COLOR,
            opacity: subOpacity,
            lineHeight: 1.3,
            marginTop: '3px',
            display: 'block',
          }}
        >
          {tile.sub}
        </span>

        {/* Progress dots */}
        {totalCards > 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', marginTop: '8px' }}>
            {Array.from({ length: totalCards }).map((_, dotIdx) => (
              <div
                key={dotIdx}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: dotIdx < completed ? SAFFRON : `rgba(253, 246, 227, ${dotDimOpacity})`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function CategoryTileGrid({ product, progress, tiles, creatureImage }: CategoryTileGridProps) {
  const total = tiles.length;
  const isOdd = total % 2 !== 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        width: '100%',
        padding: '0 12px',
      }}
    >
      {tiles.map((tile, index) => (
        <CategoryTile
          key={tile.id}
          tile={tile}
          product={product}
          progress={progress}
          index={index}
          total={total}
          isOddLast={isOdd && index === total - 1}
          creatureImage={creatureImage}
        />
      ))}
    </motion.div>
  );
}
