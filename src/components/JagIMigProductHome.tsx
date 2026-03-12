import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';

const EASE = [0.4, 0.0, 0.2, 1] as const;

/** Ordered tiles: bg, text color, dark flag, outer glow color */
const ORDERED_TILES: { id: string; bg: string; text: string; dark: boolean; glow: string }[] = [
  { id: 'jim-tryggheten-inuti', bg: '#CDD625', text: '#3A3D00', dark: false, glow: 'rgba(205,214,37,0.22)' },
  { id: 'jim-kanslorna-jag-bar', bg: '#CDD625', text: '#3A3D00', dark: false, glow: 'rgba(205,214,37,0.22)' },
  { id: 'jim-nar-det-gor-ont', bg: '#CDD625', text: '#3A3D00', dark: false, glow: 'rgba(205,214,37,0.22)' },
  { id: 'jim-jag-som-helhet', bg: '#CDD625', text: '#3A3D00', dark: false, glow: 'rgba(205,214,37,0.22)' },
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
          {/* Title with warm golden glow */}
          <motion.div
            variants={titleVariants}
            style={{ textAlign: 'center', marginBottom: '2.5vh', width: '100%' }}
          >
            <h1
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(40px, 12vw, 56px)',
                fontWeight: 700,
                color: ACCENT_COLOR,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                textShadow: 'none',
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

          {/* Category buttons — puffy candy-like glass tiles */}
          {ORDERED_TILES.map((tile, index) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;

            const isDark = tile.dark;
            const isFirst = index === 0;
            const isLightestTile = tile.id === 'jim-jag-som-helhet';

            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.965, y: 1 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: tile.bg,
                  borderRadius: '22px',
                  padding: '0 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(44, 36, 32, 0.08)',
                  whiteSpace: 'normal' as const,
                  width: '84%',
                  minHeight: isFirst ? '76px' : '68px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: 'clamp(20px, 5.5vw, 26px)',
                    fontWeight: 400,
                    color: tile.text,
                    textShadow: 'none',
                  }}
                >
                  {cat.title}
                </span>
              </motion.button>
            );
          })}

          {/* Sign-off line — tighter to tiles */}
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
              marginTop: '2vh',
              maxWidth: '85%',
            }}
          >
            Välj det som känns rätt just nu.
          </motion.p>

          {/* Diary entrance — soft, secondary, not dashed */}
          <motion.button
            variants={pillVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: `${DIARY_COLOR.bg}88`,
              border: '1px solid rgba(180, 160, 120, 0.18)',
              cursor: 'pointer',
              marginTop: '0.5vh',
              padding: '14px 24px',
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(44, 36, 32, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '60%',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <BookOpen size={16} style={{ color: DIARY_COLOR.text, opacity: 0.55, flexShrink: 0 }} />
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
