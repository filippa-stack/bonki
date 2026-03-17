/**
 * SliderHandoff — Tier 2 same-device handoff screen.
 * Shown after user A completes sliders, prompts device pass to partner B.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK } from '@/lib/palette';

interface SliderHandoffProps {
  partnerName: string;
  cardIndex: number;
  onPartnerReady: () => void;
  onSkip?: () => void;
}

export default function SliderHandoff({ partnerName, cardIndex, onPartnerReady, onSkip }: SliderHandoffProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: EMBER_NIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{ textAlign: 'center', maxWidth: '320px' }}
      >
        {!confirmed ? (
          <>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              fontWeight: 500,
              color: EMBER_GLOW,
              marginBottom: '16px',
              lineHeight: 1.35,
            }}>
              Lämna över till {partnerName}
            </p>

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: DRIFTWOOD,
              lineHeight: 1.6,
              marginBottom: '40px',
            }}>
              Räck över telefonen så att {partnerName} kan göra sin check-in för vecka {cardIndex + 1}.
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setConfirmed(true)}
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
              }}
            >
              Jag har lämnat över
            </motion.button>
          </>
        ) : (
          <>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              fontWeight: 500,
              color: EMBER_GLOW,
              marginBottom: '16px',
              lineHeight: 1.35,
            }}>
              Hej {partnerName} 👋
            </p>

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: DRIFTWOOD,
              lineHeight: 1.6,
              marginBottom: '40px',
            }}>
              Det är din tur att svara på veckans check-in. Dina svar är privata tills ni ser dem tillsammans.
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onPartnerReady}
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
              }}
            >
              Starta check-in
            </motion.button>
          </>
        )}

        {onSkip && !confirmed && (
          <button
            onClick={onSkip}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: DRIFTWOOD,
              cursor: 'pointer',
              marginTop: '16px',
              padding: '8px',
            }}
          >
            Hoppa över
          </button>
        )}
      </motion.div>
    </div>
  );
}
