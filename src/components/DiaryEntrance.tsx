import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const SAFFRON = '#DA9D1D';

const pillVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.93 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

interface DiaryEntranceProps {
  productId: string;
  accentColor: string;
  textColor: string;
}

export default function DiaryEntrance({ productId, accentColor, textColor }: DiaryEntranceProps) {
  const navigate = useNavigate();

  return (
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
      <motion.button
        whileHover={{ scale: 1.04, y: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/diary/${productId}`)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: '82%',
          overflow: 'hidden',
          borderRadius: '22px',
        }}
      >
        {/* Ambient saffron glow behind */}
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '140%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${SAFFRON}30 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            borderRadius: '22px',
            background: `linear-gradient(145deg, ${accentColor}1A 0%, ${accentColor}10 40%, ${SAFFRON}12 100%)`,
            border: `1.5px solid ${accentColor}35`,
            boxShadow: [
              `0 6px 24px ${accentColor}20`,
              `0 2px 8px ${SAFFRON}18`,
              `inset 0 1px 0 rgba(255, 255, 255, 0.65)`,
              `inset 0 -1px 0 ${accentColor}10`,
            ].join(', '),
            padding: '18px 22px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {/* Sparkle icon with gentle pulse */}
          <motion.div
            animate={{ rotate: [0, 8, -4, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${SAFFRON}28 0%, ${accentColor}20 100%)`,
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} strokeWidth={1.5} style={{ color: SAFFRON }} />
          </motion.div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
            <span
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(17px, 4.5vw, 20px)',
                fontWeight: 400,
                color: textColor,
                lineHeight: 1.2,
              }}
            >
              Vår dagbok
            </span>
            <span
              style={{
                fontSize: 'clamp(10.5px, 2.9vw, 12.5px)',
                fontWeight: 500,
                color: textColor,
                opacity: 0.6,
                lineHeight: 1.3,
                letterSpacing: '0.01em',
              }}
            >
              Samlade tankar & minnen ✦
            </span>
          </div>

          {/* Animated chevron */}
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              marginLeft: 'auto',
              color: SAFFRON,
              opacity: 0.7,
              fontSize: '20px',
              fontWeight: 300,
            }}
          >
            ›
          </motion.div>
        </div>
      </motion.button>
    </motion.div>
  );
}