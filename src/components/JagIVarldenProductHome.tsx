import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import peacockImage from '@/assets/peacock-jag-i-varlden.png';
import KidsProductResumeBanner from '@/components/KidsProductResumeBanner';
import DiaryEntrance from '@/components/DiaryEntrance';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const ACCENT_COLOR = '#3D7A45';
const DIARY_TEXT = '#2D4F32';
const SAFFRON = '#DA9D1D';

const ORDERED_TILES = [
  { id: 'jiv-min-vardag', bg: '#CDE6D2', text: '#3E4A40', dark: false },
  { id: 'jiv-vem-jag-ar', bg: '#F7F2ED', text: '#3E4A40', dark: false },
  { id: 'jiv-jag-och-andra', bg: '#E5D5C8', text: '#3E4A40', dark: false },
  { id: 'jiv-jag-i-samhallet', bg: '#BDD3C3', text: '#3E4A40', dark: false },
  { id: 'jiv-det-stora-sammanhanget', bg: '#8B948D', text: '#F5F2ED', dark: true },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

export default function JagIVarldenProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color={ACCENT_COLOR} />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.015, 1] }} transition={{ duration: 0.6, scale: { duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', top: '-80%', right: '-40%', width: '140%', height: '130%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={peacockImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.28, transform: 'rotate(180deg)' }} />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.012, 1] }} transition={{ duration: 0.5, delay: 0.2, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }} style={{ position: 'absolute', bottom: '-12%', left: '-40%', width: '140%', height: '130%', zIndex: 0, pointerEvents: 'none' }}>
        <img src={peacockImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left bottom', opacity: 0.28 }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '10vh', paddingRight: '8vw', paddingBottom: '120px', paddingLeft: '8vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
          <motion.div variants={titleVariants} style={{ textAlign: 'center', marginBottom: '3vh', width: '100%' }}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(36px, 10vw, 50px)', fontWeight: 700, color: ACCENT_COLOR, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: ['0 0 24px rgba(255, 255, 255, 1)', '0 0 48px rgba(255, 255, 255, 0.7)', '0 0 80px rgba(255, 255, 255, 0.4)', '0 2px 4px rgba(0, 0, 0, 0.06)'].join(', ') }}>
              Jag i världen
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: '#2C2420', opacity: 0.75, marginTop: '6px', textShadow: '0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.5)' }}>
              Stärk identitet och mod
            </p>
            <KidsProductResumeBanner product={product} progress={progress} accentColor={ACCENT_COLOR} />
          </motion.div>

          {ORDERED_TILES.map((tile, index) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;
            const catProgress = progress.categoryProgress[cat.id];
            const isNextCategory = progress.nextSuggestedCategoryId === cat.id;
            const allDone = catProgress?.allDone ?? false;
            const isHero = index === 0;
            const isLast = index === ORDERED_TILES.length - 1;
            const isDark = tile.dark;

            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.975, y: 1 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: tile.bg,
                  borderRadius: '20px',
                  padding: '0 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isNextCategory
                    ? `2px solid ${SAFFRON}BB`
                    : isHero ? '1.5px solid rgba(61, 122, 69, 0.22)' : isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(61, 122, 69, 0.10)',
                  boxShadow: [
                    isNextCategory ? `0 0 16px 0px ${SAFFRON}45, 0 0 32px -4px ${SAFFRON}25` : '',
                    isHero
                      ? '0 8px 28px rgba(61, 122, 69, 0.16), 0 3px 8px rgba(61, 122, 69, 0.08), inset 0 2px 0 rgba(255, 255, 255, 0.50), inset 0 -2px 4px rgba(61, 122, 69, 0.08)'
                      : `0 4px 16px rgba(61, 122, 69, 0.10), 0 1px 4px rgba(61, 122, 69, 0.06), ${isDark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 3px rgba(0, 0, 0, 0.08)' : 'inset 0 2px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 4px rgba(61, 122, 69, 0.06)'}`,
                  ].filter(Boolean).join(', '),
                  whiteSpace: isLast ? 'nowrap' as const : 'normal' as const,
                  width: '86%',
                  minHeight: isHero ? '72px' : '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                  position: 'relative',
                }}
              >
                <span style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: isHero ? 'clamp(22px, 6vw, 28px)' : isLast ? 'clamp(16px, 4.2vw, 20px)' : 'clamp(19px, 5.2vw, 25px)', fontWeight: 400, color: tile.text }}>
                  {cat.title}
                </span>
                {catProgress && catProgress.completed > 0 && (
                  <CategoryProgressRing completed={catProgress.completed} total={catProgress.total} color={tile.text} />
                )}
              </motion.button>
            );
          })}

          <motion.div variants={pillVariants} style={{ width: '16px', height: '1px', backgroundColor: ACCENT_COLOR, opacity: 0.20, borderRadius: '0.5px', marginTop: '2.5vh', marginBottom: '0.5vh' }} />

          <motion.p variants={pillVariants} className="font-serif" style={{ fontSize: 'clamp(14px, 3.8vw, 16px)', fontStyle: 'italic', color: ACCENT_COLOR, opacity: 0.6, textAlign: 'center', lineHeight: 1.5, maxWidth: '85%', textShadow: '0 0 12px rgba(255,255,255,0.8)' }}>
            Välj det som känns rätt just nu.
          </motion.p>

          <DiaryEntrance productId={product.id} accentColor={ACCENT_COLOR} textColor={DIARY_TEXT} />
        </motion.div>
      </div>
    </div>
  );
}
