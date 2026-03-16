import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import heroImage from '@/assets/illustration-syskon.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';
import { useCardImage } from '@/hooks/useCardImage';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const BG = '#0A2826';
const ACCENT_COLOR = '#6ABFBD';
const TILE_LIGHT = '#247A78';

const ORDERED_TILES = [
  { id: 'sk-vi-blev-syskon', bg: '#247A78', sub: 'När familjen växer' },
  { id: 'sk-vi-ar-olika', bg: '#1A5A58', sub: 'Att vara egen fast vi hör ihop' },
  { id: 'sk-delat-utrymme', bg: '#0E4442', sub: 'När allting ska delas' },
  { id: 'sk-er-relation', bg: '#0A3432', sub: 'Nära, svårt och allt däremellan' },
];

// First card per category — used as tile illustrations
const FIRST_CARD_IDS = [
  'sk-att-fa-ett-syskon',  // Vi blev syskon
  'sk-unik',               // Vi är olika
  'sk-dela',               // Delat utrymme
  'sk-vanskap-relation',   // Er relation
];

// Optically calibrated per-tile
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.3, objectPosition: '45% 10%', opacity: 0.25 },
  { scale: 1.15, objectPosition: '55% 15%', opacity: 0.20 },
  { scale: 1.5, objectPosition: '40% 5%', opacity: 0.22 },
  { scale: 0.9, objectPosition: '50% 40%', opacity: 0.18 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function SyskonProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: BG }}>
      <ProductHomeBackButton color="#FDF6E3" />

      {/* ── Atmospheric radial glow behind hero ── */}
      <div
        style={{
          position: 'absolute',
          top: '-10vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120vw',
          height: '60vh',
          background: `radial-gradient(ellipse 70% 55% at 50% 40%, ${TILE_LIGHT}26 0%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Hero illustration ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: '-14vh', left: '-5vw', right: '-5vw', height: '70vh', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%' }} />
        {/* Extended scrim with smooth blend */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '85%',
          background: `linear-gradient(to top, ${BG} 0%, ${BG}F2 18%, rgba(10,40,38,0.85) 35%, rgba(26,90,88,0.5) 60%, rgba(26,90,88,0.15) 80%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(32px, 10vh, 90px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(36px, 10vw, 50px)',
              fontWeight: 700,
              color: '#FDF6E3',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              textShadow: `0 2px 16px rgba(0,0,0,0.6), 0 0 60px ${BG}, 0 0 120px ${BG}`,
              fontVariationSettings: "'opsz' 36",
            }}>
              Syskon
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              color: ACCENT_COLOR,
              opacity: 0.9,
              marginTop: '6px',
              textShadow: `0 1px 12px rgba(0,0,0,0.7), 0 0 30px ${BG}, 0 0 60px ${BG}, 0 4px 24px ${BG}`,
            }}>
              Band för livet
            </p>
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        {/* Generous breathing room */}
        <div style={{ flex: 1, minHeight: '32px', maxHeight: 'clamp(48px, 14vh, 130px)' }} />

        <CategoryTileGrid
          product={product}
          progress={progress}
          tiles={ORDERED_TILES}
          tileImages={TILE_IMAGES}
          creatureTileStyles={CREATURE_TILE_STYLES}
        />
      </div>
    </div>
  );
}
