/**
 * KidsProductHomeLayout — Two-zone layout for all kids product home screens.
 *
 * Zone 1: Illustration zone (top ~35vh) with creature at full strength + overlaid title.
 * Gradient bridge: Smooth transition from illustration to workspace.
 * Zone 2: Solid-color workspace with NextConversationCard, category label, and tile grid.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ProductManifest } from '@/types/product';
import type { KidsProductProgress } from '@/hooks/useKidsProductProgress';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import CategoryProgressRing from '@/components/CategoryProgressRing';
import { LANTERN_GLOW } from '@/lib/palette';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const LABEL_COLOR = '#998F82';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.2 } },
};
const pillVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.93 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } },
};
const titleVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface TileConfig {
  id: string;
  bg: string;
  sub: string;
}

interface KidsProductHomeLayoutProps {
  product: ProductManifest;
  progress: KidsProductProgress;
  title: string;
  subtitle: string;
  accentColor: string;
  tileLight: string;
  tileMid: string;
  tileDeep: string;
  orderedTiles: TileConfig[];
  /** The illustration content rendered inside Zone 1 */
  illustrationContent: ReactNode;
}

export default function KidsProductHomeLayout({
  product,
  progress,
  title,
  subtitle,
  accentColor,
  tileLight,
  tileMid,
  tileDeep,
  orderedTiles,
  illustrationContent,
}: KidsProductHomeLayoutProps) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: tileDeep }}>
      {/* ═══ ZONE 1: THE CREATURE'S WORLD ═══ */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '35vh',
          minHeight: '240px',
          maxHeight: '340px',
          overflow: 'hidden',
        }}
      >
        {/* Illustration fills the zone */}
        {illustrationContent}

        {/* Top-down gradient scrim for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 60%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Back button */}
        <ProductHomeBackButton color={LANTERN_GLOW} />

        {/* Title + subtitle overlay */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            position: 'absolute',
            top: '20%',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 2,
            padding: '0 16px',
          }}
        >
          <motion.div variants={titleVariants}>
            <h1
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: '32px',
                fontWeight: 600,
                color: LANTERN_GLOW,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: '15px',
                fontWeight: 400,
                color: `${LANTERN_GLOW}CC`, // 80% opacity
                marginTop: '4px',
                margin: '4px 0 0',
              }}
            >
              {subtitle}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══ GRADIENT BRIDGE ═══ */}
      <div
        style={{
          height: '50px',
          background: `linear-gradient(to bottom, ${hexToRgba(tileMid, 0.8)}, ${tileDeep})`,
        }}
      />

      {/* ═══ ZONE 2: THE WORKSPACE ═══ */}
      <div
        style={{
          backgroundColor: tileDeep,
          padding: '0 16px 120px 16px',
          position: 'relative',
        }}
      >
        {/* Resume banner (shown when active session exists) */}
        <UnifiedResumeBanner
          product={product}
          kidsProgress={progress}
          accentColor={accentColor}
        />

        {/* Nästa samtal card */}
        <NextConversationCard product={product} progress={progress} />

        {/* ALLA KATEGORIER label */}
        <div
          style={{
            textAlign: 'left',
            marginTop: '24px',
            marginBottom: '12px',
            paddingLeft: '0px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 600,
              color: LABEL_COLOR,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Alla kategorier
          </span>
        </div>

        {/* Category tile grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              width: '100%',
            }}
          >
            {orderedTiles.map((tile) => {
              const cat = product.categories.find((c) => c.id === tile.id);
              if (!cat) return null;
              const catProgress = progress.categoryProgress[cat.id];
              const isNextCategory = progress.nextSuggestedCategoryId === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  variants={pillVariants}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.94, y: 3 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.06) 100%)',
                    backgroundColor: tile.bg,
                    borderRadius: '14px',
                    padding: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    aspectRatio: '1 / 1',
                    minHeight: '130px',
                    border: isNextCategory
                      ? 'none'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    borderLeft: isNextCategory
                      ? `2px solid ${tileLight}`
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: [
                      '0 8px 24px rgba(0, 0, 0, 0.25)',
                      '0 2px 8px rgba(0, 0, 0, 0.15)',
                    ].join(', '),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    lineHeight: 1.15,
                    position: 'relative',
                    paddingBottom: '32px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Serif Display', var(--font-serif)",
                      fontSize: '15px',
                      fontWeight: 600,
                      color: LANTERN_GLOW,
                    }}
                  >
                    {cat.title}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 400,
                      color: `${LANTERN_GLOW}B3`, // 70% opacity
                      letterSpacing: '0.02em',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {tile.sub}
                  </span>
                  {catProgress && (
                    <CategoryProgressRing
                      completed={catProgress.completed}
                      total={catProgress.total}
                      color={LANTERN_GLOW}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
