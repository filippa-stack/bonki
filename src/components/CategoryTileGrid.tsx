/**
 * CategoryTileGrid — Illustration-backed category tiles for kids product home screens.
 * 2-column grid, portrait aspect ratio, gradient shield over image, progress dots.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const SAFFRON = '#E9B44C';
const LANTERN = '#FDF6E3';
const SUBTITLE_COLOR = '#998F82';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

export interface TileConfig {
  id: string;       // category ID
  bg: string;       // tile background color
  sub: string;      // subtitle text
}

interface CategoryTileGridProps {
  product: ProductManifest;
  progress: KidsProductProgress;
  tiles: TileConfig[];
}


function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

/** Individual tile — needs its own hook call for useCardImage */
function CategoryTile({
  tile,
  product,
  progress,
  index,
  total,
  isLast,
  isOddLast,
}: {
  tile: TileConfig;
  product: ProductManifest;
  progress: KidsProductProgress;
  index: number;
  total: number;
  isLast: boolean;
  isOddLast: boolean;
}) {
  const navigate = useNavigate();
  const cat = product.categories.find((c) => c.id === tile.id);
  if (!cat) return null;

  // Get first card in this category for illustration
  const firstCard = product.cards.find((c) => c.categoryId === cat.id);
  const imageUrl = useCardImage(firstCard?.id);

  const catProgress = progress.categoryProgress[cat.id];
  const isFirst = index === 0;
  const isDeep = index >= total - 2 && total > 2; // last 2 tiles are "deep"
  const nameOpacity = isDeep ? 0.85 : 1;
  const subOpacity = isDeep ? 0.7 : 1;
  const dotDimOpacity = isDeep ? 0.1 : 0.2;

  const shieldRgb = hexToRgb(tile.bg);
  const creatureRgb = hexToRgb(product.tileLight || '#333');

  const completed = catProgress?.completed ?? 0;
  const totalCards = catProgress?.total ?? 0;

  const ariaLabel = `${cat.title}: ${tile.sub}. ${completed} av ${totalCards} utforskade.`;

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
      {/* Illustration layer */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 55% 35%, rgba(${creatureRgb}, 0.3), transparent 55%)`,
          }}
        />
      )}

      {/* Gradient shield */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: `linear-gradient(0deg, rgba(${shieldRgb}, 0.95) 0%, rgba(${shieldRgb}, 0.7) 40%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px',
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
                  ...(dotIdx < completed ? {} : {}),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function CategoryTileGrid({ product, progress, tiles }: CategoryTileGridProps) {
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
          isLast={index === total - 1}
          isOddLast={isOdd && index === total - 1}
        />
      ))}
    </motion.div>
  );
}
