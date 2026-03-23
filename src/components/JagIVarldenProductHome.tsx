import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';
import { useNextCardImages } from '@/hooks/useNextCardImages';

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
  const tileImages = useNextCardImages(product, progress);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: BG }}>
      <ProductHomeBackButton color="#FDF6E3" />

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

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(24px, 6vh, 56px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(34px, 9.5vw, 50px)',
              fontWeight: 700,
              color: '#FDF6E3',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              textShadow: `0 2px 16px rgba(0,0,0,0.6), 0 0 60px ${BG}, 0 0 120px ${BG}`,
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
              textShadow: `0 1px 12px rgba(0,0,0,0.7), 0 0 30px ${BG}, 0 0 60px ${BG}, 0 4px 24px ${BG}`,
            }}>
              Världen vidgas
            </p>
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1, minHeight: '16px', maxHeight: 'clamp(24px, 6vh, 60px)' }} />

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
