import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import heroImage from '@/assets/illustration-jag-i-mig.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';
import { useCardImage } from '@/hooks/useCardImage';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const BG = '#1A1A2E';
const ACCENT_COLOR = '#A8B84C';
const TILE_LIGHT = '#657514';

const ORDERED_TILES = [
  { id: 'jim-mina-kanslor', bg: '#657514', sub: 'Att känna igen dem' },
  { id: 'jim-starka-kanslor', bg: '#4A5A0A', sub: 'När det blir mycket' },
  { id: 'jim-stora-kanslor', bg: '#3E4A12', sub: 'Känslor med många lager' },
];

// First card per category — used as tile illustrations
const FIRST_CARD_IDS = [
  'jim-trygg',    // Mina känslor
  'jim-acklad',   // Starka känslor
  'jim-karlek',   // Stora känslor
];

// Card images are vivid illustrations — higher opacity than creature textures
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.1, objectPosition: '50% 20%', opacity: 0.6 },
  { scale: 1.1, objectPosition: '50% 20%', opacity: 0.55 },
  { scale: 1.1, objectPosition: '50% 20%', opacity: 0.5 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  // Load first card image per category dynamically from zip
  const img0 = useCardImage(FIRST_CARD_IDS[0]);
  const img1 = useCardImage(FIRST_CARD_IDS[1]);
  const img2 = useCardImage(FIRST_CARD_IDS[2]);
  const tileImages = [img0 ?? undefined, img1 ?? undefined, img2 ?? undefined];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: BG }}>
      <ProductHomeBackButton color="#FDF6E3" />

      {/* ── Atmospheric radial glow behind hero ── */}
      <div
        style={{
          position: 'absolute',
          top: '-5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140vw',
          height: '55vh',
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${TILE_LIGHT}30 0%, ${TILE_LIGHT}10 50%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Hero illustration ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: '-8vh', left: '-5vw', right: '-5vw', height: '65vh', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 15%' }} />
        {/* Soft bottom fade into BG */}
        <div style={{
          position: 'absolute', bottom: '-2px', left: '-20%', right: '-20%', height: '50%',
          background: `linear-gradient(to top, ${BG} 0%, ${BG}E6 30%, ${BG}80 60%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(28px, 8vh, 80px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(38px, 11vw, 54px)',
              fontWeight: 700,
              color: '#FDF6E3',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${BG}, 0 0 120px ${BG}`,
              fontVariationSettings: "'opsz' 36",
            }}>
              Jag i mig
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              color: ACCENT_COLOR,
              opacity: 0.9,
              marginTop: '6px',
              textShadow: `0 1px 16px rgba(0,0,0,0.8), 0 0 40px ${BG}, 0 0 80px ${BG}`,
            }}>
              När känslor får ord
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
          tileImages={tileImages}
          creatureTileStyles={CREATURE_TILE_STYLES}
        />
      </div>
    </div>
  );
}
