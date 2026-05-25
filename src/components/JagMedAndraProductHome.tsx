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
const BG = '#E59FCF';
const INK = '#2A1F1A';
const ACCENT_COLOR = '#D4A46C';

const ORDERED_TILES = [
  { id: 'jma-vem-ar-jag', bg: '#B07A3A', sub: 'Det som formar dig inifrån' },
  { id: 'jma-jag-och-andra', bg: '#8A6036', sub: 'Hur vi möter varandra' },
  { id: 'jma-varlden-omkring-mig', bg: '#7A5230', sub: 'Press och prestation' },
  { id: 'jma-vad-tror-jag-pa', bg: '#6A4828', sub: 'Värderingar och mod' },
];

const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.15, objectPosition: '50% 15%', opacity: 0.88 },
  { scale: 1.15, objectPosition: '50% 20%', opacity: 0.85 },
  { scale: 1.1,  objectPosition: '50% 18%', opacity: 0.82 },
  { scale: 1.1,  objectPosition: '50% 22%', opacity: 0.78 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);
  const tileImages = useNextCardImages(product, progress);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: BG }}>
      <ProductHomeBackButton color={INK} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', paddingTop: 'clamp(28px, 8vh, 80px)', paddingRight: '5vw', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(34px, 9.5vw, 50px)',
              fontWeight: 700,
              color: INK,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              fontVariationSettings: "'opsz' 36",
            }}>
              Jag med andra
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              color: INK,
              opacity: 0.7,
              marginTop: '6px',
            }}>
              Det trygga och det svåra
            </p>
            <div style={{ height: 'clamp(56px, 14vh, 100px)' }} />
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        <div style={{ height: '24px' }} />

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
