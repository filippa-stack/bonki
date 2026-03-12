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

const ACCENT_COLOR = '#9825D6';

/** Five-tone amethyst palette — solid, matching JIM design philosophy */
const ORDERED_TILES = [
  {
    id: 'jma-att-hora-till',
    // Amethyst Prime — The Hero
    bg: '#9825D6',
    text: '#FAFAF0',
    dark: true,
  },
  {
    id: 'jma-nar-vi-jamfor-oss',
    // Moonlit Mist — The Breath
    bg: '#E2C2FF',
    text: '#3A1560',
    dark: false,
  },
  {
    id: 'jma-nar-det-skaver',
    // Orchid Flare — The Mid-tone
    bg: '#BD7BEE',
    text: '#FAFAF0',
    dark: true,
  },
  {
    id: 'jma-att-sta-stadig',
    // Royal Deep — The Support
    bg: '#5A189A',
    text: '#FAFAF0',
    dark: true,
  },
  {
    id: 'jma-vi-i-varlden',
    // Abyssal Purple — The Anchor
    bg: '#240046',
    text: '#FAFAF0',
    dark: true,
  },
];

const DIARY_TEXT = '#240046';

export default function JagMedAndraProductHome({ product }: { product: ProductManifest }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <BackToLibraryButton color={ACCENT_COLOR} />

      {/* Background illustration — sloth (breathing) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.015, 1] }}
        transition={{ duration: 0.6, scale: { duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }}
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-20%',
          width: '140%',
          height: '120%',
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
        animate={{ opacity: 1, scale: [1, 1.012, 1] }}
        transition={{ duration: 0.5, delay: 0.2, scale: { duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' } }}
        style={{
          position: 'absolute',
          bottom: '-5%',
          right: '-15%',
          width: '50%',
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
          {/* Title — lifted with white halo */}
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
                textShadow: '0 0 16px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.5)',
              }}
            >
              starkare tillsammans
            </p>
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
                    ? '1px solid hsla(280, 40%, 55%, 0.40)'
                    : '1px solid hsla(280, 60%, 90%, 0.60)',
                  boxShadow: isDark
                    ? [
                        '0 6px 20px hsla(280, 50%, 10%, 0.22)',
                        '0 2px 6px hsla(0, 0%, 0%, 0.10)',
                        'inset 0 1px 0 hsla(280, 50%, 65%, 0.30)',
                      ].join(', ')
                    : [
                        '0 6px 20px hsla(280, 50%, 60%, 0.12)',
                        '0 2px 6px hsla(0, 0%, 0%, 0.04)',
                        'inset 0 2px 1px hsla(280, 80%, 95%, 0.55)',
                        'inset 0 -2px 4px hsla(280, 40%, 30%, 0.06)',
                      ].join(', '),
                  whiteSpace: 'normal' as const,
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
                    textShadow: isDark ? 'none' : '0 1px 4px hsla(280, 60%, 90%, 0.8)',
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

          {/* Diary entrance — Abyssal Purple anchor */}
          <motion.button
            variants={pillVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/diary/${product.id}`)}
            style={{
              background: 'rgba(36, 0, 70, 0.10)',
              border: '1px solid rgba(36, 0, 70, 0.15)',
              cursor: 'pointer',
              marginTop: '0.5vh',
              padding: '14px 24px',
              borderRadius: '16px',
              boxShadow: [
                '0 4px 14px hsla(280, 50%, 20%, 0.06)',
                'inset 0 1px 0 hsla(280, 40%, 85%, 0.30)',
              ].join(', '),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '58%',
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
                  color: 'hsl(280, 30%, 35%)',
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
