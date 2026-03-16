import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import NextConversationCard from '@/components/NextConversationCard';

import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#A8B84C';
const SAFFRON = '#DA9D1D';
const LABEL_COLOR = '#998F82';

const ORDERED_TILES = [
  { id: 'jim-mina-kanslor', bg: '#566A10', sub: 'Att känna igen dem' },
  { id: 'jim-starka-kanslor', bg: '#3E4A12', sub: 'När det blir mycket' },
  { id: 'jim-stora-kanslor', bg: '#2A3406', sub: 'Känslor med många lager' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color="#FDF6E3" />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.012, 1] }}
        transition={{ duration: 0.5, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }}
        style={{ position: 'absolute', top: '8%', left: '-42%', width: '135%', height: '125%', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={apaImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left top', opacity: 0.35 }} />
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

        <div style={{ flex: 1, minHeight: '16px', maxHeight: 'clamp(40px, 12vh, 120px)' }} />

        {/* Category section label */}
        <div style={{ textAlign: 'left', marginBottom: '12px', paddingLeft: '4px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: LABEL_COLOR, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Alla kategorier
          </span>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
          {ORDERED_TILES.map((tile) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;
            const catProgress = progress.categoryProgress[cat.id];
            const isNextCategory = progress.nextSuggestedCategoryId === cat.id;

            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96, y: 2 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)`,
                  backgroundColor: tile.bg,
                  borderRadius: '22px',
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  minHeight: '88px',
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  lineHeight: 1.15,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
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
                  }}>
                    {tile.sub}
                  </span>
                </div>
                {catProgress && (
                  <span style={{
                    flexShrink: 0,
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: catProgress.completed > 0 ? '#E9B44C' : '#FDF6E380',
                    whiteSpace: 'nowrap',
                  }}>
                    {catProgress.completed} av {catProgress.total}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
