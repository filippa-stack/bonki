import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import heroImage from '@/assets/illustration-vardag.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';

// Card images — first card of each category
import imgMorgon from '/card-images/vk-morgon.png';
import imgHushall from '/card-images/vk-hushall.png';
import imgKvall from '/card-images/vk-kvall.png';
import imgSova from '/card-images/vk-sova.png';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const BG = '#0E2226';
const ACCENT_COLOR = '#5AAAB4';
const TILE_LIGHT = '#20484E';

const ORDERED_TILES = [
  { id: 'vk-min-dag', bg: '#20484E', sub: 'Från morgon till kväll' },
  { id: 'vk-var-rytm', bg: '#183A3E', sub: 'Vanor och rutiner' },
  { id: 'vk-vi-hemma', bg: '#122E32', sub: 'Allt som händer innanför dörren' },
  { id: 'vk-utanfor-hemmet', bg: '#102C30', sub: 'Det du möter där ute' },
];

// Per-tile card images (first card per category)
const TILE_IMAGES: (string | undefined)[] = [
  imgMorgon,   // Min dag
  imgKvall,    // Vår rytm
  imgHushall,  // Vi hemma
  imgSova,     // Utanför hemmet
];

// Optically calibrated per-tile — denser motifs get lower opacity
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.25, objectPosition: '50% 20%', opacity: 0.22 },  // Morgon – warm, detailed
  { scale: 1.15, objectPosition: '50% 25%', opacity: 0.18 },  // Kväll – moderate
  { scale: 1.3,  objectPosition: '50% 20%', opacity: 0.35 },  // Hushåll – punchy
  { scale: 1.2,  objectPosition: '50% 30%', opacity: 0.32 },  // Sova – punchy
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function VardagProductHome({ product }: { product: ProductManifest }) {
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
        {/* Extended 85% scrim with extra mid-stop for smooth blend */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '85%',
          background: `linear-gradient(to top, ${BG} 0%, ${BG}F2 18%, rgba(6,32,48,0.85) 35%, rgba(10,74,106,0.5) 60%, rgba(10,74,106,0.15) 80%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(32px, 10vh, 90px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            {/* Title with vignette-like text shadow for readability */}
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
              Vardag
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              color: ACCENT_COLOR,
              opacity: 0.9,
              marginTop: '6px',
              textShadow: `0 1px 12px rgba(0,0,0,0.7), 0 0 30px ${BG}, 0 0 60px ${BG}, 0 4px 24px ${BG}`,
            }}>
              Det vanliga, på djupet
            </p>
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        {/* Generous breathing room between action zone and grid */}
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
