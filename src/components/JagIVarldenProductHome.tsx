import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import heroImage from '@/assets/illustration-jag-i-varlden.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';
import { useNextCardImages } from '@/hooks/useNextCardImages';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const BG = '#2B3D2B';
const ACCENT_COLOR = '#A8C78A';
const TILE_LIGHT = '#3A5232';

const ORDERED_TILES = [
  { id: 'jiv-vem-ar-jag', bg: '#B8CC38', sub: 'Det som formar dig inifrån' },
  { id: 'jiv-jag-och-andra', bg: '#C2D440', sub: 'Hur vi påverkar varandra' },
  { id: 'jiv-varlden-omkring-mig', bg: '#AABC30', sub: 'Normer, press och frågor' },
  { id: 'jiv-vad-tror-jag-pa', bg: '#B5CA35', sub: 'Värderingar och mening' },
];

// Per-tile illustration calibration — full opacity, prominent creatures
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.15, objectPosition: '50% 15%', opacity: 1 },
  { scale: 1.15, objectPosition: '50% 18%', opacity: 1 },
  { scale: 1.1,  objectPosition: '50% 20%', opacity: 1 },
  { scale: 1.1,  objectPosition: '50% 18%', opacity: 1 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);
  const tileImages = useNextCardImages(product, progress);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: BG }}>
      <ProductHomeBackButton color="#FDF6E3" />

      {/* ── Hero illustration — anchored bottom-right, peeking into frame ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={heroImage}
          alt=""
          style={{
            position: 'absolute',
            width: '110%',
            top: '15%',
            right: '-30%',
            opacity: 0.38,
          }}
        />
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
            {/* Spacer — reduced to bring tiles closer to title */}
            <div style={{ height: 'clamp(24px, 5vh, 48px)' }} />
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
