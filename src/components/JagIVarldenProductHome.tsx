import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import creatureImage from '@/assets/creature-orn.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#6ABF78';

const ORDERED_TILES = [
  { id: 'jiv-min-vardag', bg: '#2D6E3A', sub: 'Det som fyller dina dagar' },
  { id: 'jiv-vem-jag-ar', bg: '#1A4A24', sub: 'Det som förändras just nu' },
  { id: 'jiv-jag-och-andra', bg: '#2A3A1E', sub: 'Hur vi påverkar varandra' },
  { id: 'jiv-jag-i-samhallet', bg: '#1E2E16', sub: 'Normer, rättvisa och din röst' },
  { id: 'jiv-det-stora-sammanhanget', bg: '#162210', sub: 'Bortom det du ser' },
];

// Eagle: sharp profile and beak. Tile 0 = full head, tile 1 = body/feathers.
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.3, objectPosition: '55% 10%', opacity: 0.45 },
  { scale: 1.15, objectPosition: '40% 60%', opacity: 0.35 },
  { scale: 1.8, objectPosition: '60% 5%', opacity: 0.25 },
  { scale: 0.65, objectPosition: '50% 50%', opacity: 0.18 },
  { scale: 0.85, objectPosition: '80% 40%', opacity: 0.12 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
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
        <img src={creatureImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 15%' }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
          background: 'linear-gradient(to top, #1A1A2E 0%, rgba(26,26,46,0.95) 25%, rgba(26,74,36,0.7) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(24px, 6vh, 64px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(36px, 10vw, 50px)', fontWeight: 700, color: '#FDF6E3', letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 40px rgba(26,74,36,0.5)', fontVariationSettings: "'opsz' 36" }}>
              Jag i världen
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: ACCENT_COLOR, opacity: 0.9, marginTop: '6px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
              De stora frågorna
            </p>
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1, minHeight: '16px', maxHeight: 'clamp(40px, 12vh, 120px)' }} />

        <CategoryTileGrid product={product} progress={progress} tiles={ORDERED_TILES} creatureImage={creatureImage} creatureTileStyles={CREATURE_TILE_STYLES} />
      </div>
    </div>
  );
}
