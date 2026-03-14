import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';
import KidsProductResumeBanner from '@/components/KidsProductResumeBanner';
import DiaryEntrance from '@/components/DiaryEntrance';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import CategoryProgressRing from '@/components/CategoryProgressRing';
import { BookOpen } from 'lucide-react';

const EASE = [0.4, 0.0, 0.2, 1] as const;

const ACCENT_COLOR = '#6B7A10';
const DIARY_TEXT = '#3E4421';
const SAFFRON = '#DA9D1D';

const ORDERED_TILES = [
  { id: 'jim-mina-kanslor', bg: '#D9E0A3', text: '#3E4124', sub: 'Att känna igen dem' },
  { id: 'jim-starka-kanslor', bg: '#A8AD82', text: '#3E4124', sub: 'När det blir mycket' },
  { id: 'jim-stora-kanslor', bg: '#8E944F', text: '#3E4124', sub: 'Känslor med många lager' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } } };
const pillVariants = { hidden: { opacity: 0, y: 26, scale: 0.93 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

/** Darken a hex color by mixing with black */
function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r * (1 - amount));
  const ng = Math.round(g * (1 - amount));
  const nb = Math.round(b * (1 - amount));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

/** Lighten a hex color by mixing with white */
function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r + (255 - r) * amount);
  const ng = Math.round(g + (255 - g) * amount);
  const nb = Math.round(b + (255 - b) * amount);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

/** Build the 3D tactile tile style for JIM tiles */
function buildTactileStyle(tileBg: string, isNextCategory: boolean) {
  const highlightEdge = lighten(tileBg, 0.55);
  const shadowEdge = darken(tileBg, 0.3);
  const deepShadow = darken(tileBg, 0.5);

  return {
    // Matte center surface
    background: `
      linear-gradient(180deg, ${tileBg} 0%, ${darken(tileBg, 0.06)} 100%)
    `,
    borderRadius: '24px',
    // 3D bevel via multi-layered border simulation
    border: isNextCategory
      ? `2.5px solid ${SAFFRON}CC`
      : `1px solid ${lighten(tileBg, 0.25)}`,
    boxShadow: [
      // --- Outer shadows (hoisted off background) ---
      `0 14px 36px -6px ${deepShadow}88`,
      `0 6px 14px -2px ${shadowEdge}66`,
      `0 2px 4px ${shadowEdge}44`,
      // --- Next-category glow ---
      isNextCategory ? `0 0 22px 0px ${SAFFRON}50, 0 0 40px -4px ${SAFFRON}30` : '',
      // --- Bevel: top/left highlight (glossy edge) ---
      `inset 0 3px 0 0 ${highlightEdge}`,
      `inset 3px 0 0 0 ${lighten(tileBg, 0.35)}88`,
      // --- Bevel: bottom/right shadow (grounding edge) ---
      `inset 0 -4px 0 0 ${shadowEdge}88`,
      `inset -3px 0 0 0 ${darken(tileBg, 0.15)}66`,
      // --- Inner shadow to ground text on matte surface ---
      `inset 0 2px 6px ${darken(tileBg, 0.2)}33`,
    ].filter(Boolean).join(', '),
  };
}

/** Shimmer keyframes name – injected once */
const SHIMMER_STYLE_ID = 'jim-tactile-shimmer';
if (typeof document !== 'undefined' && !document.getElementById(SHIMMER_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = SHIMMER_STYLE_ID;
  style.textContent = `
    @keyframes jim-shimmer {
      0%, 100% { opacity: 0; transform: translateX(-120%) rotate(25deg); }
      50% { opacity: 1; transform: translateX(120%) rotate(25deg); }
    }
    @keyframes jim-surface-breathe {
      0%, 100% { opacity: 0.03; }
      50% { opacity: 0.07; }
    }
  `;
  document.head.appendChild(style);
}

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();
  const progress = useKidsProductProgress(product);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      <ProductHomeBackButton color={ACCENT_COLOR} />
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: '140%', height: '60%', background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Background illustration — sits BENEATH tiles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.012, 1] }}
        transition={{ duration: 0.5, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }}
        style={{ position: 'absolute', top: '2%', left: '-42%', width: '135%', height: '125%', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={apaImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left top', opacity: 0.35 }} />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '8vh', paddingRight: '5vw', paddingBottom: '80px', paddingLeft: '5vw' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{ fontFamily: "'DM Serif Display', var(--font-serif)", fontSize: 'clamp(36px, 10vw, 50px)', fontWeight: 700, color: ACCENT_COLOR, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: ['0 0 24px rgba(255, 255, 255, 1)', '0 0 48px rgba(255, 255, 255, 0.7)', '0 0 80px rgba(255, 255, 255, 0.4)', '0 2px 4px rgba(0, 0, 0, 0.06)'].join(', ') }}>
              Jag i mig
            </h1>
            <p className="font-serif" style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 400, color: '#2C2420', opacity: 0.75, marginTop: '6px', textShadow: '0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.5)' }}>
              När känslor får ord
            </p>
            <KidsProductResumeBanner product={product} progress={progress} accentColor={ACCENT_COLOR} />
          </motion.div>
        </motion.div>

        <div style={{ flex: 1 }} />

        {/* ─── Tactile 3D Tile Grid ─── */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
            {ORDERED_TILES.map((tile, index) => {
              const cat = product.categories.find((c) => c.id === tile.id);
              if (!cat) return null;
              const catProgress = progress.categoryProgress[cat.id];
              const isNextCategory = progress.nextSuggestedCategoryId === cat.id;
              const isLastOdd = index === ORDERED_TILES.length - 1 && ORDERED_TILES.length % 2 === 1;
              const tactile = buildTactileStyle(tile.bg, isNextCategory);

              return (
                <motion.button
                  key={cat.id}
                  variants={pillVariants}
                  // Hover: lift up with shadow expansion
                  whileHover={{
                    scale: 1.045,
                    y: -4,
                    transition: { duration: 0.25, ease: EASE },
                  }}
                  // Press: depress into surface
                  whileTap={{
                    scale: 0.94,
                    y: 4,
                    transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] },
                  }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  style={{
                    ...tactile,
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    ...(isLastOdd
                      ? { gridColumn: '1 / -1', justifySelf: 'center', width: '65%', padding: '22px 20px' }
                      : { aspectRatio: '1 / 1' }),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    lineHeight: 1.15,
                  }}
                >

                  {/* Surface breathing texture */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '4px',
                      borderRadius: '20px',
                      background: `radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                      animation: 'jim-surface-breathe 5s ease-in-out infinite',
                      animationDelay: `${index * 0.7}s`,
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                  />

                  {/* Glossy bevel edge overlay — top arc */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '10%',
                      right: '10%',
                      height: '35%',
                      borderRadius: '24px 24px 50% 50%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                  />

                  {/* Text content — on top of matte surface */}
                  <span style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(17px, 4.8vw, 22px)',
                    fontWeight: 400,
                    color: tile.text,
                    padding: '0 2px',
                    position: 'relative',
                    zIndex: 1,
                    textShadow: `0 1px 2px rgba(255,255,255,0.4)`,
                  }}>
                    {cat.title}
                  </span>
                  <span style={{
                    fontSize: 'clamp(10px, 2.8vw, 12px)',
                    fontWeight: 500,
                    color: tile.text,
                    opacity: 0.65,
                    letterSpacing: '0.02em',
                    lineHeight: 1.3,
                    padding: '0 4px',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {tile.sub}
                  </span>
                  {catProgress && catProgress.completed > 0 && (
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <CategoryProgressRing completed={catProgress.completed} total={catProgress.total} color={tile.text} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* ─── Diary tile — book cover feel ─── */}
          <motion.div variants={pillVariants} style={{ width: '100%', marginTop: '4px' }}>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96, y: 2 }}
              onClick={() => navigate(`/diary/${product.id}`)}
              style={{
                position: 'relative',
                width: '72%',
                margin: '0 auto',
                display: 'block',
                cursor: 'pointer',
                padding: 0,
                border: 'none',
                background: 'transparent',
                borderRadius: '22px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: '22px',
                  // Paper/book-cover texture
                  background: `linear-gradient(168deg, ${ACCENT_COLOR}14 0%, ${ACCENT_COLOR}08 50%, ${ACCENT_COLOR}04 100%)`,
                  border: `1.5px solid ${ACCENT_COLOR}30`,
                  boxShadow: [
                    // Outer drop shadows
                    `0 8px 24px -4px ${ACCENT_COLOR}30`,
                    `0 3px 8px ${ACCENT_COLOR}18`,
                    `0 1px 3px rgba(0,0,0,0.06)`,
                    // Top highlight bevel
                    `inset 0 2px 0 rgba(255, 255, 255, 0.55)`,
                    `inset 2px 0 0 rgba(255, 255, 255, 0.2)`,
                    // Bottom shadow bevel
                    `inset 0 -3px 0 ${ACCENT_COLOR}18`,
                    `inset -2px 0 0 ${ACCENT_COLOR}10`,
                    // Inner surface shadow
                    `inset 0 1px 4px ${ACCENT_COLOR}12`,
                  ].join(', '),
                  padding: '16px 20px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Paper texture shimmer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '22px',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: `linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.08) 52%, transparent 65%)`,
                      animation: 'jim-shimmer 9s ease-in-out infinite',
                      animationDelay: '3s',
                    }}
                  />
                </div>

                {/* Book icon */}
                <motion.div
                  animate={{ rotate: [0, -5, 0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: `${ACCENT_COLOR}18`,
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <BookOpen size={22} strokeWidth={1.5} style={{ color: ACCENT_COLOR }} />
                </motion.div>

                {/* Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', position: 'relative', zIndex: 1 }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(16px, 4.2vw, 19px)',
                    fontWeight: 400,
                    color: DIARY_TEXT,
                    lineHeight: 1.2,
                    textShadow: '0 1px 2px rgba(255,255,255,0.3)',
                  }}>
                    Vår dagbok
                  </span>
                  <span style={{
                    fontSize: 'clamp(10px, 2.8vw, 12px)',
                    fontWeight: 500,
                    color: DIARY_TEXT,
                    opacity: 0.5,
                    lineHeight: 1.3,
                  }}>
                    Samlade tankar & minnen
                  </span>
                </div>

                <div style={{ marginLeft: 'auto', color: ACCENT_COLOR, opacity: 0.4, fontSize: '16px', fontWeight: 300, position: 'relative', zIndex: 1 }}>
                  ›
                </div>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
