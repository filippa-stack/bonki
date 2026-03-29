import { motion } from 'framer-motion';
import type { ProductManifest } from '@/types/product';
import heroImage from '@/assets/illustration-sexualitet.png';
import creatureImage from '@/assets/creature-radjur.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryTileGrid from '@/components/CategoryTileGrid';
import type { CreatureTileStyle } from '@/components/CategoryTileGrid';
import { useNextCardImages } from '@/hooks/useNextCardImages';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const BG = '#1E1428';
const ACCENT_COLOR = '#D4A0B8';
const TILE_LIGHT = '#4A2E48';

const ORDERED_TILES = [
  { id: 'sex-min-identitet', bg: '#A8766D', sub: 'Vem du är och blir' },
  { id: 'sex-normer-och-paverkan', bg: '#8A5F57', sub: 'Det som formar oss' },
  { id: 'sex-relation-och-ansvar', bg: '#7A524B', sub: 'Att ta hand om sig själv och andra' },
  { id: 'sex-skydd-och-makt', bg: '#6E4A44', sub: 'Makt och sårbarhet' },
];

// Deer: huge dark eyes and ears. Tile 0 = face-dominant. Tile 1 ears extending.
const CREATURE_TILE_STYLES: CreatureTileStyle[] = [
  { scale: 1.1, objectPosition: '50% 20%', opacity: 0.6 },
  { scale: 1.1, objectPosition: '50% 20%', opacity: 0.55 },
  { scale: 1.1, objectPosition: '50% 15%', opacity: 0.5 },
  { scale: 1.1, objectPosition: '50% 25%', opacity: 0.45 },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function SexualitetProductHome({ product }: { product: ProductManifest }) {
  const progress = useKidsProductProgress(product);
  const tileImages = useNextCardImages(product, progress);

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
        style={{ position: 'absolute', top: '-8vh', left: '-5vw', right: '-5vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={heroImage} alt="" style={{ width: '1080px', height: '1350px', objectFit: 'cover', objectPosition: '50% 15%', opacity: 0.38, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
        {/* Extended scrim with smooth blend */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '85%',
          background: `linear-gradient(to top, ${BG}F0 0%, ${BG}E0 15%, ${BG}C0 35%, ${BG}80 55%, ${BG}40 70%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(32px, 10vh, 90px)', paddingRight: '5vw', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
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
              Sexualitet
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: 400,
              color: ACCENT_COLOR,
              opacity: 0.9,
              marginTop: '6px',
              textShadow: `0 1px 12px rgba(0,0,0,0.7), 0 0 30px ${BG}, 0 0 60px ${BG}, 0 4px 24px ${BG}`,
            }}>
              Kropp, gränser och identitet
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
