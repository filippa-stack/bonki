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
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } },
};

const pillVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.93 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const ACCENT_COLOR = '#9825D6';

/** 
 * Refined glass tiles — each with a unique hue, colored glow shadow,
 * and subtle size variation for visual hierarchy.
 */
const ORDERED_TILES = [
  {
    id: 'jma-att-hora-till',
    // Warm lavender glass
    bg: 'hsla(263, 45%, 72%, 0.28)',
    text: 'hsl(263, 42%, 30%)',
    glow: 'hsla(263, 50%, 60%, 0.18)',
    scale: 1.0, // Hero entry — slightly taller
  },
  {
    id: 'jma-nar-vi-jamfor-oss',
    // Cool teal glass
    bg: 'hsla(188, 35%, 55%, 0.24)',
    text: 'hsl(188, 42%, 22%)',
    glow: 'hsla(188, 40%, 50%, 0.15)',
    scale: 0.97,
  },
  {
    id: 'jma-nar-det-skaver',
    // Dusty rose glass
    bg: 'hsla(4, 48%, 72%, 0.26)',
    text: 'hsl(4, 38%, 28%)',
    glow: 'hsla(4, 45%, 65%, 0.16)',
    scale: 0.97,
  },
  {
    id: 'jma-att-sta-stadig',
    // Sage green glass
    bg: 'hsla(100, 25%, 52%, 0.24)',
    text: 'hsl(100, 32%, 20%)',
    glow: 'hsla(100, 28%, 48%, 0.14)',
    scale: 0.97,
  },
  {
    id: 'jma-vi-i-varlden',
    // Warm apricot glass
    bg: 'hsla(33, 55%, 65%, 0.26)',
    text: 'hsl(33, 48%, 22%)',
    glow: 'hsla(33, 50%, 58%, 0.16)',
    scale: 0.97,
  },
];

const DIARY_COLOR = { bg: 'hsla(280, 28%, 82%, 0.22)', text: 'hsl(280, 55%, 38%)' };

/** Gentle breathing animation for background illustrations */
const breathe = {
  scale: [1, 1.015, 1],
  transition: {
    duration: 8,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'reverse' as const,
  },
};

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <BackToLibraryButton color={ACCENT_COLOR} />

      {/* Atmospheric radial gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: [
            'radial-gradient(ellipse 80% 50% at 30% 20%, hsla(280, 40%, 75%, 0.12), transparent)',
            'radial-gradient(ellipse 60% 40% at 80% 80%, hsla(33, 50%, 70%, 0.08), transparent)',
          ].join(', '),
        }}
      />

      {/* Background illustration — sloth (breathing) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, ...breathe }}
        transition={{ duration: 0.6 }}
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
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left top', opacity: 0.32 }}
        />
      </motion.div>

      {/* Secondary illustration — nyckelpiga (breathing, offset phase) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, ...breathe }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
          style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.30, transform: 'rotate(-30deg)' }}
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
          paddingTop: '13vh',
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
            gap: '12px',
            width: '100%',
          }}
        >
          {/* Title */}
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
                  '0 0 40px rgba(152, 37, 214, 0.20)',
                  '0 0 80px rgba(152, 37, 214, 0.08)',
                  '0 2px 4px rgba(0,0,0,0.05)',
                ].join(', '),
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
                opacity: 0.70,
                marginTop: '6px',
                textShadow: '0px 1px 10px rgba(255,255,255,0.95), 0px 0px 28px rgba(255,255,255,0.5)',
              }}
            >
              starkare tillsammans
            </p>
          </motion.div>

          {/* Category buttons — glass tiles with colored glow */}
          {ORDERED_TILES.map((tile, index) => {
            const cat = product.categories.find((c) => c.id === tile.id);
            if (!cat) return null;

            const isHero = index === 0;

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
                  border: '1px solid hsla(0, 0%, 100%, 0.50)',
                  boxShadow: [
                    `0 8px 32px ${tile.glow}`,
                    '0 2px 8px hsla(0, 0%, 0%, 0.04)',
                    'inset 0 1px 0 hsla(0, 0%, 100%, 0.55)',
                    'inset 0 -1px 0 hsla(0, 0%, 0%, 0.03)',
                  ].join(', '),
                  whiteSpace: 'normal' as const,
                  width: isHero ? '86%' : `${82 - index * 0.5}%`,
                  minHeight: isHero ? '72px' : '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.3,
                  backdropFilter: 'blur(24px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                  transform: `scale(${tile.scale})`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: isHero ? 'clamp(21px, 5.8vw, 27px)' : 'clamp(19px, 5.2vw, 25px)',
                    fontWeight: 400,
                    color: tile.text,
                    textShadow: '0 1px 4px hsla(0, 0%, 100%, 0.65)',
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
              opacity: 0.55,
              textAlign: 'center',
              lineHeight: 1.5,
              marginTop: '2.5vh',
              maxWidth: '85%',
            }}
          >
            Välj det som känns rätt just nu.
          </motion.p>

          {/* Diary entrance — refined glass */}
          <motion.button
            variants={pillVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: DIARY_COLOR.bg,
              border: '1px solid hsla(280, 20%, 90%, 0.40)',
              cursor: 'pointer',
              marginTop: '0.5vh',
              padding: '14px 24px',
              borderRadius: '16px',
              boxShadow: [
                '0 6px 24px hsla(280, 30%, 50%, 0.08)',
                '0 1px 4px hsla(0, 0%, 0%, 0.03)',
                'inset 0 1px 0 hsla(0, 0%, 100%, 0.40)',
              ].join(', '),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '58%',
              backdropFilter: 'blur(20px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
            }}
          >
            <BookOpen size={16} style={{ color: DIARY_COLOR.text, opacity: 0.50, flexShrink: 0 }} />
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
                  opacity: 0.60,
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
