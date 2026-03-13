import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const EASE = [0.4, 0.0, 0.2, 1] as const;

const pillVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.93 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

interface DiaryEntranceProps {
  productId: string;
  /** Accent color for the warm glow (hex) */
  accentColor: string;
  /** Dark text color for the diary (hex) */
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
      {/* Sparkle divider */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
        transition={{
          opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 0.8, delay: 1.2 },
        }}
        style={{
          fontSize: '14px',
          color: 'var(--accent-saffron)',
          letterSpacing: '8px',
          marginBottom: '14px',
          textAlign: 'center',
        }}
      >
        ✦
      </motion.div>

      {/* The diary — warm, tactile, like an object */}
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.975 }}
        onClick={() => navigate(`/diary/${productId}`)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: '72%',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* Warm paper surface */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            background: 'linear-gradient(168deg, #FDF8F0 0%, #F5EFE4 50%, #EDE6D8 100%)',
            border: '1px solid hsla(36, 30%, 78%, 0.45)',
            boxShadow: [
              '0 2px 8px hsla(36, 25%, 45%, 0.08)',
              '0 1px 2px hsla(36, 20%, 40%, 0.05)',
              'inset 0 1px 0 hsla(40, 40%, 96%, 0.7)',
            ].join(', '),
            padding: '20px 24px 18px',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Spine accent — left edge, like a book binding */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '12px',
              bottom: '12px',
              width: '3px',
              borderRadius: '0 2px 2px 0',
              background: `linear-gradient(180deg, ${accentColor}55 0%, ${accentColor}22 100%)`,
            }}
          />

          {/* Ambient warmth */}
          <motion.div
            animate={{ opacity: [0.15, 0.30, 0.15] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: '-30%',
              background: `radial-gradient(ellipse at 50% 30%, hsla(41, 78%, 48%, 0.08) 0%, transparent 65%)`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          {/* Title row */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <motion.div
              animate={{ rotate: [0, -4, 0, 4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BookOpen size={17} style={{ color: textColor, opacity: 0.50, flexShrink: 0 }} />
            </motion.div>
            <span
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(17px, 4.5vw, 20px)',
                fontWeight: 400,
                color: textColor,
                lineHeight: 1.3,
              }}
            >
              Vår dagbok
            </span>
          </div>

          {/* Poetic subtitle */}
          <p
            className="font-serif"
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '12px',
              color: 'var(--accent-saffron)',
              opacity: 0.65,
              fontStyle: 'italic',
              lineHeight: 1.3,
              letterSpacing: '0.03em',
            }}
          >
            Era tankar, samlade ✦
          </p>
        </div>
      </motion.button>
    </motion.div>
  );
}
