import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-syskon.png';
import KidsProductResumeBanner from '@/components/KidsProductResumeBanner';
import DiaryEntrance from '@/components/DiaryEntrance';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#4D908E';
const DIARY_TEXT = '#274C5E';
const SAFFRON = '#DA9D1D';

const ORDERED_TILES = [
  { id: 'sk-vi-blev-syskon', bg: '#E8F3F5', text: '#274C5E', dark: false },
  { id: 'sk-vi-ar-olika', bg: '#F5E9D3', text: '#3A2E1A', dark: false },
  { id: 'sk-delat-utrymme', bg: '#D4E2E0', text: '#274C5E', dark: false },
  { id: 'sk-er-relation', bg: '#C2D1D9', text: '#274C5E', dark: false },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function SyskonProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color={ACCENT_COLOR} />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.012, 1] }} transition={{ duration: 0.5, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', top: '0%', right: '-25%', width: '130%', height: '135%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={illustrationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.18 }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '14vh', paddingRight: '6vw', paddingBottom: '120px', paddingLeft: '6vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
          <motion.div variants={titleVariants} style={{ textAlign: 'center', marginBottom: '3vh', width: '100%' }}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(38px, 11vw, 52px)', fontWeight: 700, color: ACCENT_COLOR, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: ['0 0 24px rgba(255, 255, 255, 1)', '0 0 48px rgba(255, 255, 255, 0.7)', '0 0 80px rgba(255, 255, 255, 0.4)', '0 2px 4px rgba(0, 0, 0, 0.06)'].join(', ') }}>
              Syskon
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: '#2C2420', opacity: 0.75, marginTop: '6px', textShadow: '0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.5)' }}>
              Band för livet
            </p>
            <KidsProductResumeBanner product={product} progress={progress} accentColor={ACCENT_COLOR} />
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '92%' }}>
            {ORDERED_TILES.map((tile, index) => {
              const cat = product.categories.find((c) => c.id === tile.id);
              if (!cat) return null;
              const catProgress = progress.categoryProgress[cat.id];
              const isNextCategory = progress.nextSuggestedCategoryId === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  variants={pillVariants}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.94, y: 2 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  style={{
                    background: tile.bg,
                    borderRadius: '22px',
                    padding: '16px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    aspectRatio: '1 / 1',
                    border: isNextCategory
                      ? `2px solid ${SAFFRON}BB`
                      : '1.5px solid rgba(77, 144, 142, 0.14)',
                    boxShadow: [
                      isNextCategory ? `0 0 16px 0px ${SAFFRON}45, 0 0 32px -4px ${SAFFRON}25` : '',
                      '0 6px 20px rgba(77, 144, 142, 0.14)',
                      '0 2px 6px rgba(77, 144, 142, 0.07)',
                      'inset 0 2px 0 rgba(255, 255, 255, 0.55)',
                      'inset 0 -2px 4px rgba(77, 144, 142, 0.06)',
                    ].filter(Boolean).join(', '),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1.25,
                    position: 'relative',
                  }}
                >
                  <span style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(18px, 5vw, 23px)', fontWeight: 400, color: tile.text }}>
                    {cat.title}
                  </span>
                  {catProgress && catProgress.completed > 0 && (
                    <CategoryProgressRing completed={catProgress.completed} total={catProgress.total} color={tile.text} />
                  )}
                </motion.button>
              );
            })}
          </div>

          <motion.p variants={pillVariants} className="font-serif" style={{ fontSize: 'clamp(14px, 3.8vw, 16px)', fontStyle: 'italic', color: ACCENT_COLOR, opacity: 0.6, textAlign: 'center', lineHeight: 1.5, marginTop: '2.5vh', maxWidth: '85%', textShadow: '0 0 12px rgba(255,255,255,0.8)' }}>
            Välj det som känns rätt just nu.
          </motion.p>

          <DiaryEntrance productId={product.id} accentColor={ACCENT_COLOR} textColor={DIARY_TEXT} />
        </motion.div>
      </div>
    </div>
  );
}
