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

/** Default per-tile crop/opacity — subtle atmospheric wash, NOT dominant */
const DEFAULT_TILE_CREATURE_STYLES: CreatureTileStyle[] = [
  { scale: 1.3, objectPosition: '25% 15%', opacity: 0.45 },
  { scale: 1.15, objectPosition: '75% 20%', opacity: 0.35 },
  { scale: 1.8, objectPosition: '50% 10%', opacity: 0.25 },
  { scale: 0.65, objectPosition: '50% 55%', opacity: 0.18 },
  { scale: 0.85, objectPosition: '80% 40%', opacity: 0.12 },
];

export interface CreatureTileStyle {
  scale: number;
  objectPosition: string;
  opacity: number;
}

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
  creatureTileStyles?: CreatureTileStyle[];
  /** Per-tile image overrides (index-matched to tiles). Takes priority over creatureImage. */
  tileImages?: (string | undefined)[];
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
  tileImage,
  creatureStyle,
}: {
  tile: TileConfig;
  product: ProductManifest;
  progress: KidsProductProgress;
  index: number;
  total: number;
  isOddLast: boolean;
  creatureImage?: string;
  tileImage?: string;
  creatureStyle: CreatureTileStyle;
}) {
  const navigate = useNavigate();
  const cat = product.categories.find((c) => c.id === tile.id);
  if (!cat) return null;

  const catProgress = progress.categoryProgress[cat.id];
  const isFirst = index === 0;
  const isDeep = index >= total - 2 && total > 2;
  const nameOpacity = isDeep ? 0.85 : 1;
  const subOpacity = isDeep ? 0.7 : 1;

  const shieldRgb = hexToRgb(tile.bg);

  const completed = catProgress?.completed ?? 0;
  const totalCards = catProgress?.total ?? 0;

  const ariaLabel = `${cat.title}: ${tile.sub}. ${completed} av ${totalCards} utforskade.`;


  return (
    <motion.button
      variants={tileVariants}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96, y: 2 }}
      onClick={() => navigate(`/product/${product.slug}/portal/${cat.id}`)}
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '22px',
        cursor: 'pointer',
        textAlign: 'left',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
        backgroundColor: tile.bg,
        border: isFirst ? `2px solid ${SAFFRON}` : '1.5px solid rgba(255, 255, 255, 0.25)',
        boxShadow: isFirst
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
        aspectRatio: isOddLast ? '2 / 1' : '1 / 1',
        ...(isOddLast ? { gridColumn: '1 / -1' } : {}),
      }}
    >
      {/* Tile illustration layer (z-index 1) — per-tile image or shared creature */}
      {(tileImage || creatureImage) && (
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
            src={tileImage || creatureImage}
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

      {/* Gradient shield (z-index 2) — 75% height for strong text readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '75%',
          background: `linear-gradient(to top, rgba(${shieldRgb}, 1) 0%, rgba(${shieldRgb}, 0.97) 25%, rgba(${shieldRgb}, 0.85) 45%, rgba(${shieldRgb}, 0.45) 70%, transparent 100%)`,
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
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
        >
          {cat.title}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#C8BFB4',
            opacity: subOpacity,
            lineHeight: 1.3,
            marginTop: '3px',
            display: 'block',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          {tile.sub}
        </span>

        {/* Progress: text counter */}
        {totalCards > 0 && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: completed > 0 ? SAFFRON : LANTERN,
              opacity: completed > 0 ? 0.85 : 0.3,
              marginTop: '6px',
              display: 'block',
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {completed} av {totalCards}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default function CategoryTileGrid({ product, progress, tiles, creatureImage, creatureTileStyles, tileImages }: CategoryTileGridProps) {
  const total = tiles.length;
  const isOdd = total % 2 !== 0;
  const styles = creatureTileStyles || DEFAULT_TILE_CREATURE_STYLES;

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
          tileImage={tileImages?.[index]}
          creatureStyle={styles[Math.min(index, styles.length - 1)]}
        />
      ))}
    </motion.div>
  );
}
