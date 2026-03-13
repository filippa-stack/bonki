import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import illustrationImage from '@/assets/illustration-sexualitet.png';
import ProductResumeBanner from '@/components/ProductResumeBanner';
import DiaryEntrance from '@/components/DiaryEntrance';

const EASE = [0.4, 0.0, 0.2, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.4 } },
};

const pillVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.93 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
};

const ACCENT_COLOR = '#AD5D65';
const DIARY_TEXT = '#6B3A3F';

/** Four-tone rose palette — warm, escalating weight */
const ORDERED_TILES = [
  {
    id: 'sex-min-identitet',
    // Clarity & Light — pale skin-tone pink
    bg: '#FFF2F3',
    text: '#6B3A3F',
    dark: false,
  },
  {
    id: 'sex-normer-och-paverkan',
    // Awareness — friendly blushing rose (hero)
    bg: '#FBB1B8',
    text: '#5A2A30',
    dark: false,
  },
  {
    id: 'sex-relation-och-ansvar',
    // Warmth & Pulse — deeper fleshy rose
    bg: '#E87A84',
    text: '#FAFAF0',
    dark: true,
  },
  {
    id: 'sex-skydd-och-makt',
    // Strength & Gravity — dried rose / clay anchor
    bg: '#AD5D65',
    text: '#FAFAF0',
    dark: true,
  },
];

export default function SexualitetProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Soft sun-glow — shared light logic with Still Us */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140%',
          height: '60%',
          background: 'radial-gradient(ellipse at center, hsla(41, 78%, 48%, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Background illustration — preserved position */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.012, 1] }}
        transition={{
          duration: 0.5,
          scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
        }}
        style={{ position: 'absolute', top: '-10%', right: '-25%', width: '130%', height: '135%', zIndex: 0, pointerEvents: 'none' }}
      >
        <img src={illustrationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right top', opacity: 0.22 }} />
      </motion.div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '10vh',
          paddingRight: '8vw',
          paddingBottom: '120px',
          paddingLeft: '8vw',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
          }}
        >
          {/* Title — white halo for contrast */}
          <motion.div
            variants={titleVariants}
            style={{ textAlign: 'center', marginBottom: '3vh', width: '100%' }}
          >
            <h1
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(36px, 10vw, 50px)',
                fontWeight: 700,
                color: ACCENT_COLOR,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                textShadow: [
                  '0 0 24px rgba(255, 255, 255, 1)',
                  '0 0 48px rgba(255, 255, 255, 0.7)',
                  '0 0 80px rgba(255, 255, 255, 0.4)',
                  '0 2px 4px rgba(0, 0, 0, 0.06)',
                ].join(', '),
              }}
            >
              Sexualitet
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(16px, 4.5vw, 20px)',
                fontWeight: 400,
                color: '#2C2420',
                opacity: 0.75,
                marginTop: '6px',
                textShadow: '0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.5)',
              }}
            >
              Närhet & respekt
            </p>
            <ProductResumeBanner product={product} accentColor={ACCENT_COLOR} />
          </motion.div>

          {/* Category tiles — solid, tactile, with rhythm */}
          {ORDERED_TILES.map((tile, index) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;

            const isHero = index === 0;
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
                  borderRadius: '22px',
                  padding: '0 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isDark
                    ? '1px solid hsla(355, 25%, 45%, 0.35)'
                    : '1px solid hsla(355, 30%, 85%, 0.60)',
                  boxShadow: isDark
                    ? [
                        '0 6px 20px hsla(355, 25%, 20%, 0.22)',
                        '0 2px 6px hsla(0, 0%, 0%, 0.10)',
                        'inset 0 1px 0 hsla(355, 35%, 65%, 0.30)',
                      ].join(', ')
                    : [
                        '0 6px 20px hsla(355, 30%, 50%, 0.10)',
                        '0 2px 6px hsla(0, 0%, 0%, 0.04)',
                        'inset 0 2px 1px hsla(355, 40%, 95%, 0.55)',
                        'inset 0 -2px 4px hsla(355, 20%, 30%, 0.06)',
                      ].join(', '),
                  whiteSpace: 'normal' as const,
                  backdropFilter: 'blur(20px) saturate(1.3)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                  width: isHero ? '86%' : '82%',
                  minHeight: isHero ? '76px' : '66px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: isHero ? 'clamp(21px, 5.8vw, 27px)' : 'clamp(19px, 5.2vw, 25px)',
                    fontWeight: 400,
                    color: tile.text,
                    textShadow: isDark ? 'none' : '0 1px 4px hsla(355, 30%, 90%, 0.8)',
                  }}
                >
                  {cat.title}
                </span>
              </motion.button>
            );
          })}

          {/* Sign-off */}
          <motion.p
            variants={pillVariants}
            className="font-serif"
            style={{
              fontSize: 'clamp(14px, 3.8vw, 16px)',
              fontStyle: 'italic',
              color: ACCENT_COLOR,
              opacity: 0.6,
              textAlign: 'center',
              lineHeight: 1.5,
              marginTop: '2.5vh',
              maxWidth: '85%',
              textShadow: '0 0 12px rgba(255,255,255,0.8)',
            }}
          >
            Välj det som känns rätt just nu.
          </motion.p>

          <DiaryEntrance productId={product.id} accentColor={ACCENT_COLOR} textColor={DIARY_TEXT} />
        </motion.div>
      </div>
    </div>
  );
}
