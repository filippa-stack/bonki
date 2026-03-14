import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-vardag.png';
import KidsProductResumeBanner from '@/components/KidsProductResumeBanner';
import DiaryEntrance from '@/components/DiaryEntrance';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#0F6B99';
const DIARY_TEXT = '#073B54';
const SAFFRON = '#DA9D1D';

const ORDERED_TILES = [
  { id: 'vk-min-dag', bg: '#E6F4F4', text: '#073B54' },
  { id: 'vk-var-rytm', bg: '#D4E9EC', text: '#073B54' },
  { id: 'vk-vi-hemma', bg: '#B8D8E0', text: '#073B54' },
  { id: 'vk-utanfor-hemmet', bg: '#9CBFC9', text: '#073B54' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function VardagProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color={ACCENT_COLOR} />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.012, 1] }} transition={{ duration: 0.5, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', top: '-4%', right: '-25%', width: '130%', height: '155%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={illustrationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.22 }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '8vh', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        {/* Title */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(38px, 11vw, 52px)', fontWeight: 700, color: ACCENT_COLOR, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: ['0 0 24px rgba(255, 255, 255, 1)', '0 0 48px rgba(255, 255, 255, 0.7)', '0 0 80px rgba(255, 255, 255, 0.4)', '0 2px 4px rgba(0, 0, 0, 0.06)'].join(', ') }}>
              Vardag
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: '#2C2420', opacity: 0.75, marginTop: '6px', textShadow: '0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.5)' }}>
              Hur vi har det
            </p>
            <KidsProductResumeBanner product={product} progress={progress} accentColor={ACCENT_COLOR} />
          </motion.div>
        </motion.div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Grid + Diary */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
            {ORDERED_TILES.map((tile) => {
              const cat = product.categories.find((c) => c.id === tile.id);
              if (!cat) return null;
              const catProgress = progress.categoryProgress[cat.id];
              const isNextCategory = progress.nextSuggestedCategoryId === cat.id;

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
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    aspectRatio: '1 / 1',
                    border: isNextCategory
                      ? `2.5px solid ${SAFFRON}CC`
                      : '1px solid rgba(15, 107, 153, 0.12)',
                    boxShadow: [
                      isNextCategory ? `0 0 18px 0px ${SAFFRON}50, 0 0 36px -4px ${SAFFRON}30` : '',
                      '0 10px 28px rgba(15, 107, 153, 0.14)',
                      '0 4px 10px rgba(15, 107, 153, 0.07)',
                      '0 1px 3px rgba(0, 0, 0, 0.04)',
                      'inset 0 2px 0 rgba(255, 255, 255, 0.65)',
                      'inset 0 -3px 8px rgba(15, 107, 153, 0.06)',
                    ].filter(Boolean).join(', '),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
