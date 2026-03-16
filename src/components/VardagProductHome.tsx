import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-vardag.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';

import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#4DA8D4';
const SAFFRON = '#DA9D1D';
const LABEL_COLOR = '#998F82';

const ORDERED_TILES = [
  { id: 'vk-min-dag', bg: '#10607E', sub: 'Från morgon till kväll' },
  { id: 'vk-var-rytm', bg: '#0A4E68', sub: 'Vanor och rutiner' },
  { id: 'vk-vi-hemma', bg: '#063C52', sub: 'Allt som händer innanför dörren' },
  { id: 'vk-utanfor-hemmet', bg: '#042A3C', sub: 'Det du möter där ute' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function VardagProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
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

        {/* Category section label */}
        <div style={{ textAlign: 'left', marginBottom: '12px', paddingLeft: '4px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: LABEL_COLOR, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Alla kategorier
          </span>
        </div>

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
                  whileTap={{ scale: 0.94, y: 3 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)`,
                    backgroundColor: tile.bg,
                    borderRadius: '22px',
                    padding: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    aspectRatio: '1 / 1',
                    minHeight: '130px',
                    border: isNextCategory
                      ? `2.5px solid ${SAFFRON}CC`
                      : '1.5px solid rgba(255, 255, 255, 0.30)',
                    boxShadow: [
                      isNextCategory ? `0 0 18px 0px ${SAFFRON}50, 0 0 36px -4px ${SAFFRON}30` : '',
                      '0 12px 32px rgba(0, 0, 0, 0.30)',
                      '0 4px 12px rgba(0, 0, 0, 0.18)',
                      '0 1px 3px rgba(0, 0, 0, 0.08)',
                      'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
                      'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
                    ].filter(Boolean).join(', '),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    lineHeight: 1.15,
                    position: 'relative',
                    paddingBottom: '32px',
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'opsz' 15",
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#FDF6E3',
                  }}>
                    {cat.title}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#FDF6E3B3',
                    letterSpacing: '0.02em',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {tile.sub}
                  </span>
                  {catProgress && (
                    <CategoryProgressRing completed={catProgress.completed} total={catProgress.total} color="#FDF6E3" />
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
