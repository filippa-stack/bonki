/**
 * SessionTwoStart — Session 2 reorientation screen.
 * Shows recap of Session 1 before starting Session 2.
 */

import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';

interface SessionTwoStartProps {
  cardIndex: number;
  cardTitle: string;
  reorientationText: string;
  session1Takeaway?: string;
  onStart: () => void;
}

export default function SessionTwoStart({
  cardIndex,
  cardTitle,
  reorientationText,
  session1Takeaway,
  onStart,
}: SessionTwoStartProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}
      >
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: COLORS.driftwood,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}>
          Del 2 av 2
        </p>

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: COLORS.emberGlow,
          marginBottom: '20px',
        }}>
          {cardTitle}
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: `${COLORS.emberGlow}90`,
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          {reorientationText}
        </p>

        {session1Takeaway && (
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: `${COLORS.emberGlow}10`,
            border: `1px solid ${COLORS.emberGlow}15`,
            marginBottom: '32px',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: COLORS.driftwood,
              fontWeight: 600,
              marginBottom: '4px',
            }}>
              Er takeaway från del 1
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.emberGlow,
              lineHeight: 1.5,
            }}>
              {session1Takeaway}
            </p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
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
          }}
        >
          Starta del 2
        </motion.button>
      </motion.div>
    </div>
  );
}
