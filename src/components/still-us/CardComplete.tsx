/**
 * CardComplete — Card completion screen with takeaway + dynamic heading.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK } from '@/lib/palette';

interface CardCompleteProps {
  cardIndex: number;
  cardTitle: string;
  onComplete: (takeaway: string) => void;
  onSkipTakeaway: () => void;
}

function getCompletionHeadline(cardIndex: number): string {
  if (cardIndex <= 6) return 'Ni är igång 🌱';
  if (cardIndex <= 13) return 'Ni går djupare 🌿';
  if (cardIndex <= 20) return 'Ni öppnar upp ✨';
  return 'Sista kortet 🎉';
}

export default function CardComplete({ cardIndex, cardTitle, onComplete, onSkipTakeaway }: CardCompleteProps) {
  const [takeaway, setTakeaway] = useState('');

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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}
      >
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: DRIFTWOOD,
          marginBottom: '8px',
          fontWeight: 600,
        }}>
          Vecka {cardIndex + 1} klar
        </p>

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '26px',
          fontWeight: 500,
          color: EMBER_GLOW,
          marginBottom: '24px',
        }}>
          {getCompletionHeadline(cardIndex)}
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: DRIFTWOOD,
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          Vad tar ni med er från den här veckan?
        </p>

        <textarea
          value={takeaway}
          onChange={(e) => setTakeaway(e.target.value)}
          placeholder="Vår takeaway..."
          rows={3}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: `${EMBER_GLOW}12`,
            border: `1px solid ${EMBER_GLOW}20`,
            color: EMBER_GLOW,
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            marginBottom: '24px',
          }}
        />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete(takeaway)}
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
            marginBottom: '8px',
          }}
        >
          Tillbaka hem
        </motion.button>

        <button
          onClick={onSkipTakeaway}
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
          Hoppa över
        </button>
      </motion.div>
    </div>
  );
}
