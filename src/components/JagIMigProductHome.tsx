import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import creatureImage from '@/assets/creature-lejon.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#A8B84C';

const ORDERED_TILES = [
  { id: 'jim-mina-kanslor', bg: '#657514', sub: 'Att känna igen dem' },
  { id: 'jim-starka-kanslor', bg: '#4A5A0A', sub: 'När det blir mycket' },
  { id: 'jim-stora-kanslor', bg: '#3E4A12', sub: 'Känslor med många lager' },
];

// Lion: golden hood + blue eyes are focal. Tile 0 & 2 should show eyes.
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.4, objectPosition: '45% 10%', opacity: 0.45 },
  { scale: 1.15, objectPosition: '70% 15%', opacity: 0.32 },
  { scale: 1.8, objectPosition: '45% 8%', opacity: 0.22 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1A1A2E' }}>
      <ProductHomeBackButton color="#FDF6E3" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45vh', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={creatureImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%' }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
          background: 'linear-gradient(to top, #1A1A2E 0%, rgba(26,26,46,0.95) 25%, rgba(62,74,18,0.7) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(24px, 6vh, 64px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(36px, 10vw, 50px)', fontWeight: 700, color: '#FDF6E3', letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 40px rgba(74,90,10,0.5)', fontVariationSettings: "'opsz' 36" }}>
              Jag i mig
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: ACCENT_COLOR, opacity: 0.9, marginTop: '6px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
              När känslor får ord
            </p>
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1, minHeight: '24px', maxHeight: 'clamp(40px, 12vh, 120px)' }} />

        <CategoryTileGrid product={product} progress={progress} tiles={ORDERED_TILES} creatureImage={creatureImage} creatureTileStyles={CREATURE_TILE_STYLES} />
      </div>
    </div>
  );
}
