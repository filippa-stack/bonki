import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import slothImage from '@/assets/sloth-jag-med-andra.png';
import nyckelpiganImage from '@/assets/nyckelpiga-jag-med-andra.png';
import KidsProductResumeBanner from '@/components/KidsProductResumeBanner';
import DiaryEntrance from '@/components/DiaryEntrance';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#9825D6';
const DIARY_TEXT = '#240046';
const SAFFRON = '#DA9D1D';

const ORDERED_TILES = [
  { id: 'jma-att-hora-till', bg: '#F8E4EC', text: ACCENT_COLOR, sub: 'Att vara med' },
  { id: 'jma-nar-vi-jamfor-oss', bg: '#E8C8F0', text: '#7B1FA2', sub: 'Press & prestation' },
  { id: 'jma-nar-det-skaver', bg: '#F2D0C0', text: '#8E3A1A', sub: 'Bråk & misstag' },
  { id: 'jma-att-sta-stadig', bg: '#C8A8D8', text: '#4A148C', sub: 'Gränser & mod' },
  { id: 'jma-vi-i-varlden', bg: '#7E5C8E', text: '#F5F0F8', sub: 'Respekt & sanning' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color={ACCENT_COLOR} />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.015, 1] }} transition={{ duration: 0.6, scale: { duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', top: '-18%', left: '-24%', width: '140%', height: '110%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={slothImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left top', opacity: 0.32 }} />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.012, 1] }} transition={{ duration: 0.5, delay: 0.2, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', bottom: '0%', right: '-10%', width: '42%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={nyckelpiganImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.28, transform: 'rotate(-18deg)' }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '8vh', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(36px, 10vw, 50px)', fontWeight: 700, color: ACCENT_COLOR, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: ['0 0 24px rgba(255, 255, 255, 1)', '0 0 48px rgba(255, 255, 255, 0.7)', '0 0 80px rgba(255, 255, 255, 0.4)', '0 2px 4px rgba(0, 0, 0, 0.06)'].join(', ') }}>
              Jag med andra
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: '#2C2420', opacity: 0.75, marginTop: '6px', textShadow: '0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.5)' }}>
              Starkare tillsammans
            </p>
            <KidsProductResumeBanner product={product} progress={progress} accentColor={ACCENT_COLOR} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1 }} />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
            {ORDERED_TILES.map((tile, index) => {
              const cat = product.categories.find((c) => c.id === tile.id);
              if (!cat) return null;
              const catProgress = progress.categoryProgress[cat.id];
              const isNextCategory = progress.nextSuggestedCategoryId === cat.id;
              const isLastOdd = index === ORDERED_TILES.length - 1 && ORDERED_TILES.length % 2 === 1;
              const isDark = tile.bg === '#7E5C8E';

              return (
                <motion.button
                  key={cat.id}
                  variants={pillVariants}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.93, y: 3 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  style={{
                    background: tile.bg,
                    borderRadius: '22px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    ...(isLastOdd
                      ? { gridColumn: '1 / -1', justifySelf: 'center', width: '65%', padding: '22px 20px' }
                      : { aspectRatio: '1 / 1' }),
                    border: isNextCategory
                      ? `2.5px solid ${SAFFRON}CC`
                      : isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid hsla(345, 20%, 75%, 0.25)',
                    boxShadow: [
                      isNextCategory ? `0 0 18px 0px ${SAFFRON}50, 0 0 36px -4px ${SAFFRON}30` : '',
                      '0 10px 28px hsla(345, 20%, 40%, 0.14)',
                      '0 4px 10px hsla(345, 20%, 40%, 0.07)',
                      '0 1px 3px rgba(0, 0, 0, 0.04)',
                      isDark
                        ? 'inset 0 2px 0 rgba(255, 255, 255, 0.15), inset 0 -3px 8px rgba(0, 0, 0, 0.10)'
                        : 'inset 0 2px 0 hsla(345, 30%, 97%, 0.65), inset 0 -3px 8px hsla(345, 20%, 40%, 0.06)',
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
                    fontWeight: 400,
                    color: tile.text,
                    padding: '0 2px',
                  }}>
                    {cat.title}
                  </span>
                  <span style={{
                    fontSize: 'clamp(10px, 2.8vw, 12px)',
                    fontWeight: 500,
                    color: tile.text,
                    opacity: isDark ? 0.7 : 0.65,
                    letterSpacing: '0.02em',
                    lineHeight: 1.3,
                    padding: '0 4px',
                  }}>
                    {tile.sub}
                  </span>
                  {catProgress && catProgress.completed > 0 && (
                    <CategoryProgressRing completed={catProgress.completed} total={catProgress.total} color={tile.text} />
                  )}
                </motion.button>
              );
            })}
          </div>

          <DiaryEntrance productId={product.id} accentColor={ACCENT_COLOR} textColor={DIARY_TEXT} />
        </motion.div>
      </div>
    </div>
  );
}
