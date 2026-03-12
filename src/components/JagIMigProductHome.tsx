import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';

const EASE = [0.4, 0.0, 0.2, 1] as const;

/** Five-tone chartreuse palette */
const ORDERED_TILES = [
  {
    id: 'jim-tryggheten-inuti',
    // Electric Pear — The Hero
    bg: '#CDD625',
    text: '#3E4421',
    gradient: 'linear-gradient(168deg, #d4de3a 0%, #c5ce20 100%)',
  },
  {
    id: 'jim-kanslorna-jag-bar',
    // Lemon Silk — The Highlight
    bg: '#F2F89B',
    text: '#3E4421',
    gradient: 'linear-gradient(168deg, #f5faab 0%, #eef48e 100%)',
  },
  {
    id: 'jim-nar-det-gor-ont',
    // Sage Leaf — The Bridge
    bg: '#8A9A5B',
    text: '#FFFDF5',
    gradient: 'linear-gradient(168deg, #97a768 0%, #7e8e50 100%)',
  },
  {
    id: 'jim-jag-som-helhet',
    // Deep Moss — The Shadow
    bg: '#6B7213',
    text: '#FFFDF5',
    gradient: 'linear-gradient(168deg, #7a8220 0%, #5f660a 100%)',
  },
];

const ACCENT_COLOR = '#8A9A10';
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
          paddingTop: '14vh',
          paddingRight: '8vw',
          paddingBottom: '48px',
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
            gap: '13px',
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
                fontSize: 'clamp(40px, 12vw, 56px)',
                fontWeight: 700,
                color: ACCENT_COLOR,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                textShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.9)',
                  '0 0 40px rgba(255, 255, 255, 0.5)',
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
          </motion.div>

          {/* Category tiles — candy-glass with rhythm */}
          {ORDERED_TILES.map((tile, index) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;

            const isHero = index === 0;

            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.975, y: 1 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: tile.gradient,
                  borderRadius: '22px',
                  padding: '0 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid hsla(60, 60%, 90%, 0.60)',
                  boxShadow: [
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
                    textShadow: '0 1px 4px hsla(60, 60%, 90%, 0.8), 0 0 12px hsla(60, 50%, 95%, 0.5)',
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

          {/* Diary entrance — harmonized with citron palette */}
          <motion.button
            variants={pillVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: 'rgba(62, 68, 33, 0.12)',
              border: '1px solid rgba(62, 68, 33, 0.18)',
              cursor: 'pointer',
              marginTop: '0.5vh',
              padding: '14px 24px',
              borderRadius: '16px',
              boxShadow: [
                '0 4px 14px hsla(64, 40%, 40%, 0.06)',
                'inset 0 1px 0 hsla(60, 60%, 92%, 0.40)',
              ].join(', '),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '58%',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <BookOpen size={16} style={{ color: DIARY_TEXT, opacity: 0.50, flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', var(--font-serif)",
                  fontSize: 'clamp(15px, 4vw, 18px)',
                  fontWeight: 400,
                  color: DIARY_TEXT,
                  lineHeight: 1.3,
                }}
              >
                Vår dagbok
              </span>
              <p
                className="font-serif"
                style={{
                  fontSize: '11px',
                  color: 'hsl(64, 25%, 35%)',
                  opacity: 0.65,
                  marginTop: '1px',
                  fontStyle: 'italic',
                  lineHeight: 1.3,
                }}
              >
                Era tankar, samlade
              </p>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
