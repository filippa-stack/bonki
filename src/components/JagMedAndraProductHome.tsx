import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import BackToLibraryButton from '@/components/BackToLibraryButton';
import type { ProductManifest } from '@/types/product';
import slothImage from '@/assets/sloth-jag-med-andra.png';
import nyckelpiganImage from '@/assets/nyckelpiga-jag-med-andra.png';

const EASE = [0.4, 0.0, 0.2, 1] as const;

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

const ACCENT_COLOR = '#9825D6';

/** Ordered tiles — accent bar color per category */
const ORDERED_TILES: { id: string; accent: string; text: string }[] = [
  { id: 'jma-att-hora-till', accent: 'hsl(263, 52%, 62%)', text: 'hsl(263, 35%, 30%)' },
  { id: 'jma-nar-vi-jamfor-oss', accent: 'hsl(188, 35%, 45%)', text: 'hsl(188, 38%, 20%)' },
  { id: 'jma-nar-det-skaver', accent: 'hsl(0, 48%, 62%)', text: 'hsl(0, 32%, 28%)' },
  { id: 'jma-att-sta-stadig', accent: 'hsl(100, 28%, 44%)', text: 'hsl(100, 28%, 18%)' },
  { id: 'jma-vi-i-varlden', accent: 'hsl(33, 55%, 54%)', text: 'hsl(33, 45%, 22%)' },
];
const DIARY_COLOR = { bg: 'hsla(280, 25%, 88%, 0.45)', accent: 'hsl(280, 40%, 62%)', text: 'hsl(280, 50%, 35%)' };

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <BackToLibraryButton color={ACCENT_COLOR} />

      {/* Background illustration — sloth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: '-4%',
          left: '-40%',
          width: '160%',
          height: '130%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={slothImage}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left top', opacity: 0.35 }}
        />
      </motion.div>

      {/* Secondary illustration — nyckelpiga */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          position: 'absolute',
          bottom: '2%',
          right: '-25%',
          width: '55%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={nyckelpiganImage}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.35, transform: 'rotate(-30deg)' }}
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
          {/* Title */}
          <motion.div
            variants={titleVariants}
            style={{ textAlign: 'center', marginBottom: '2.5vh', width: '100%' }}
          >
            <h1
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(36px, 10vw, 50px)',
                fontWeight: 700,
                color: ACCENT_COLOR,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                textShadow: '0 0 32px rgba(152, 37, 214, 0.25), 0 0 64px rgba(152, 37, 214, 0.10), 0 2px 4px rgba(0,0,0,0.06)',
              }}
            >
              Jag med andra
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
              starkare tillsammans
            </p>
          </motion.div>

          {/* Category buttons — glass tiles */}
          {ORDERED_TILES.map((tile, index) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;

            const isFirst = index === 0;

            return (
              <motion.button
                key={cat.id}
                variants={pillVariants}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.975, y: 1 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  background: tile.bg,
                  borderRadius: '20px',
                  padding: '0 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid hsla(0, 0%, 100%, 0.45)',
                  boxShadow: [
                    '0 4px 20px hsla(0, 0%, 0%, 0.06)',
                    '0 1px 3px hsla(0, 0%, 0%, 0.04)',
                    `inset 0 1px 0 hsla(0, 0%, 100%, 0.5)`,
                  ].join(', '),
                  whiteSpace: 'normal' as const,
                  width: '84%',
                  minHeight: isFirst ? '72px' : '64px',
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
                    fontSize: 'clamp(20px, 5.5vw, 26px)',
                    fontWeight: 400,
                    color: tile.text,
                    textShadow: '0 1px 3px hsla(0, 0%, 100%, 0.6)',
                  }}
                >
                  {cat.title}
                </span>
              </motion.button>
            );
          })}

          {/* Sign-off line */}
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

          {/* Diary entrance */}
          <motion.button
            variants={pillVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: `${DIARY_COLOR.bg}88`,
              border: '1px solid rgba(160, 120, 180, 0.18)',
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
