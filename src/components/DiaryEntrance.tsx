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
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate(`/diary/${productId}`)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: '72%',
          overflow: 'hidden',
          borderRadius: '20px',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            background: `linear-gradient(168deg, ${accentColor}12 0%, ${accentColor}08 50%, ${accentColor}04 100%)`,
            border: `1.5px solid ${accentColor}30`,
            boxShadow: [
              `0 4px 16px ${accentColor}18`,
              `0 1px 3px ${accentColor}10`,
              `inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
            ].join(', '),
            padding: '16px 20px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Book icon — larger, colored */}
          <motion.div
            animate={{ rotate: [0, -5, 0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: `${accentColor}18`,
              flexShrink: 0,
            }}
          >
            <BookOpen size={22} strokeWidth={1.5} style={{ color: accentColor }} />
          </motion.div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <span
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: 'clamp(16px, 4.2vw, 19px)',
                fontWeight: 400,
                color: textColor,
                lineHeight: 1.2,
              }}
            >
              Vår dagbok
            </span>
            <span
              style={{
                fontSize: 'clamp(10px, 2.8vw, 12px)',
                fontWeight: 500,
                color: textColor,
                opacity: 0.5,
                lineHeight: 1.3,
              }}
            >
              Samlade tankar & minnen
            </span>
          </div>

          {/* Subtle chevron */}
          <div style={{
            marginLeft: 'auto',
            color: accentColor,
            opacity: 0.4,
            fontSize: '16px',
            fontWeight: 300,
          }}>
            ›
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
