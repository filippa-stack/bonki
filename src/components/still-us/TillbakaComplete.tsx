/**
 * TillbakaComplete — Tillbaka card completion screen.
 */

import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';
import { RESTART_MIN_TILLBAKA } from '@/data/stillUsSequence';

interface TillbakaCompleteProps {
  tillbakaIndex: number;
  totalCompleted: number;
  onHome: () => void;
  onRestart?: () => void;
}

export default function TillbakaComplete({ tillbakaIndex, totalCompleted, onHome, onRestart }: TillbakaCompleteProps) {
  const canRestart = totalCompleted >= RESTART_MIN_TILLBAKA;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 32px',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}
      >
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: COLORS.emberGlow,
          marginBottom: '12px',
        }}>
          Tillbaka-kort klart ✨
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: COLORS.driftwood,
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Ni har gjort {totalCompleted} av 12 Tillbaka-kort. Nästa kommer om en månad.
        </p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onHome}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: COLORS.deepSaffron,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.bark,
            marginBottom: '12px',
          }}
        >
          Tillbaka hem
        </motion.button>

        {canRestart && onRestart && (
          <button
            onClick={onRestart}
            style={{
              background: 'none',
              border: `1px solid ${COLORS.emberGlow}30`,
              borderRadius: '12px',
              width: '100%',
              height: '48px',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: COLORS.emberGlow,
              cursor: 'pointer',
            }}
          >
            Börja om på djupet
          </button>
        )}
      </motion.div>
    </div>
  );
}
