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
const BG = '#A8E5C0';
const INK = '#2A1F1A';
const ACCENT_COLOR = '#8AAA72';

const ORDERED_TILES = [
  { id: 'vk-min-dag', bg: '#162C26', sub: 'Från morgon till kväll' },
  { id: 'vk-var-rytm', bg: '#10241E', sub: 'Vanor och rutiner' },
  { id: 'vk-vi-hemma', bg: '#0A1A18', sub: 'Allt som händer innanför dörren' },
  { id: 'vk-utanfor-hemmet', bg: '#071412', sub: 'Det du möter där ute' },
];

const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.25, objectPosition: '50% 20%', opacity: 0.22 },
  { scale: 1.15, objectPosition: '50% 25%', opacity: 0.18 },
  { scale: 1.3,  objectPosition: '50% 20%', opacity: 0.35 },
  { scale: 1.2,  objectPosition: '50% 30%', opacity: 0.32 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function VardagProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);
  const tileImages = useNextCardImages(product, progress);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: BG }}>
      <ProductHomeBackButton color={INK} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', paddingTop: 'clamp(32px, 10vh, 90px)', paddingRight: '5vw', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(36px, 10vw, 50px)',
              fontWeight: 700,
              color: INK,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              fontVariationSettings: "'opsz' 36",
            }}>
              Vardag
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              color: INK,
              opacity: 0.7,
              marginTop: '6px',
            }}>
              Det vanliga, på djupet
            </p>
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

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
