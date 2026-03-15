import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import peacockImage from '@/assets/peacock-jag-i-varlden.png';
import KidsProductResumeBanner from '@/components/KidsProductResumeBanner';

import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#6ABF78';

const SAFFRON = '#DA9D1D';

const ORDERED_TILES = [
  { id: 'jiv-min-vardag', bg: '#26602E', text: '#FDF6E3', sub: 'Det som fyller dina dagar' },
  { id: 'jiv-vem-jag-ar', bg: '#1E5026', text: '#FDF6E3', sub: 'Det som förändras just nu' },
  { id: 'jiv-jag-och-andra', bg: '#1A4420', text: '#FDF6E3', sub: 'Hur vi påverkar varandra' },
  { id: 'jiv-jag-i-samhallet', bg: '#14381A', text: '#FDF6E3', sub: 'Normer, rättvisa och din röst' },
  { id: 'jiv-det-stora-sammanhanget', bg: '#0E2C12', text: '#FDF6E3', sub: 'Bortom det du ser' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color="#FDF6E3" />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.015, 1] }} transition={{ duration: 0.6, scale: { duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', top: '-80%', right: '-40%', width: '140%', height: '130%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={peacockImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.28, transform: 'rotate(180deg)' }} />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.012, 1] }} transition={{ duration: 0.5, delay: 0.2, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', bottom: '-12%', left: '-40%', width: '140%', height: '130%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={peacockImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left bottom', opacity: 0.28 }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 'clamp(24px, 6vh, 64px)', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(36px, 10vw, 50px)', fontWeight: 700, color: '#FDF6E3', letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 40px rgba(26,74,36,0.5)' }}>
              Jag i världen
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: ACCENT_COLOR, opacity: 0.9, marginTop: '6px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
              De stora frågorna
            </p>
            <KidsProductResumeBanner product={product} progress={progress} accentColor={ACCENT_COLOR} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1, minHeight: '16px', maxHeight: 'clamp(40px, 12vh, 120px)' }} />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
            {ORDERED_TILES.map((tile, index) => {
              const cat = product.categories.find((c) => c.id === tile.id);
              if (!cat) return null;
              const catProgress = progress.categoryProgress[cat.id];
              const isNextCategory = progress.nextSuggestedCategoryId === cat.id;
              const isLastOdd = index === ORDERED_TILES.length - 1 && ORDERED_TILES.length % 2 === 1;

              return (
                <motion.button
                  key={cat.id}
                  variants={pillVariants}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.94, y: 3 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)`,
                    backgroundColor: tile.bg,
                    borderRadius: '22px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    ...(isLastOdd
                      ? { gridColumn: '1 / -1', justifySelf: 'center', width: '65%', padding: '22px 20px', minHeight: '120px' }
                      : { aspectRatio: '1 / 1' }),
                    border: isNextCategory
                      ? `2.5px solid ${SAFFRON}CC`
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: [
                      isNextCategory ? `0 0 18px 0px ${SAFFRON}50, 0 0 36px -4px ${SAFFRON}30` : '',
                      '0 10px 28px rgba(0, 0, 0, 0.25)',
                      '0 4px 10px rgba(0, 0, 0, 0.15)',
                      '0 1px 3px rgba(0, 0, 0, 0.08)',
                      'inset 0 3px 6px rgba(255, 255, 255, 0.15)',
                      'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
                    ].filter(Boolean).join(', '),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    lineHeight: 1.15,
                    position: 'relative',
                  }}
                >
                  <span style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(17px, 4.8vw, 22px)',
                    fontWeight: 700,
                    color: tile.text,
                    padding: '0 2px',
                  }}>
                    {cat.title}
                  </span>
                  <span style={{
                    fontSize: 'clamp(10px, 2.8vw, 12px)',
                    fontWeight: 600,
                    color: '#FFFDF8',
                    opacity: 0.9,
                    letterSpacing: '0.02em',
                    lineHeight: 1.3,
                    padding: '0 4px',
                  }}>
                    {tile.sub}
                  </span>
                  {catProgress && (
                    <CategoryProgressRing completed={catProgress.completed} total={catProgress.total} color={tile.text} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
