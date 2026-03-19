/**
 * ReturnRitual — Dormancy return overlay (7+ days inactive).
 */

import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';

interface ReturnRitualProps {
  cardTitle: string;
  daysSinceLastActivity: number;
  onRestart: () => void;
  onContinue: () => void;
}

export default function ReturnRitual({ cardTitle, daysSinceLastActivity, onRestart, onContinue }: ReturnRitualProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: EMOTION, ease: [...EASE] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: EMBER_NIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: EMBER_GLOW,
          marginBottom: '12px',
        }}>
          Välkomna tillbaka
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: DRIFTWOOD,
          lineHeight: 1.6,
          marginBottom: '8px',
        }}>
          Det har gått {daysSinceLastActivity} dagar sedan ni var här senast.
        </p>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: `${EMBER_GLOW}80`,
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Ni var på <strong style={{ color: EMBER_GLOW }}>{cardTitle}</strong>. Vill ni börja om check-in för den veckan, eller fortsätta där ni var?
        </p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: DEEP_SAFFRON,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: BARK,
            marginBottom: '12px',
          }}
        >
          Börja om check-in
        </motion.button>

        <button
          onClick={onContinue}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: DRIFTWOOD,
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          Fortsätt där vi var
        </button>
      </div>
    </motion.div>
  );
}
