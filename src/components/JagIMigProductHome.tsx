import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ProductManifest } from '@/types/product';
import apaImage from '@/assets/apa-jag-i-mig.png';
import ProductResumeBanner from '@/components/ProductResumeBanner';
import DiaryEntrance from '@/components/DiaryEntrance';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';

const EASE = [0.4, 0.0, 0.2, 1] as const;

const ACCENT_COLOR = '#6B7A10';
const DIARY_TEXT = '#3E4421';

/** Four-tone chartreuse palette — soft pastels */
const ORDERED_TILES = [
  {
    id: 'jim-tryggheten-inuti',
    bg: '#D9E0A3',
    text: '#3E4124',
  },
  {
    id: 'jim-kanslorna-jag-bar',
    bg: '#F0F2C8',
    text: '#3E4124',
  },
  {
    id: 'jim-nar-det-gor-ont',
    bg: '#A8AD82',
    text: '#3E4124',
  },
  {
    id: 'jim-jag-som-helhet',
    bg: '#8E944F',
    text: '#3E4124',
  },
];

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
      {/* Back button */}
      <ProductHomeBackButton color={ACCENT_COLOR} />
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
                  border: '1px solid hsla(66, 25%, 65%, 0.20)',
                  boxShadow: [
                    '0 2px 8px hsla(66, 30%, 25%, 0.05)',
                    '0 1px 2px hsla(66, 25%, 30%, 0.03)',
                    'inset 0 1px 0 hsla(60, 30%, 92%, 0.35)',
                  ].join(', '),
                  whiteSpace: 'normal' as const,
                  width: '84%',
                  minHeight: index === 0 ? '72px' : '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: index === 0 ? 'clamp(21px, 5.8vw, 27px)' : 'clamp(19px, 5.2vw, 25px)',
                    fontWeight: 400,
                    color: tile.text,
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
