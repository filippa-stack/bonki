import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import heroImage from '@/assets/illustration-jag-i-varlden.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';
import { useCardImage } from '@/hooks/useCardImage';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const BG = '#121C1E';
const ACCENT_COLOR = '#6A9A9E';
const TILE_LIGHT = '#344452';

const ORDERED_TILES = [
  { id: 'jiv-vem-ar-jag', bg: '#344452', sub: 'Det som formar dig inifrån' },
  { id: 'jiv-jag-och-andra', bg: '#2A3844', sub: 'Hur vi påverkar varandra' },
  { id: 'jiv-varlden-omkring-mig', bg: '#222E38', sub: 'Normer, press och frågor' },
  { id: 'jiv-vad-tror-jag-pa', bg: '#1A242E', sub: 'Värderingar och mening' },
];

// First card per category — used as tile illustrations
const FIRST_CARD_IDS = [
  'jiv-identitet',     // Vem är jag
  'jiv-vanskap',       // Jag & andra
  'jiv-social-media',  // Världen omkring mig
  'jiv-karlek',        // Vad tror jag på
];

// Per-tile illustration calibration — individually tuned for visual weight
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.15, objectPosition: '50% 15%', opacity: 0.45 },
  { scale: 1.15, objectPosition: '50% 18%', opacity: 0.38 },
  { scale: 1.1,  objectPosition: '50% 20%', opacity: 0.32 },
  { scale: 1.1,  objectPosition: '50% 18%', opacity: 0.28 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  const img0 = useCardImage(FIRST_CARD_IDS[0]);
  const img1 = useCardImage(FIRST_CARD_IDS[1]);
  const img2 = useCardImage(FIRST_CARD_IDS[2]);
  const img3 = useCardImage(FIRST_CARD_IDS[3]);
  const img4 = useCardImage(FIRST_CARD_IDS[4]);
  const tileImages = [img0 ?? undefined, img1 ?? undefined, img2 ?? undefined, img3 ?? undefined, img4 ?? undefined];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: BG }}>
      <ProductHomeBackButton color="#FDF6E3" />

      {/* ── Atmospheric radial glow ── */}
      <div
        style={{
          position: 'absolute',
          top: '-8vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '160vw',
          height: '60vh',
          background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${TILE_LIGHT}35 0%, ${TILE_LIGHT}15 45%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Hero illustration ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: '-18vh', left: '-5vw', right: '-5vw', height: '75vh', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% -10%' }} />
        {/* Multi-stop scrim: product color mid-blend, then Midnight Ink */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '90%',
          background: `linear-gradient(to top, ${BG} 0%, ${BG}F8 18%, rgba(18,28,30,0.92) 32%, rgba(24,36,38,0.6) 50%, rgba(30,44,46,0.25) 68%, rgba(38,56,58,0.08) 82%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(28px, 8vh, 80px)', paddingRight: '5vw', paddingBottom: '0px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(34px, 9.5vw, 50px)',
              fontWeight: 700,
              color: '#FDF6E3',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${BG}, 0 0 120px ${BG}`,
              fontVariationSettings: "'opsz' 36",
            }}>
              Jag i världen
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              color: ACCENT_COLOR,
              opacity: 0.9,
              marginTop: '6px',
              textShadow: `0 1px 16px rgba(0,0,0,0.8), 0 0 40px ${BG}, 0 0 80px ${BG}`,
            }}>
              Världen vidgas
            </p>
            {/* Spacer — pushes action cards below hero face zone */}
            <div style={{ height: 'clamp(56px, 14vh, 100px)' }} />
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1 }} />

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
