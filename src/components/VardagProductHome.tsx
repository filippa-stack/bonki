import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-vardag.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#4DA8D4';

const ORDERED_TILES = [
  { id: 'vk-min-dag', bg: '#10607E', sub: 'Från morgon till kväll' },
  { id: 'vk-var-rytm', bg: '#0A4E68', sub: 'Vanor och rutiner' },
  { id: 'vk-vi-hemma', bg: '#063C52', sub: 'Allt som händer innanför dörren' },
  { id: 'vk-utanfor-hemmet', bg: '#042A3C', sub: 'Det du möter där ute' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function VardagProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color="#FDF6E3" />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.012, 1] }} transition={{ duration: 0.5, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', top: '-4%', right: '-25%', width: '130%', height: '155%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={illustrationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.22 }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(24px, 6vh, 64px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(36px, 10vw, 50px)', fontWeight: 700, color: '#FDF6E3', letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 40px rgba(10,74,106,0.5)', fontVariationSettings: "'opsz' 36" }}>
              Vardag
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: ACCENT_COLOR, opacity: 0.9, marginTop: '6px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
              Det vanliga, på djupet
            </p>
            <UnifiedResumeBanner product={product} kidsProgress={progress} accentColor={ACCENT_COLOR} />
            <NextConversationCard product={product} progress={progress} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1, minHeight: '16px', maxHeight: 'clamp(40px, 12vh, 120px)' }} />

        <CategoryTileGrid product={product} progress={progress} tiles={ORDERED_TILES} />
      </div>
    </div>
  );
}
