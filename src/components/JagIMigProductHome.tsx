import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';

const EASE = [0.4, 0.0, 0.2, 1] as const;

/** Ordered tiles: bg, glass-overlay opacity, text color, whether it's a "dark" tile */
const ORDERED_TILES: { id: string; bg: string; text: string; dark: boolean }[] = [
  { id: 'jim-tryggheten-inuti', bg: '#8A9114', text: '#FFFDF5', dark: true },
  { id: 'jim-kanslorna-jag-bar', bg: '#E9EDC9', text: '#4A4820', dark: false },
  { id: 'jim-nar-det-gor-ont', bg: '#606C38', text: '#FFFDF5', dark: true },
  { id: 'jim-jag-som-helhet', bg: '#FEFAE0', text: '#6B6530', dark: false },
];
const DIARY_COLOR = { bg: '#F2E8CF', text: '#7A7040' };

const ACCENT_COLOR = '#8A9A10';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
};

const pillVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export default function JagIMigProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Background illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: '7%',
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
            gap: '14px',
            width: '100%',
          }}
        >
          {/* Title with warm glow */}
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
                textShadow: `0 0 40px rgba(138, 154, 16, 0.25), 0 0 80px rgba(138, 154, 16, 0.1)`,
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
                textShadow: '0px 1px 8px rgba(255,255,255,0.95), 0px 0px 24px rgba(255,255,255,0.5)',
              }}
            >
              när känslor får ord
            </p>
          </motion.div>

          {/* Category buttons — ordered, glassy, 3D */}
          {ORDERED_TILES.map((tile) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;

            const isDark = tile.dark;

            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.06, y: -4, boxShadow: isDark
                  ? `0 8px 28px rgba(44, 36, 32, 0.18), 0 2px 6px rgba(44, 36, 32, 0.12), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)`
                  : `0 8px 28px rgba(44, 36, 32, 0.14), 0 2px 6px rgba(44, 36, 32, 0.10), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.04)`
                }}
                whileTap={{ scale: 0.96, y: 1 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: isDark
                    ? `linear-gradient(175deg, ${tile.bg}e6 0%, ${tile.bg}cc 50%, ${tile.bg}b3 100%)`
                    : `linear-gradient(175deg, ${tile.bg}e6 0%, ${tile.bg}d9 50%, ${tile.bg}cc 100%)`,
                  borderRadius: '18px',
                  padding: '0 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.25)'
                    : '1.5px solid rgba(255,255,255,0.6)',
                  boxShadow: isDark
                    ? '0 6px 20px rgba(44, 36, 32, 0.14), 0 2px 4px rgba(44, 36, 32, 0.10), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.06)'
                    : '0 6px 20px rgba(44, 36, 32, 0.10), 0 2px 4px rgba(44, 36, 32, 0.06), inset 0 2px 0 rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.03)',
                  whiteSpace: 'normal' as const,
                  width: '84%',
                  minHeight: '68px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                  backdropFilter: 'blur(24px) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(20px, 5.5vw, 26px)',
                    fontWeight: 400,
                    color: tile.text,
                    textShadow: isDark
                      ? '0 1px 3px rgba(0,0,0,0.2)'
                      : '0 1px 2px rgba(255,255,255,0.8)',
                  }}
                >
                  {cat.title}
                </span>
              </motion.button>
            );
          })}

          {/* Sign-off line — more breathing room above */}
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
              marginTop: '3vh',
              maxWidth: '85%',
            }}
          >
            Välj det som känns rätt just nu.
          </motion.p>

          {/* Diary entrance — visually distinct from category tiles */}
          <motion.button
            variants={pillVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: `${DIARY_COLOR.bg}99`,
              border: '1px dashed rgba(138, 112, 64, 0.25)',
              cursor: 'pointer',
              marginTop: '1vh',
              padding: '14px 24px',
              borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(44, 36, 32, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '62%',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <BookOpen size={16} style={{ color: DIARY_COLOR.text, opacity: 0.6, flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontFamily: "'DM Serif Display', var(--font-serif)",
                  fontSize: 'clamp(15px, 4vw, 18px)',
                  fontWeight: 400,
                  color: DIARY_COLOR.text,
                  lineHeight: 1.3,
                }}
              >
                Vår dagbok
              </span>
              <p
                className="font-serif"
                style={{
                  fontSize: '11px',
                  color: '#8A8078',
                  opacity: 0.7,
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
