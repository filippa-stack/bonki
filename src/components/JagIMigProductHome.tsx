import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';
import ProductResumeBanner from '@/components/ProductResumeBanner';

const EASE = [0.4, 0.0, 0.2, 1] as const;

/** Five-tone chartreuse palette — solid, no gradients */
const ORDERED_TILES = [
  {
    id: 'jim-tryggheten-inuti',
    bg: '#E6E9A2',
    text: ACCENT_COLOR,
  },
  {
    id: 'jim-kanslorna-jag-bar',
    bg: '#F4F6C1',
    text: ACCENT_COLOR,
  },
  {
    id: 'jim-nar-det-gor-ont',
    bg: '#A8AD82',
    text: '#3E4421',
  },
  {
    id: 'jim-jag-som-helhet',
    bg: '#8E944F',
    text: '#2A2E14',
  },
];

const ACCENT_COLOR = '#6B7A10';
const DIARY_TEXT = '#3E4421';

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

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
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
      {/* Background illustration — breathing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.012, 1] }}
        transition={{
          duration: 0.5,
          scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
        }}
        style={{
          position: 'absolute',
          top: '2%',
          left: '-42%',
          width: '135%',
          height: '125%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={apaImage}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left top',
            opacity: 0.35,
          }}
        />
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
          {/* Title — lifted with white halo for contrast against illustration */}
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
              Jag i mig
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
              när känslor får ord
            </p>
            <ProductResumeBanner product={product} accentColor={ACCENT_COLOR} />
          </motion.div>

          {/* Category tiles — candy-glass with rhythm */}
          {ORDERED_TILES.map((tile, index) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;

            const isHero = index === 0;
            const isDark = 'dark' in tile && tile.dark;
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
                  border: isDark ? '1px solid hsla(66, 40%, 35%, 0.40)' : '1px solid hsla(60, 60%, 90%, 0.60)',
                  boxShadow: isDark
                    ? [
                        '0 6px 20px hsla(66, 40%, 10%, 0.18)',
                        '0 2px 6px hsla(0, 0%, 0%, 0.08)',
                        'inset 0 1px 0 hsla(66, 50%, 50%, 0.25)',
                      ].join(', ')
                    : [
                        '0 6px 20px hsla(64, 50%, 40%, 0.10)',
                        '0 2px 6px hsla(0, 0%, 0%, 0.04)',
                        'inset 0 2px 1px hsla(60, 80%, 95%, 0.55)',
                        'inset 0 -2px 4px hsla(64, 40%, 30%, 0.06)',
                      ].join(', '),
                  whiteSpace: 'normal' as const,
                  width: isHero ? '86%' : '82%',
                  minHeight: isHero ? '76px' : '66px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                  backdropFilter: 'blur(20px) saturate(1.3)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: isHero ? 'clamp(21px, 5.8vw, 27px)' : 'clamp(19px, 5.2vw, 25px)',
                    fontWeight: 400,
                    color: tile.text,
                    textShadow: isDark ? 'none' : '0 1px 4px hsla(60, 60%, 90%, 0.8), 0 0 12px hsla(60, 50%, 95%, 0.5)',
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

          {/* ✦ Diary entrance — ceremonial, magical */}
          <motion.div
            variants={pillVariants}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0px',
              marginTop: '1.5vh',
              width: '100%',
            }}
          >
            {/* Sparkle divider — Saffron golden thread (Bonki quality mark) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
              transition={{ opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.8, delay: 1.2 } }}
              style={{
                fontSize: '14px',
                color: 'var(--accent-saffron)',
                letterSpacing: '8px',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              ✦
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/diary/${product.id}`)}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '18px 28px',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '66%',
                overflow: 'hidden',
              }}
            >
              {/* Ambient glow behind */}
              <motion.div
                animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: '-20%',
                  background: `radial-gradient(ellipse at center, ${ACCENT_COLOR}22 0%, transparent 70%)`,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />

              {/* Glass surface */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '20px',
                  background: 'rgba(62, 68, 33, 0.06)',
                  border: '1px solid rgba(62, 68, 33, 0.10)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <motion.div
                  animate={{ rotate: [0, -5, 0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <BookOpen size={18} style={{ color: DIARY_TEXT, opacity: 0.55, flexShrink: 0 }} />
                </motion.div>
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(17px, 4.5vw, 20px)',
                    fontWeight: 400,
                    color: DIARY_TEXT,
                    lineHeight: 1.3,
                  }}
                >
                  Vår dagbok
                </span>
              </div>
              <p
                className="font-serif"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: '12px',
                  color: 'var(--accent-saffron)',
                  opacity: 0.55,
                  fontStyle: 'italic',
                  lineHeight: 1.3,
                  letterSpacing: '0.02em',
                }}
              >
                Era tankar, samlade ✦
              </p>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
